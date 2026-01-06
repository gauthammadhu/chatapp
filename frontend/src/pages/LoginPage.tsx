import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../stores/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, needsUsername } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !needsUsername) {
      navigate('/chat');
    }
  }, [isAuthenticated, needsUsername, navigate]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await login(credentialResponse.credential);

        const state = useAuthStore.getState();
        if (state.needsUsername) {
          // Username modal will show automatically
        } else {
          navigate('/chat');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Chat App
          </h1>
          <p className="text-gray-600">
            Connect with friends in real-time
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <p className="text-gray-700 mb-4 font-medium">
              Sign in to get started
            </p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
            />
          </div>

          <div className="text-center text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>✨ Real-time messaging</span>
            <span>•</span>
            <span>🔒 Secure</span>
            <span>•</span>
            <span>🚀 Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
