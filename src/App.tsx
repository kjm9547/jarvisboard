import "./App.css";
import { Index } from "./pages/main";
import { Route, Routes } from "react-router-dom";
import { StockDashboard } from "./pages/stock/StockDashboard";
import { MainLayout } from "@/layouts/main/MainLayout";
import YoutubeDashboard from "./pages/youtube/YouTubeDashboard";
import { LoginPage } from "./pages/auth/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ExpenseDashboard } from "./pages/expense/ExpenseDashboard";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/stock" element={<StockDashboard />} />
          <Route path="/youtube" element={<YoutubeDashboard />} />
          <Route path="/expense" element={<ExpenseDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
