import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PresetItem } from '../components/PresetList/PresetItem';
import { FloatingCreateButton } from '../components/PresetList/FloatingCreateButton';
import { BackupInfo } from '../components/BackupInfo';
import { presetsService } from '../services/presets';
import { PresetWithEffects } from '../types/preset';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkAuth } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<PresetWithEffects | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Handle OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      // Update API client to use the new token
      window.location.href = '/';
    }
  }, [searchParams]);

  const { data: presets = [], isLoading, error } = useQuery({
    queryKey: ['presets'],
    queryFn: presetsService.getAll,
    enabled: !!user?.dropboxConnected,
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

  // Get unique categories from presets
  const categories = Array.from(new Set(
    presets.map(p => p.meta?.category || p.meta?.tags?.[0] || 'Custom')
  )).sort();

  // Filter presets by category
  const filteredPresets = selectedCategory === 'all' 
    ? presets 
    : presets.filter(p => {
        const category = p.meta?.category || p.meta?.tags?.[0] || 'Custom';
        return category === selectedCategory;
      });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando presets desde Dropbox...</p>
          <p className="text-sm text-gray-400 mt-2">Esto puede tardar unos segundos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error al cargar los presets</p>
      </div>
    );
  }

  // Show connect Dropbox button if not connected
  if (!user?.dropboxConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-100">Conecta tu Dropbox</h3>
          <p className="mt-1 text-sm text-gray-400">
            Para acceder a tus presets de Spark, necesitas conectar tu cuenta de Dropbox.
          </p>
          <div className="mt-6">
            <a
              href="http://localhost:3001/api/auth/dropbox"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 256 218" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192 0l-64 40.771 64 40.772 64-40.772zM0 122.315l63.995 40.772L128 122.315l-64-40.772zM192 81.543l-64 40.772 64 40.772 64-40.772zM64 176.953l64 40.772 64-40.772-64-40.772z" fill="currentColor"/>
              </svg>
              Conectar con Dropbox
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Show backup info banner at the top */}
      {user?.dropboxConnected && <BackupInfo currentPresetCount={presets.length} />}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Mis Presets</h1>
        <p className="text-gray-400 mt-1">
          {filteredPresets.length} de {presets.length} {presets.length === 1 ? 'preset' : 'presets'} {selectedCategory !== 'all' ? `en ${selectedCategory}` : ''}
        </p>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos ({presets.length})
            </button>
            {categories.map(category => {
              const count = presets.filter(p => {
                const pCategory = p.meta?.category || p.meta?.tags?.[0] || 'Custom';
                return pCategory === category;
              }).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {presets.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
          <p className="text-gray-400 mb-4">No tienes presets aún</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Crear tu primer preset
          </button>
        </div>
      ) : (
        <div className="grid gap-2">
          {filteredPresets.map((preset) => (
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