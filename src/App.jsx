import "./index.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Toast from "./components/common/Toast";
import LandingPage from "./features/landing/LandingPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ProfilePage from "./features/dashboard/ProfilePage";
import MarketplacePage from "./features/marketplace/MarketplacePage";
import ListingDetailPage from "./features/marketplace/ListingDetailPage";
import AboutPage from "./features/landing/AboutPage";
import CreateListingPage from "./features/dashboard/CreateListingPage";
import ChatWidget from "./components/common/ChatWidget";
import TransactionDetailPage from './features/transactions/TransactionDetailPage'
import RequireAuth from "./components/shared/RequireAuth";

function AppRoutes() {
  const location = useLocation();

  const showFooter =
    location.pathname === "/" || location.pathname === "/about";

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:id" element={<ListingDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/create-listing" element={<RequireAuth><CreateListingPage /></RequireAuth>} />
          <Route path="/transactions/:id" element={<RequireAuth><TransactionDetailPage /></RequireAuth>} />
        </Routes>
      </AnimatePresence>
      {showFooter ? <Footer /> : null}
      <ChatWidget />
      {/* <Toast /> */}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
