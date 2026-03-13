import { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type AuthModalProps = {
  onClose: () => void;
  initialMode?: 'login' | 'register';
};

export function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6">
          {mode === 'login' ? (
            <LoginForm onToggleMode={() => setMode('register')} onSuccess={onClose} />
          ) : (
            <RegisterForm onToggleMode={() => setMode('login')} onSuccess={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
