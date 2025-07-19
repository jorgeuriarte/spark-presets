import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-spark-50 to-spark-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎸 Spark Preset Manager
          </h1>
          <p className="text-gray-600">
            Gestiona tus presets de Spark Amp de forma inteligente
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-spark-50 rounded-lg p-4">
            <h2 className="font-semibold text-spark-900 mb-2">
              ¿Qué puedes hacer?
            </h2>
            <ul className="space-y-2 text-sm text-spark-700">
              <li className="flex items-start">
                <span className="text-spark-500 mr-2">✓</span>
                Sincroniza tus presets desde Dropbox
              </li>
              <li className="flex items-start">
                <span className="text-spark-500 mr-2">✓</span>
                Crea nuevos presets con IA
              </li>
              <li className="flex items-start">
                <span className="text-spark-500 mr-2">✓</span>
                Edita y organiza tu colección
              </li>
              <li className="flex items-start">
                <span className="text-spark-500 mr-2">✓</span>
                Detecta y elimina duplicados
              </li>
            </ul>
          </div>

          <button
            onClick={login}
            className="w-full bg-spark-600 hover:bg-spark-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 4.5c1.653 0 3 1.347 3 3s-1.347 3-3 3-3-1.347-3-3 1.347-3 3-3zm0 14.4c-2.984 0-5.628-1.468-7.256-3.72.046-2.414 4.846-3.735 7.256-3.735 2.398 0 7.21 1.321 7.256 3.735-1.628 2.252-4.272 3.72-7.256 3.72z"/>
            </svg>
            Conectar con Dropbox
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al continuar, aceptas que esta aplicación acceda a tu carpeta de Spark Amp en Dropbox
          </p>
        </div>
      </div>
    </div>
  );
};