
import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LocalizationProvider } from './context/LocalizationContext';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import VolunteerPage from './pages/VolunteerPage';
import DonatePage from './pages/DonatePage';
import AdoptionPage from './pages/AdoptionPage';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import ReportForm from './pages/ReportForm';
import { ReportType } from './types';

function App() {
  return (
    <LocalizationProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/report/emergency" element={<ReportForm reportType={ReportType.Emergency} />} />
              <Route path="/report/abuse" element={<ReportForm reportType={ReportType.Abuse} />} />
              <Route path="/report/missing" element={<ReportForm reportType={ReportType.MissingPet} />} />
              <Route path="/report/found" element={<ReportForm reportType={ReportType.FoundPet} />} />
              <Route path="/report/sterilization" element={<ReportForm reportType={ReportType.Sterilization} />} />
              <Route path="/volunteer" element={<VolunteerPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/adopt" element={<AdoptionPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </LocalizationProvider>
  );
}

export default App;
