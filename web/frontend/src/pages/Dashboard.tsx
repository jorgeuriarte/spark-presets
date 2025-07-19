import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PresetItem } from '../components/PresetList/PresetItem';
import { FloatingCreateButton } from '../components/PresetList/FloatingCreateButton';
import { presetsService } from '../services/presets';
import { PresetWithEffects } from '../types/preset';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState<PresetWithEffects | null>(null);

  const { data: presets = [], isLoading, error } = useQuery({
    queryKey: ['presets'],
    queryFn: presetsService.getAll,
  });

  const handleEdit = (preset: PresetWithEffects) => {
    navigate(`/preset/${preset.meta.id}/edit`);
  };

  const handleDelete = async (preset: PresetWithEffects) => {
    if (window.confirm(`¿Estás seguro de eliminar "${preset.meta.name}"?`)) {
      try {
        await presetsService.delete(preset.meta.id);
        // Refetch presets
        // queryClient.invalidateQueries(['presets']);
      } catch (error) {
        console.error('Error deleting preset:', error);
      }
    }
  };

  const handleCreate = () => {
    navigate('/preset/new');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spark-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar los presets</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Presets</h1>
        <p className="text-gray-600 mt-1">
          {presets.length} {presets.length === 1 ? 'preset' : 'presets'} disponibles
        </p>
      </div>

      {presets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No tienes presets aún</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-600 hover:bg-spark-700"
          >
            Crear tu primer preset
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {presets.map((preset) => (
            <PresetItem
              key={preset.meta.id}
              preset={preset}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <FloatingCreateButton onClick={handleCreate} />
    </div>
  );
};