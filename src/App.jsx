import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ToolsCarousel from './components/ToolsCarousel';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import SubjectTools from './pages/SubjectTools';
import Generator from './pages/Generator';
import Bot from './pages/Bot';
import Tulga from './pages/Tulga';
import Courses from './pages/Courses';
import History from './pages/History';
import Presentation from './pages/Presentation';
import Games from './pages/Games';
import AldeaWorld from './pages/AldeaWorld';
import AldeaKids from './pages/AldeaKids';
import AldeaKidsGame from './pages/AldeaKidsGame';
import AldeaUshqyr from './pages/AldeaUshqyr';
import AldeaTapqyr from './pages/AldeaTapqyr';
import AITools from './pages/AITools';
import Feedback from './pages/Feedback';
import Help from './pages/Help';
import Videos from './pages/Videos';
import Visuals from './pages/Visuals';
import Resources from './pages/Resources';
import TextbookReader from './pages/TextbookReader';
import Account from './pages/Account';
import Subscription from './pages/Subscription';
import Install from './pages/Install';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminSettings from './pages/admin/AdminSettings';
import DashboardLayout from './layouts/DashboardLayout';

// Layout component for landing page
const LandingLayout = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <ToolsCarousel />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Routes>
              <Route path="/" element={<LandingLayout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Protected Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/subject/:id" element={<ProtectedRoute><DashboardLayout><SubjectTools /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/tool/:id" element={<ProtectedRoute><DashboardLayout><Generator /></DashboardLayout></ProtectedRoute>} />
              <Route path="/bot" element={<ProtectedRoute><DashboardLayout><Bot /></DashboardLayout></ProtectedRoute>} />
              <Route path="/tulga" element={<ProtectedRoute><DashboardLayout><Tulga /></DashboardLayout></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><DashboardLayout><Courses /></DashboardLayout></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><DashboardLayout><History /></DashboardLayout></ProtectedRoute>} />
              <Route path="/presentation" element={<ProtectedRoute allowedRoles={['pro', 'ultra', 'moderator', 'admin']}><DashboardLayout><Presentation /></DashboardLayout></ProtectedRoute>} />
              <Route path="/games" element={<ProtectedRoute allowedRoles={['pro', 'ultra', 'moderator', 'admin']}><DashboardLayout><Games /></DashboardLayout></ProtectedRoute>} />
              <Route path="/ai-tools" element={<ProtectedRoute><DashboardLayout><AITools /></DashboardLayout></ProtectedRoute>} />

              {/* Games Routes - Also Protected */}
              <Route path="/games/aldea-world" element={<ProtectedRoute allowedRoles={['pro', 'ultra', 'moderator', 'admin']}><AldeaWorld /></ProtectedRoute>} />
              <Route path="/games/aldea-kids" element={<ProtectedRoute allowedRoles={['pro', 'ultra', 'moderator', 'admin']}><AldeaKids /></ProtectedRoute>} />
              <Route path="/games/aldea-kids/:gameId" element={<ProtectedRoute allowedRoles={['pro', 'ultra', 'moderator', 'admin']}><AldeaKidsGame /></ProtectedRoute>} />
              <Route path="/games/aldea-ushqyr" element={<ProtectedRoute allowedRoles={['pro', 'ultra', 'moderator', 'admin']}><AldeaUshqyr /></ProtectedRoute>} />
              <Route path="/games/aldea-tapqyr" element={<ProtectedRoute allowedRoles={['pro', 'ultra', 'moderator', 'admin']}><AldeaTapqyr /></ProtectedRoute>} />

              <Route path="/feedback" element={<ProtectedRoute><DashboardLayout><Feedback /></DashboardLayout></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><DashboardLayout><Help /></DashboardLayout></ProtectedRoute>} />
              <Route path="/videos" element={<ProtectedRoute><DashboardLayout><Videos /></DashboardLayout></ProtectedRoute>} />
              <Route path="/visuals" element={<ProtectedRoute><DashboardLayout><Visuals /></DashboardLayout></ProtectedRoute>} />
              <Route path="/resources/read/:id" element={<ProtectedRoute><TextbookReader /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><DashboardLayout><Resources /></DashboardLayout></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><DashboardLayout><Account /></DashboardLayout></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><DashboardLayout><Subscription /></DashboardLayout></ProtectedRoute>} />
              <Route path="/install" element={<ProtectedRoute><DashboardLayout><Install /></DashboardLayout></ProtectedRoute>} />

              {/* Admin Routes - Protected (Role check is inside components or can be added here) */}
              <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><DashboardLayout><AdminAnalytics /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute><DashboardLayout><AdminSubscriptions /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><DashboardLayout><AdminSettings /></DashboardLayout></ProtectedRoute>} />
            </Routes>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
