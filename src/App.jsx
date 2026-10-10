import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { PortalSidebar } from './components/portal/PortalSidebar.jsx';
import { CertificateModal } from './components/common/CertificateModal.jsx';
import { api } from './services/api.js';


// Public Pages
import { HomePage } from './pages/HomePage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { CoursesPage } from './pages/CoursesPage.jsx';
import { CourseDetailPage } from './pages/CourseDetailPage.jsx';
import { ProjectsPage } from './pages/ProjectsPage.jsx';
import { EventsPage } from './pages/EventsPage.jsx';
import { AchievementsPage } from './pages/AchievementsPage.jsx';
import { CertificatesVerifyPage } from './pages/CertificatesVerifyPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ActivatePage } from './pages/ActivatePage.jsx';

// Member Portal Pages
import { DashboardPage } from './pages/portal/DashboardPage.jsx';
import { MyCoursesPage } from './pages/portal/MyCoursesPage.jsx';
import { MyCertificatesPage } from './pages/portal/MyCertificatesPage.jsx';
import { MyAwardsPage } from './pages/portal/MyAwardsPage.jsx';
import { MyProjectsPage } from './pages/portal/MyProjectsPage.jsx';
import { MyProfilePage } from './pages/portal/MyProfilePage.jsx';
import { ChangePasswordPage } from './pages/portal/ChangePasswordPage.jsx';

// Admin System Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage.jsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import {
  ADMIN_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_DASHBOARD_PATH,
  isAdminDashboardRoute,
  isAdminLoginRoute
} from './config/adminRoute.js';

function AppContent() {
  const { isAuthenticated, isAdmin, isLoading, member } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => {
    // BUG-05 FIX: Check real URL search params first (Telegram deep-links arrive as ?start=TOKEN)
    const realSearch = window.location.search;
    if (realSearch) {
      const params = new URLSearchParams(realSearch);
      const start = params.get('start');
      if (start) {
        const hash = `/activate?code=${encodeURIComponent(start)}`;
        window.location.hash = hash;
        return hash;
      }
    }
    if (window.location.hash) {
      return window.location.hash.slice(1) || '/';
    }
    // BUG Q-02 FIX: In hash-SPA mode, pathname is always '/' — don't use it as route
    return '/';
  });

  const [activeCertificate, setActiveCertificate] = useState(null);

  const navigate = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hashPath = window.location.hash.slice(1) || '/';
      setCurrentPath(hashPath);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openCertificateModal = async (certId) => {
    try {
      const res = await api.getCertificateById(certId);
      if (res.certificate) {
        setActiveCertificate(res.certificate);
      } else {
        // BUG-06 FIX: surface failure so UI can respond
        console.warn('[CertModal] Server returned no certificate for id:', certId);
      }
    } catch (err) {
      // BUG-06 FIX: log the actual error instead of swallowing it
      console.error('[CertModal] Failed to fetch certificate', certId, err);
    }
  };

  const isPortalRoute = currentPath.startsWith('/portal');
  const isAdminDashboard = isAdminDashboardRoute(currentPath);

  // BUG-04 FIX: Merged into one effect to prevent double-navigate race on initial mount.
  useEffect(() => {
    if (isLoading) return;
    if (isPortalRoute) {
      if (!isAuthenticated || member?.status === 'pending' || member?.status === 'rejected') {
        navigate('/login');
        return;
      }
    }
    // Conceal old /admin URL: redirect any public probing to public site
    if (currentPath === '/admin' || currentPath === '/admin/login' || currentPath === '/admin/dashboard') {
      navigate('/');
      return;
    }
    if (isAdminDashboard && (!isAuthenticated || !isAdmin)) {
      navigate(ADMIN_LOGIN_PATH);
    }
  }, [isLoading, isPortalRoute, isAdminDashboard, isAuthenticated, isAdmin, member, currentPath]);

  // If on admin dashboard and authorized, render AdminDashboardPage directly
  if (isAdminDashboard && isAuthenticated && isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg)] font-sans text-[var(--text)] selection:bg-[#FC6454]/25 selection:text-[#282828] dark:selection:bg-[#2F8068]/35 dark:selection:text-[#F1F7F4]">
        <AdminDashboardPage navigate={navigate} />
      </div>);

  }

  const renderPage = () => {
    // Conceal old /admin URL: render home if probed
    if (currentPath === '/admin' || currentPath === '/admin/login' || currentPath === '/admin/dashboard') {
      return <HomePage navigate={navigate} />;
    }

    // Encrypted Admin Login Route
    if (isAdminLoginRoute(currentPath)) {
      return <AdminLoginPage navigate={navigate} />;
    }

    // Encrypted Admin Dashboard Route
    if (isAdminDashboardRoute(currentPath)) {
      if (!isAuthenticated || !isAdmin) {
        return <AdminLoginPage navigate={navigate} />;
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    // Single course detail route: /courses/:id
    if (currentPath.startsWith('/courses/') && currentPath.length > 9) {
      const courseId = currentPath.replace('/courses/', '');
      return <CourseDetailPage courseId={courseId} navigate={navigate} />;
    }

    // Public Certificate verify with query: /certificates?id=...
    if (currentPath.startsWith('/certificates')) {
      const urlParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const certId = urlParams.get('id') || '';
      return <CertificatesVerifyPage initialCertId={certId} />;
    }

    // Account Activation route: /activate?code=...
    if (currentPath.startsWith('/activate')) {
      const urlParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const code = urlParams.get('code') || urlParams.get('token') || '';
      return <ActivatePage navigate={navigate} initialCode={code} />;
    }

    switch (currentPath) {
      case '/':
        return <HomePage navigate={navigate} />;
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/courses':
        return <CoursesPage navigate={navigate} />;
      case '/projects':
        return <ProjectsPage navigate={navigate} />;
      case '/events':
        return <EventsPage navigate={navigate} />;
      case '/achievements':
        return <AchievementsPage />;
      case '/contact':
        return <ContactPage />;
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;

      // Portal Routes
      case '/portal':
      case '/portal/dashboard':
        return <DashboardPage navigate={navigate} />;
      case '/portal/courses':
        return (
          <MyCoursesPage
            navigate={navigate}
            openCertificateModal={openCertificateModal} />);


      case '/portal/certificates':
        return <MyCertificatesPage navigate={navigate} />;
      case '/portal/awards':
        return <MyAwardsPage navigate={navigate} />;
      case '/portal/projects':
        return <MyProjectsPage navigate={navigate} />;
      case '/portal/profile':
        return <MyProfilePage />;
      case '/portal/change-password':
        return <ChangePasswordPage />;

      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[#FC6454]/25 selection:text-[#282828] dark:selection:bg-[#2F8068]/35 dark:selection:text-[#F1F7F4] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* Main Container */}
      {isPortalRoute && isAuthenticated && member?.status !== 'pending' && member?.status !== 'rejected' ?
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
          <PortalSidebar currentPath={currentPath} navigate={navigate} />
          <main className="flex-1 min-w-0 bg-[var(--surface)] dark:bg-[#102B22] rounded-lg border border-[var(--color-border)] dark:border-[#25473C] p-6 sm:p-8 shadow-xs">
            {renderPage()}
          </main>
        </div> :

      <main className="flex-1">{renderPage()}</main>
      }

      {/* Footer */}
      <Footer navigate={navigate} />

      {/* Global Certificate Modal */}
      <CertificateModal
        certificate={activeCertificate}
        isOpen={!!activeCertificate}
        onClose={() => setActiveCertificate(null)}
        onVerifyOnline={(certId) => navigate(`/certificates?id=${certId}`)} />
      
    </div>);

}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>);

}