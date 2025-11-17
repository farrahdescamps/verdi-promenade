/**
 * Composant de debug pour vérifier les variables d'environnement
 * À utiliser temporairement pour diagnostiquer les problèmes d'auth
 */

import React, { useState } from 'react';

export const EnvDebug: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
  return (
    <button
      onClick={() => setIsVisible(true)}
      className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded text-xs z-[9999] shadow-lg"
      style={{ position: 'fixed' }}
    >
      Debug Env
    </button>
  );
  }

  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
    VITE_AUTH_BEARER: import.meta.env.VITE_AUTH_BEARER,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-[9999] shadow-xl" style={{ position: 'fixed' }}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Variables d'environnement</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-300">{key}:</span>
            <span className="text-green-400 max-w-xs truncate">
              {key === 'VITE_API_KEY' && value
                ? `${value.substring(0, 8)}...`
                : value || 'AUCUNE'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600">
        <div className="text-yellow-400">
          API Key valide: {envVars.VITE_API_KEY && envVars.VITE_API_KEY !== '<<ta_clef_api_si_vous_en_utilisez_une>>' ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
};
