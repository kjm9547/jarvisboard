import "./App.css";
import { NewsCardContainer } from "./pages/main/news/NewsCardContainer";
import { Index } from "./pages/main";
import { Route, Routes } from "react-router-dom";
import { StockDashboard } from "./pages/stock/StockDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/stock" element={<StockDashboard />} />
    </Routes>
  );
}

export default App;
