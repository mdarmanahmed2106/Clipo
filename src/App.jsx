import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SentSuccessPage from './pages/SentSuccessPage';
import RetrievePage from './pages/RetrievePage';
import ContentRetrievedPage from './pages/ContentRetrievedPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <div className="app-layout">
      {/* Animated mesh background */}
      <div className="bg-mesh" aria-hidden="true" />

      <Navbar />

      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/sent"      element={<SentSuccessPage />} />
        <Route path="/retrieve"  element={<RetrievePage />} />
        <Route path="/retrieved" element={<ContentRetrievedPage />} />
        <Route path="/history"   element={<HistoryPage />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}
