import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { profileSchema, siteUrl } from "../seo";

export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const home = pathname === "/";
    document.title = home ? "Saad AR — AI, Web & Mobile Developer" : pathname === "/kage" ? "Design reference — Saad AR" : "Page not found — Saad AR";
    document.querySelector('meta[name="robots"]')?.setAttribute("content", home ? "index, follow, max-image-preview:large" : "noindex, follow");
    if (home) {
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
      canonical.href = siteUrl;
      if (!document.getElementById("profile-schema")) {
        const schema = document.createElement("script");
        schema.id = "profile-schema";
        schema.type = "application/ld+json";
        schema.textContent = JSON.stringify(profileSchema);
        document.head.append(schema);
      }
    } else {
      document.querySelector('link[rel="canonical"]')?.remove();
      document.getElementById("profile-schema")?.remove();
    }
  }, [pathname]);
  return null;
}
