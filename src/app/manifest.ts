import type { MetadataRoute } from "next";

/** Add to home screen: opens straight into the search, full screen, in the page's own colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AIConstruct: 3D Construction & Framing Manuals",
    short_name: "AIConstruct",
    description: "Interactive 3D visual training manuals for carpentry and construction apprentices.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#f8fafc",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
