// Runs before paint to set the theme attribute, preventing a light/dark flash.
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("cc_theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
