import React, { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { PresetWithEffects } from '../../types/preset';
import { PresetViewer } from '../PresetViewer/PresetViewer';

interface PresetItemProps {
  preset: PresetWithEffects;
  onEdit: (preset: PresetWithEffects) => void;
  onDelete: (preset: PresetWithEffects) => void;
}


const categoryColors: { [key: string]: string } = {
  'Alternative': 'bg-orange-900/30 text-orange-400 border border-orange-700',
  'Bass': 'bg-purple-900/30 text-purple-400 border border-purple-700',
  'Blues': 'bg-indigo-900/30 text-indigo-400 border border-indigo-700',
  'Country': 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
  'Funk': 'bg-pink-900/30 text-pink-400 border border-pink-700',
  'Jazz': 'bg-blue-900/30 text-blue-400 border border-blue-700',
  'Metal': 'bg-gray-800 text-gray-300 border border-gray-600',
  'Pop': 'bg-green-900/30 text-green-400 border border-green-700',
  'Rock': 'bg-red-900/30 text-red-400 border border-red-700',
  'Reggae': 'bg-emerald-900/30 text-emerald-400 border border-emerald-700',
  'World': 'bg-teal-900/30 text-teal-400 border border-teal-700',
  'Custom': 'bg-gray-700 text-gray-300 border border-gray-600',
};

export const PresetItem: React.FC<PresetItemProps> = ({ preset, onEdit, onDelete }) => {
  const [showViewer, setShowViewer] = useState(false);
  
  // Check if preset is new (imported within last 7 days)
  const isNew = () => {
    const importedAt = preset.importedAt || preset.meta?.importedAt;
    if (!importedAt) return false;
    
    const importDate = new Date(importedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - importDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const category = preset.meta?.category || preset.meta?.tags?.[0] || 'Custom';

  return (
    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-medium text-gray-100">
              {preset.meta.name}
            </h3>
            {isNew() && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-900/30 text-green-400 border border-green-700 rounded-full">
                Nuevo
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              categoryColors[category] || categoryColors['Custom']
            }`}>
              {category}
            </span>
          </div>
          
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={() => setShowViewer(!showViewer)}
            className={`p-1.5 rounded ${
              showViewer 
                ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-900/50' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
            title={showViewer ? "Ocultar detalles" : "Ver detalles"}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(preset)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(preset)}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Preset Viewer - Always visible, changes mode based on showViewer */}
      <div className="mt-3">
        <PresetViewer preset={preset} mode={showViewer ? "expanded" : "compact"} />
      </div>
    </div>
  );
};