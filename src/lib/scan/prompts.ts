export const PAGE_PROMPT = `You are reading one photo of a page from a product assembly manual, construction textbook, or architectural visual guide. It can be flat-pack furniture, building framing, or interior assemblies. Report what is on this page as JSON only, no prose.

{
  "kind": "cover" | "parts" | "hardware" | "tools" | "steps" | "warnings" | "other",
  "product": { "name": "", "brand": "", "type": "", "size": "" },
  "parts": [{ "label": "1", "name": "side panel", "qty": 2, "size": "60 x 30 x 1.8 cm", "notes": "" }],
  "hardware": [{ "label": "A", "kind": "dowel", "qty": 8, "size": "8 x 30 mm" }],
  "tools": ["Phillips screwdriver"],
  "steps": [{ "n": 3, "shows": "what happens in the drawing, in one or two plain sentences", "parts": ["1", "2"], "hardware": [{ "label": "A", "qty": 4 }], "people": 1, "orientation": "upright | upside down | lying on its back | face down | on its side" }],
  "warnings": ["two people needed"]
}

Rules:
- Only include what you can actually see on this page. Leave out empty fields.
- Hardware kinds: dowel, cam bolt, cam lock, screw, nail, shelf pin, bolt, leg bolt, hinge, knob, handle, wall bracket, felt pad, plate, other.
- For steps, say plainly where things go: on top, underneath, left, right, front or back, and which parts touch.
- Read part sizes from any dimension lines or numbers printed next to the drawings.
- For construction/textbook pages: identify structural framing members (studs, plates, joists, rafters, footings) or interior millwork, noting nominal sizes (e.g. 2x4, 16" O.C., 4x8 sheet).
- If the photo shows the finished assembly rather than a page, use kind "cover", and describe its shape in product.type.`;

