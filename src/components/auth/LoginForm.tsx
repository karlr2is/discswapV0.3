import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { t } from '../../utils/translations';
import { Mail, Lock, AlertCircle } from 'lucide-react';

type LoginFormProps = {
  onToggleMode: () => void;
  onSuccess?: () => void;
};

export function LoginForm({ onToggleMode, onSuccess }: LoginFormProps) {
  const { signIn } = useAuth();
  const { language } = useSettings();
  const [email, setEmail] = useState('demo@discswap.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemoCredentials = () => {
    setEmail('demo@discswap.com');
    setPassword('demo123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('welcomeBack', language)}</h2>

      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">{t('tryDemo', language)}</p>
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 mb-1">
          <span className="font-mono">{t('demoEmail', language)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 mb-3">
          <span className="font-mono">{t('demoPassword', language)}</span>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 underline"
        >
          {t('fillDemo', language)}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('email', language)}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('emailPlaceholder', language)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('password', language)}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('passwordPlaceholder', language)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? t('signingIn', language) : t('signIn', language)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('noAccount', language)}{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
            >
              {t('signUp', language)}
            </button>
          </p>
        </div>
    </div>
  );
}
