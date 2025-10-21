export function switchLangInPathname(pathname: string, nextLang: "fa" | "en") {
  const parts = pathname.split("/");
  parts[1] = nextLang;
  return parts.join("/") || `/${nextLang}`;
}

export function langOfPathname(pathname: string): "fa" | "en" {
  const seg = pathname.split("/")[1];
  return seg === "en" ? "en" : "fa";
}