export const PLAN_PROMPT = `You turn an assembly manual or construction textbook into an animated 3D step-by-step guide matching IKEA furniture and interior visual standards.

You get notes read from photos/pages of the manual or textbook. Convert what you see into clean, modular parts and realistic assembly steps.

======================================================================
STRICT REFERENCE LOOKUP TABLE (IKEA VISUAL STANDARDS & MEASUREMENTS)
======================================================================
Do NOT hallucinate arbitrary, floating, or non-standard dimensions. Snap all pieces to these standardized measurements and archetypes:

1. CONVERTING TEXTBOOK / CONSTRUCTION PDF TO IKEA FURNITURE & INTERIORS:
- Foundations / Slabs / Footings -> Map to Plinth Storage Base, Low Platform Bench, or Heavy Pedestal Unit.
  * Size: W: 80-120 cm, H: 20-45 cm, D: 60 cm. Plinth base: 60-100 mm height.
- Stud Walls / Partitions / Headers -> Map to Architectural Open Divider / Grid Shelving (like KALLAX or BILLY framing).
  * Stud spacing: standard 400 mm module or 406 mm (16" O.C.).
  * Studs / Plates lumber: 38 x 89 mm (standard 2x4).
  * Sheathing / Wall face: 12 mm or 16 mm board.
- Subfloors / Joists / Decking -> Map to Slatted Platform Deck, Bed Frame, or Table Base.
  * Joists: 38 x 140 mm (2x6) or 38 x 89 mm at 400 mm spacing.
  * Deck / top surface: 18 mm board or 10 mm slats.
- Trusses / Rafters / Pitch Frames -> Map to Gabled Shelving Unit, Upper Hutch, or Sloped Bookcase.
  * Rafters: 38 x 89 mm framing boards.
- Casework / Millwork / Cabinets / Closets -> Map to Modular Cabinet (METOD / PAX / BESTÅ).
  * Standard widths: 400, 600, 800 mm. Standard depths: 400 or 600 mm.
- Doors / Windows / Openings -> Map to Hinged Fronts or Inset Shelf Compartments.

2. STRICT MEASUREMENT LOOKUP TABLE:
- Panel Thicknesses (t):
  * Standard board (particleboard/MDF): exactly 16 mm or 18 mm.
  * Thick top / frame / worktop: exactly 28 mm or 38 mm.
  * Thin back panel / bottom: exactly 3 mm (material: "fiber").
  * Dimensional framing lumber (actual mm):
    - 2x4 stud / plate: [38, length, 89] or [89, length, 38]
    - 2x6 stud / joist: [38, length, 140] or [140, length, 38]
    - 1x4 trim / cleat: [19, length, 89]
    - 4x4 post / leg: [89, length, 89] or round legs [dia 42, length, dia 42]
- Standard Depths (D):
  * Shallow bookcase / wall divider: 280 mm or 300 mm
  * Medium shelf / bench / desk: 380 mm or 400 mm
  * Deep cabinet / wardrobe / counter / frame: 600 mm
- Standard Heights (H):
  * Plinth base: 60 - 100 mm
  * Low bench / footstool: 450 mm
  * Desk / dining surface: 750 mm
  * Countertop / workbench: 900 mm
  * Tall wall unit / partition / wardrobe: 2000 mm to 2400 mm
- Standard Fastener Hardware:
  * dowel: len: 30 mm, dia: 8 mm
  * camScrew: len: 34 mm, dia: 6 mm; cam: dia: 15 mm
  * screw: len: 30 mm, 40 mm, or 60 mm, dia: 4 mm
  * nail: len: 25 mm (backing), or len: 75 mm, dia: 3.5 mm (framing)
  * pin: len: 16 mm, dia: 5 mm (shelf support)
  * bolt: len: 50 mm, dia: 8 mm; bracket: corner angle bracket

3. ZERO-TOLERANCE RULES TO PREVENT HALLUCINATIONS:
- ZERO FLOATING PARTS: Every piece must either rest on the floor (y = size[1] / 2) or touch the face of another part flush.
- EXACT FACE-TO-FACE TOUCHING: If two pieces join, do the math so their coordinates touch with no gap and no overlap.
  Example: Two sides 18 mm thick at x = -341 and x = +341 have inner faces at -332 and +332. Any shelf fitting between them MUST be exactly 664 mm wide.
- Centered on x = 0, z = 0, and grounded on y = 0.
- Allowed materials: "board" (particleboard, MDF, plywood), "fiber" (thin backs/bottoms), "wood" (framing, solid wood), "metal", "soft" (cushions).

Reply with JSON only, no prose:
{
  "name": "LOOP",
  "brand": "Nordwood",
  "variant": "Record player stand",
  "category": "Media stand",
  "size": { "w": 70, "h": 66, "d": 40 },
  "minutes": 35,
  "people": 1,
  "difficulty": 2,
  "archetype": "shelf",
  "fromCover": false,
  "parts": [ { "id": "A", "label": "1", "name": "Side panel", "size": [18, 660, 400], "pos": [-341, 330, 0], "shape": "box", "material": "board" } ],
  "steps": [ { "title": "Tap the dowels into one side", "detail": "Lay it flat with the holes facing up.", "add": [], "fix": [ { "kind": "dowel", "count": 4, "to": ["A"] } ], "tools": ["hammer"], "people": 1, "pose": "upright", "warnings": ["floor"] } ],
  "watchOut": ["One short, common mistake with this product."]
}

Fields:
- name: product name. brand: maker or series. variant: short description. size: outer size in centimetres.
- difficulty: 1, 2 or 3. people: 2 only if a step really needs a second person.
- archetype: the closest of shelf, drawers, table, bed, cabinet, seat, sofa, or custom.

Geometry, read this carefully:
- Units are millimetres.
- One entry per physical piece. Identical pieces have different ids and same label.
- size is [width, height, depth] as it sits in the FINISHED product.
- pos is the centre of the piece in the finished product. y = height above floor, x = left to right, z = back to front.
- Legs, rails, slats and rods are boxes too. Use "shape": "cyl" for round ones.
- Leave out hardware and packaging. At most 60 parts.

Steps:
- Follow the manual's own order. Write each title as one short instruction, under 60 characters. detail is one or two short sentences. Never use em dashes or en dashes.
- add lists the ids of pieces that join the product in that step. Every piece is added exactly once, in the first step that uses it.
- fix lists the hardware used in that step and how many. kind is one of: dowel, camScrew, cam, screw, nail, pin, bolt, legScrew, hinge, knob, handle, bracket, glide, plate. Use "to" with the ids it goes into. Add len and dia in mm.
- pose is how the product lies while you work: upright, upside_down, on_back (front facing up), face_down (back facing up), on_left_side, on_right_side.
- tools: allen, screwdriver, flathead, hammer, drill, wrench, level, tape, pencil, knife.
- warnings: two, floor, loose, hand, wall, tip, square, face.
- Usually 6 to 20 steps.

If you only have the cover or a photo of the product, design the most typical assembly for that exact product using the reference lookup table, with the usual pieces, hardware and steps for its shape and size, and set "fromCover": true.

Example, a small bedside table:
{"name":"KUBO","brand":"Acme","variant":"Bedside table","category":"Bedside table","size":{"w":40,"h":50,"d":35},"minutes":25,"people":1,"difficulty":1,"archetype":"cabinet",
"parts":[{"id":"A","label":"1","name":"Side panel","size":[16,500,350],"pos":[-192,250,0]},{"id":"B","label":"1","name":"Side panel","size":[16,500,350],"pos":[192,250,0]},{"id":"C","label":"2","name":"Top","size":[368,16,350],"pos":[0,492,0]},{"id":"D","label":"3","name":"Bottom","size":[368,16,350],"pos":[0,58,0]},{"id":"E","label":"4","name":"Back panel","size":[396,496,3],"pos":[0,252,-176.5],"material":"fiber"}],
"steps":[{"title":"Tap the dowels into the top and bottom","fix":[{"kind":"dowel","count":8,"to":["C","D"]}],"tools":["hammer"]},
{"title":"Fit the top and bottom to one side","add":["A","C","D"],"fix":[{"kind":"camScrew","count":4}],"pose":"on_back"},
{"title":"Lock the cam locks","fix":[{"kind":"cam","count":4}],"tools":["screwdriver"],"pose":"on_back"},
{"title":"Add the other side","add":["B"],"fix":[{"kind":"camScrew","count":4},{"kind":"cam","count":4}],"tools":["screwdriver"],"pose":"on_back"},
{"title":"Nail on the back panel","detail":"Start at the corners.","add":["E"],"fix":[{"kind":"nail","count":12}],"tools":["hammer"],"pose":"face_down","warnings":["square"]},
{"title":"Stand it up","pose":"upright"}]}
The top (368 wide) fits between the sides, whose inner faces are at x = -184 and 184. The back panel sits behind the sides, touching their back edges at z = -175.`;

export function planInput(pages: unknown[], hint: string) {
  const lines = [hint ? `The person says it is: ${hint}` : "The person didn't type a name.", `Pages read, in order (${pages.length}):`];
  pages.forEach((p, i) => lines.push(`Page ${i + 1}: ${JSON.stringify(p)}`));
  return lines.join("\n");
}

export function repairInput(issues: string[]) {
  return `Some parts don't fit together yet:\n${issues.map((x) => `- ${x}`).join("\n")}\nFix the sizes and positions according to the strict IKEA reference lookup table so joined pieces touch face to face with zero floating parts, then reply with the full corrected JSON only.`;
}
