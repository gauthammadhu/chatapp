import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './stores/useAuthStore';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import UsernameModal from './components/UsernameModal';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const { checkAuth, isAuthenticated, needsUsername } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && !needsUsername ? (
                <Navigate to="/chat" replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? (
                <ChatPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Username Modal */}
        <UsernameModal />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
