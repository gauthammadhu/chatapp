import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function UsernameModal() {
  const navigate = useNavigate();
  const { setUsername, needsUsername } = useAuthStore();
  const [username, setUsernameInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!needsUsername) {
    return null;
  }

  const validateUsername = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Username is required';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    if (value.length < 3 || value.length > 20) {
      return 'Username must be between 3 and 20 characters';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await setUsername(username);
      navigate('/chat');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to set username. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Choose Your Username
          </h2>
          <p className="text-gray-600 text-sm">
            Pick a unique username to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="johndoe123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              Only letters, numbers, and underscores (3-20 characters)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting username...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          You can change your username later in settings
        </div>
      </div>
    </div>
  );
}
