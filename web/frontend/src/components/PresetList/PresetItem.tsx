import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PresetWithEffects } from '../../types/preset';

interface PresetItemProps {
  preset: PresetWithEffects;
  onEdit: (preset: PresetWithEffects) => void;
  onDelete: (preset: PresetWithEffects) => void;
}

const effectColors: { [key: string]: string } = {
  'Overdrive': 'bg-blue-100 text-blue-700 border-blue-300',
  'Distortion': 'bg-red-100 text-red-700 border-red-300',
  'Delay': 'bg-green-100 text-green-700 border-green-300',
  'Reverb': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Chorus': 'bg-purple-100 text-purple-700 border-purple-300',
  'Compressor': 'bg-gray-100 text-gray-700 border-gray-300',
  'Noise Gate': 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

export const PresetItem: React.FC<PresetItemProps> = ({ preset, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {preset.meta.name}
          </h3>
          {preset.meta.description && (
            <p className="text-sm text-gray-600 mt-1">
              {preset.meta.description}
            </p>
          )}
          
          {/* Effect badges */}
          {preset.effects && preset.effects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {preset.effects.map((effect, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    effectColors[effect] || 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {effect}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(preset)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(preset)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};