import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import KagePage from "./pages/Kage";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/kage" element={<KagePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
