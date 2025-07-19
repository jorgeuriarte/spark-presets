import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dropboxService } from '../services/dropbox';

interface BackupInfo {
  totalPresets: number;
  categories: string[];
  fileSize: number;
  fileSizeMB: string;
  lastModified?: string;
  md5Hash?: string;
}

export const BackupInfo: React.FC = () => {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const { data: backupInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['backup-info'],
    queryFn: dropboxService.getBackupInfo,
  });

  const importMutation = useMutation({
    mutationFn: dropboxService.importBackup,
    onSuccess: () => {
      // Refresh presets after import
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      setIsImporting(false);
    },
    onError: (error) => {
      console.error('Error importing backup:', error);
      setIsImporting(false);
    }
  });

  const handleImport = async () => {
    if (window.confirm('¿Deseas importar todos los presets del backup? Esto puede tomar unos momentos.')) {
      setIsImporting(true);
      importMutation.mutate();
    }
  };

  if (loadingInfo) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-blue-800">Verificando backup en Dropbox...</p>
        </div>
      </div>
    );
  }

  if (!backupInfo) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-blue-900">
            Backup de Spark Amp detectado
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Hemos encontrado un archivo de backup con <strong>{backupInfo.totalPresets} presets</strong> en tu Dropbox.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="font-medium">Categorías:</p>
                <p className="text-blue-600">{backupInfo.categories.join(', ')}</p>
              </div>
              <div>
                <p className="font-medium">Tamaño:</p>
                <p className="text-blue-600">{backupInfo.fileSizeMB}</p>
              </div>
              {backupInfo.lastModified && (
                <div className="sm:col-span-2">
                  <p className="font-medium">Última modificación:</p>
                  <p className="text-blue-600">{new Date(backupInfo.lastModified).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleImport}
              disabled={isImporting || importMutation.isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isImporting || importMutation.isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isImporting || importMutation.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Importar backup de Spark
                </>
              )}
            </button>
            {importMutation.isSuccess && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Backup importado exitosamente
              </p>
            )}
            {importMutation.isError && (
              <p className="mt-2 text-sm text-red-600">
                ✗ Error al importar el backup. Por favor, intenta de nuevo.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};