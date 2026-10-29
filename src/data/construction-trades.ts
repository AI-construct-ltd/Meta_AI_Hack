export interface Trade {
  id: string;
  name: string;
  category: "Structural & Framing" | "Mechanical & Systems" | "Finishing" | "Furniture & Interior" | "Civil & Heavy" | "Specialty";
  description: string;
  skills: string[];
  moduleSlug?: string;
  linkHref?: string;
}

export const CONSTRUCTION_TRADES: Trade[] = [
  {
    id: "carpenter",
    name: "Carpenter",
    category: "Structural & Framing",
    description:
      "A craftsperson who performs carpentry, building mainly with wood. Among carpentry's subsidiary trades are framer, cladder, joiner, cabinet maker, millworker, deck builder, furniture maker, interior and exterior trim carpenter, and siding installer. Carpenters unions typically encompass drywall installers, lathers, flooring installers, and millwrights.",
    skills: ["Wall & Roof Framing", "Subfloors & Joists", "Exterior Siding & Trim", "Cabinetry & Millwork", "Drywall & Sheathing"],
    moduleSlug: "wall-framing-2x4",
  },
  {
    id: "mason",
    name: "Mason",
    category: "Structural & Framing",
    description:
      "A tradesperson skilled in brick and blocklaying, and concrete placement, finishing, protecting, and repairing. Also includes stonemason, marble setter, tile setter, and terrazzo worker.",
    skills: ["Continuous Concrete Footings", "CMU Stem Walls", "Brickwork & Mortar", "Anchor Bolt Placement", "Flatwork & Slabs"],
    moduleSlug: "foundation-mudsill-assembly",
  },
  {
    id: "roofer",
    name: "Roofer",
    category: "Structural & Framing",
    description:
      "A tradesperson who specializes in roof construction. Roofers replace, repair, and install roof systems including asphalt architectural shingles, standing-seam metal, tile, and low-slope waterproof membranes.",
    skills: ["Rafter & Truss Framing", "Roof Sheathing & H-Clips", "Underlayment & Ice Shield", "Step & Valley Flashing", "Ridge Vents"],
    moduleSlug: "gable-roof-framing",
  },
  {
    id: "ironworker",
    name: "Ironworker (Steel Erector)",
    category: "Structural & Framing",
    description:
      "Erects or dismantles structural steel frames, trusses, and girders. Installation is typically crane-assisted from mobile elevated platforms or scissor lifts, bolting connections with torque wrenches and field welding.",
    skills: ["Structural Steel Erection", "High-Strength Bolting", "Rigging & Signal Coordination", "Crane Pick Planning", "Field Welding"],
  },
  {
    id: "steel-fixer",
    name: "Steel Fixer (Rodbuster)",
    category: "Structural & Framing",
    description:
      "Positions and secures reinforcing steel bars (rebar) and wire mesh used to reinforce concrete in footings, slabs, foundation walls, columns, and beams.",
    skills: ["Rebar Layout & Spacing", "Tie Wire Techniques", "Bar Bending & Splicing", "Footing & Wall Cages", "Clearance Chairs & Spacers"],
    moduleSlug: "foundation-mudsill-assembly",
  },
  {
    id: "pile-driver",
    name: "Pile Driver",
    category: "Structural & Framing",
    description:
      "Installs deep foundation piles (timber, steel H-piles, pipe piles, precast concrete), drills shafts, and constructs retention elements to support heavy loads in poor soils.",
    skills: ["Deep Foundation Piles", "Impact & Vibratory Hammers", "Sheet Piling & Shoring", "Drilled Shafts & Caissons", "Load Testing"],
  },
  {
    id: "fencer",
    name: "Fencer",
    category: "Structural & Framing",
    description:
      "Builds and installs perimeter fences, privacy screening, security barriers, and gates using wood, chain-link, ornamental iron, and vinyl.",
    skills: ["Post Hole Digging & Leveling", "Concrete Post Footings", "Horizontal Rails & Slats", "Gate Hardware & Latches"],
  },
  {
    id: "electrician",
    name: "Electrician",
    category: "Mechanical & Systems",
    description:
      "Specializes in electrical wiring of buildings and related equipment. Employed in construction of new electrical systems or maintenance, including service panels, conduit rough-in, power distribution, HVAC connections, and telecommunications.",
    skills: ["Service Entrance Panels", "EMT & NM Cable Rough-In", "Grounding & Bonding", "Branch Circuits & Outlets", "Switchgear & Breakers"],
  },
  {
    id: "plumber",
    name: "Plumber",
    category: "Mechanical & Systems",
    description:
      "Specializes in installing and maintaining systems for potable drinking water, drainage, DWV venting, waste plumbing, natural gas piping, and water heating.",
    skills: ["DWV Rough-In & Venting", "PEX & Copper Water Supply", "Sewer Tie-Ins", "Pressure Testing", "Fixture Trim-Out"],
  },
  {
    id: "pipefitter",
    name: "Pipefitter / Steamfitter",
    category: "Mechanical & Systems",
    description:
      "Lays out, assembles, fabricates, maintains, and repairs large-diameter and high-pressure piping systems for industrial processing, steam generation, heating, and chilled-water systems.",
    skills: ["High-Pressure Steam Piping", "Pipe Flanging & Threading", "Orbital & Shielded Welding", "Hydrostatic Testing", "Hydronic Chillers"],
  },
  {
    id: "hvac-tech",
    name: "HVAC Technician",
    category: "Mechanical & Systems",
    description:
      "Specializes in installation, balancing, and service of air conditioning, heating, ventilation, ductwork, heat pumps, and refrigeration systems.",
    skills: ["Refrigerant Charging", "Ductwork Fabrication", "Airflow Balancing (CFM)", "Furnace & Heat Pump Controls", "Thermostats & Zoning"],
  },
  {
    id: "sheet-metal-worker",
    name: "Sheet Metal Worker",
    category: "Mechanical & Systems",
    description:
      "Fabricates, installs, and maintains sheet-metal ductwork, architectural metal roofing, chimney caps, gravel stops, gutters, and downspouts.",
    skills: ["Sheet Metal Layout & Forming", "Duct Seaming & S-Cleats", "Flashing & Counter-Flashing", "Bending Brakes & Shears"],
  },
  {
    id: "elevator-mechanic",
    name: "Elevator Mechanic",
    category: "Mechanical & Systems",
    description:
      "Installs, adjusts, and services vertical lift and passenger transporting equipment including traction elevators, hydraulic lifts, escalators, and moving walkways.",
    skills: ["Hoistway Rails Alignment", "Hydraulic Pistons & Pumps", "Traction Cables & Counterweights", "Electronic Safety Interlocks"],
  },
  {
    id: "linemen",
    name: "Lineman",
    category: "Mechanical & Systems",
    description:
      "Constructs and maintains high-voltage transmission lines, utility poles, underground primaries, transformers, and substation power equipment.",
    skills: ["High-Voltage Splices", "Pole Climbing & Bucket Operations", "Transformer Rigging", "Substation Switchgear", "Live-Line Tools"],
  },
  {
    id: "boilermaker",
    name: "Boilermaker",
    category: "Mechanical & Systems",
    description:
      "Fabricates and repairs commercial boilers, pressure vessels, heat exchangers, vats, and tanks in refineries, power plants, and industrial complexes.",
    skills: ["Heavy Plate Fabrication", "Pressure Vessel Fitting", "Tube Rolling & Expanding", "Non-Destructive Testing", "Rigging"],
  },
  {
    id: "drywall-plasterer",
    name: "Plasterer",
    category: "Finishing",
    description:
      "Applies interior plaster, veneer plaster coats, acoustic plaster, decorative moldings on ceilings and walls, and exterior stucco finishes.",
    skills: ["Lath Backing Installation", "Scratch & Brown Coats", "Finish Plaster Skimming", "Drywall Finishing", "Stucco & EIFS"],
    moduleSlug: "partition-tee-framing",
  },
  {
    id: "painter",
    name: "Painter & Decorator",
    category: "Finishing",
    description:
      "Prepares surfaces, applies primers, paints, stains, and protective coatings to residential, commercial, and industrial buildings; includes paper hangers.",
    skills: ["Surface Prep & Masking", "Airless Spray Application", "Cut-In Brush Technique", "Staining & Clear Coats", "Protective Epoxy"],
  },
  {
    id: "glazier",
    name: "Glazier",
    category: "Finishing",
    description:
      "Measures, cuts, fits, and installs architectural glass in building envelopes, storefronts, curtain walls, windows, skylights, and interior balustrades.",
    skills: ["Curtain Wall Glazing", "Thermal Window Seals", "Storefront Extrusions", "Safety & Tempered Glass", "Structural Sealants"],
    moduleSlug: "window-rough-opening",
  },
  {
    id: "insulation-installer",
    name: "Insulation Installer",
    category: "Finishing",
    description:
      "Installs thermal and acoustical insulation materials (batts, blown-in cellulose, rigid board, spray foam) and mechanical pipe/duct coatings and firestopping.",
    skills: ["Cavity Batt Installation", "Spray Foam R-Value Control", "Air Barrier Sealing", "Vapor Retarders", "Mechanical Pipe Insulation"],
  },
  {
    id: "interiors",
    name: "Interiors",
    category: "Furniture & Interior",
    description:
      "Assembly, fitting, and installation of interior furniture, modular living systems, casework, and room layouts. Master 3D step-by-step assemblies across 2,180+ interior models.",
    skills: ["Flat-Pack Assembly", "Cam Locks & Fasteners", "Modular Cabinetry", "Drawer Slides & Hinges", "2,180+ 3D Interior Models"],
    linkHref: "/interiors",
    moduleSlug: "kallax-2x2",
  },
  {
    id: "cabinet-maker",
    name: "Cabinet Maker & Millworker",
    category: "Furniture & Interior",
    description:
      "Craftsperson specializing in architectural millwork, custom cabinetry, built-in wardrobes, casework, and countertop installations.",
    skills: ["Face-Frame & Frameless Cabinets", "Pocket Hole & Dado Joints", "Laminate & Solid Surfaces", "Concealed Euro Hinges", "Crown & Scribe Molding"],
    linkHref: "/interiors",
  },
  {
    id: "interior-trim",
    name: "Interior Trim Carpenter",
    category: "Furniture & Interior",
    description:
      "Installs interior moldings, baseboards, door casings, window stools, aprons, crown moldings, and interior doors with miter and coped joints.",
    skills: ["Coped Inside Corners", "Baseboards & Shoe Molding", "Pre-Hung Door Installation", "Window Casing & Sill Trim", "Stair Stringers & Trim"],
    moduleSlug: "stair-stringer-assembly",
  },
  {
    id: "carpet-flooring",
    name: "Carpet Layer & Flooring Installer",
    category: "Furniture & Interior",
    description:
      "Specializes in laying carpet, sheet linoleum, vinyl plank (LVP), and resilient tile flooring, including subfloor leveling and edge transition trims.",
    skills: ["Subfloor Moisture & Flatness Prep", "Tack Strips & Padding", "Carpet Stretching & Seaming", "Sheet Linoleum Heat-Welding", "Transitions"],
    moduleSlug: "shed-floor-deck",
  },
  {
    id: "heavy-equipment-operator",
    name: "Heavy Equipment Operator",
    category: "Civil & Heavy",
    description:
      "Operates heavy engineering equipment including excavators, bulldozers, backhoes, motor graders, scrapers, concrete boom pumps, trenchers, and pavement breakers.",
    skills: ["Excavator Trenching & Grading", "Bulldozer Site Leveling", "Laser-Guided Grade Stakes", "Compactor Operation", "Pre-Shift Safety Inspection"],
  },
  {
    id: "crane-operator",
    name: "Crane Operator",
    category: "Civil & Heavy",
    description:
      "Certified operator of tower cranes, rough-terrain mobile cranes, crawler cranes, and overhead gantries to hoist structural lumber, steel, and concrete panels.",
    skills: ["Load Chart Calculation", "Outrigger Soil Bearing Setup", "Blind Lift Signaling", "Boom Deflection Management", "Rigging Inspections"],
  },
  {
    id: "pipelayer",
    name: "Pipelayer",
    category: "Civil & Heavy",
    description:
      "Assembles and lays pipes for storm sewers, sanitary sewer mains, municipal water infrastructure, and culverts, grading trenches to exacting laser slopes.",
    skills: ["Pipe Laser Elevation Setup", "Trench Shoring & Trench Boxes", "Gasket & Bell Joint Assembly", "Backfilling & Compaction"],
  },
  {
    id: "dredger",
    name: "Dredger",
    category: "Civil & Heavy",
    description:
      "Operates dredging vessels and excavation barges to deepen waterways, clear harbors, reclaim land, and position hydraulic fill placement pipelines.",
    skills: ["Cutterhead Dredging", "Hydraulic Slurry Pumping", "Spud Positioning", "Pipeline Anchor Shifting", "Bathymetric Depth Sounding"],
  },
  {
    id: "truck-driver",
    name: "Truck Driver",
    category: "Civil & Heavy",
    description:
      "Operates heavy commercial highway and on-site trucks: dump trucks, heavy equipment lowboys, concrete ready-mix trucks, and lumber delivery tractor-trailers.",
    skills: ["CDL Heavy Combination Driving", "Load Securement & Tie-Downs", "Dump Bed Dumping & Spreading", "Over-Dimensional Routing", "Site Maneuvering"],
  },
  {
    id: "laborer",
    name: "Construction Craft Laborer",
    category: "Specialty",
    description:
      "Skilled worker proficient with pneumatic tools, power compactors, demolition equipment, concrete placing, site setup, scaffolding, and multi-trade assistance.",
    skills: ["Concrete Vibrating & Screeding", "Pneumatic Jackhammers", "Trench Shoring", "Scaffold Erection", "Rigging & Material Staging"],
  },
  {
    id: "landscaper",
    name: "Landscaper",
    category: "Specialty",
    description:
      "Specializes in final site grading, commercial irrigation lines, retaining walls, decorative stone hardscapes, erosion control blankets, and tree planting.",
    skills: ["Slope & Swale Grading", "Retaining Wall Tiering", "Subsurface Drainage Systems", "Commercial Sprinkler Zones", "Hardscape Pavers"],
  },
  {
    id: "millwright",
    name: "Millwright",
    category: "Specialty",
    description:
      "Installs, levels, aligns, and maintains heavy industrial production equipment, turbines, conveyor networks, industrial generators, and automated manufacturing lines.",
    skills: ["Laser Shaft Alignment", "Precision Machine Grouting", "Optical Leveling", "Heavy Machine Rigging", "Gearboxes & Bearings"],
  },
  {
    id: "sign-display",
    name: "Sign Display Worker",
    category: "Specialty",
    description:
      "Constructs, frames, and installs commercial architectural signage, digital billboards, illuminated channel letters, and structural exterior display fixtures.",
    skills: ["Structural Sign Mounting", "Ballast & LED Wiring", "Wind Load Fastening", "Bucket Truck Installation", "Pylon Anchoring"],
  },
];
