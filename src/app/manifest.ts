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
      { src: "/aiconstruct%20logos+favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/aiconstruct%20logos+favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { src: "/aiconstruct%20logos+favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/aiconstruct%20logos+favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
