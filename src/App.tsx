import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { lazy, Suspense } from "react";
import RouteMetadata from "./components/RouteMetadata";
import NotFound from "./pages/NotFound";
import OpeningLoader from "./components/OpeningLoader";

const KagePage = lazy(() => import("./pages/Kage"));

const App = () => (
  <OpeningLoader><BrowserRouter>
    <RouteMetadata />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/kage" element={<Suspense fallback={<p role="status">Loading design reference…</p>}><KagePage /></Suspense>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter></OpeningLoader>
);

export default App;
