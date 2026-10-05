import { renderToString } from "react-dom/server";
import CinematicPortfolio from "./components/CinematicPortfolio";
export { siteUrl, profileSchema } from "./seo";

// Use the same content as the interactive homepage, without a blocking loader.
export function render() {
  return renderToString(<CinematicPortfolio />);
}
