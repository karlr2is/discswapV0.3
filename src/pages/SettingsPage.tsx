import { Globe, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';

type SettingsPageProps = {
  onBack: () => void;
};

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { language, theme, setLanguage, toggleTheme } = useSettings();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('settings', language)}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t('language', language)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('chooseLanguage', language)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setLanguage('et')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                language === 'et'
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{t('estonian', language)}</span>
                {language === 'et' && (
                  <div className="w-5 h-5 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setLanguage('en')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                language === 'en'
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{t('english', language)}</span>
                {language === 'en' && (
                  <div className="w-5 h-5 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {t('darkMode', language)}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('toggleDarkMode', language)}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {t('version', language)}:
              </span>{' '}
              1.0.0
            </p>
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {t('builtWith', language)}:
              </span>{' '}
              React + Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
