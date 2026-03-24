import "./App.css";
import { NewsCardContainer } from "./pages/main/news/NewsCardContainer";
import { Index } from "./pages/main";
import { Route, Routes } from "react-router-dom";
import { StockDashboard } from "./pages/stock/StockDashboard";
import { MainLayout } from "@/layouts/main/MainLayout";
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/stock" element={<StockDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
