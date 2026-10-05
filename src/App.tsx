import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import KagePage from "./pages/Kage";
import NotFound from "./pages/NotFound";
import OpeningLoader from "./components/OpeningLoader";

const App = () => (
  <OpeningLoader><BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/kage" element={<KagePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter></OpeningLoader>
);

export default App;
