import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import RepuestosPage from "./RepuestosPage";
import RepuestosDetail from "./RepuestosDetail";
import { SSEProvider } from "./SSEProvider";

export default function App() {
  return (
    <SSEProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/repuestos" element={<RepuestosPage />} />
          <Route path="/repuestos/:sku" element={<RepuestosDetail />} />
        </Routes>
      </BrowserRouter>
    </SSEProvider>
  );
}
