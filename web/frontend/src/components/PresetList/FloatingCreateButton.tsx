import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

interface FloatingCreateButtonProps {
  onClick: () => void;
}

export const FloatingCreateButton: React.FC<FloatingCreateButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      title="Crear nuevo preset"
    >
      <PlusIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
    </button>
  );
};