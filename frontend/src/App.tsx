import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import type { UserSession } from './services/api';

function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        setSession(JSON.parse(sessionStr));
      } catch (e) {
        localStorage.removeItem('session');
      }
    }
  }, []);

  const handleLoginSuccess = (userSession: UserSession) => {
    localStorage.setItem('session', JSON.stringify(userSession));
    setSession(userSession);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    setSession(null);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <Navbar
        session={session}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col">
        {currentPage === 'landing' && (
          <Landing
            session={session}
            setCurrentPage={setCurrentPage}
            onLinkCreated={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}
        {currentPage === 'dashboard' && <Dashboard key={refreshTrigger} />}
        {currentPage === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'register' && (
          <Register onRegisterSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950/80">
        <p>© {new Date().getFullYear()} TrimURL. Developed with Advanced Agentic Workflows.</p>
      </footer>
    </div>
  );
}

export default App;
