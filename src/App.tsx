import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import RepuestosPage from "./RepuestosPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/repuestos" element={<RepuestosPage />} />
      </Routes>
    </BrowserRouter>
  );
}
