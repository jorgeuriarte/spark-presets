import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { dropboxService } from '../services/dropbox';
import { presetsService } from '../services/presets';

interface BackupInfo {
  totalPresets: number;
  categories: string[];
  fileSize: number;
  fileSizeMB: string;
  lastModified?: string;
  md5Hash?: string;
  presetNames?: string[]; // List of preset names in backup
}

interface BackupInfoProps {
  currentPresetCount: number;
}

export const BackupInfo: React.FC<BackupInfoProps> = ({ currentPresetCount }) => {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Query backup info with automatic refetch every 5 minutes
  const { data: backupInfo, isLoading: loadingInfo, isFetching, refetch } = useQuery({
    queryKey: ['backup-info'],
    queryFn: dropboxService.getBackupInfo,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
  });

  // Check import history to determine new presets
  const { data: importHistory } = useQuery({
    queryKey: ['import-history'],
    queryFn: dropboxService.getImportHistory,
  });

  // Get current preset names to compare
  const { data: currentPresets = [] } = useQuery({
    queryKey: ['presets'],
    queryFn: presetsService.getAll,
  });

  // Calculate new presets available
  const currentPresetNames = new Set(currentPresets.map((p: any) => p.meta?.name || p.name));
  const newPresetNames = backupInfo?.presetNames?.filter((name: string) => !currentPresetNames.has(name)) || [];
  const newPresetsAvailable = newPresetNames.length;
  const hasNewPresets = newPresetsAvailable > 0;

  const importMutation = useMutation({
    mutationFn: dropboxService.importBackup,
    onSuccess: () => {
      // Refresh presets after import
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      queryClient.invalidateQueries({ queryKey: ['backup-info'] });
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      setIsImporting(false);
    },
    onError: (error) => {
      console.error('Error importing backup:', error);
      setIsImporting(false);
    }
  });

  const handleImport = async () => {
    const message = hasNewPresets 
      ? `¿Deseas importar ${newPresetsAvailable} nuevos presets del backup?`
      : '¿Deseas sincronizar todos los presets del backup? Esto puede tomar unos momentos.';
      
    if (window.confirm(message)) {
      setIsImporting(true);
      importMutation.mutate();
    }
  };

  const handleManualRefresh = () => {
    refetch();
  };

  // Show loading state only on initial load
  if (loadingInfo && !backupInfo) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-gray-300">Comprobando disponibilidad de backup de Spark en Dropbox...</p>
        </div>
      </div>
    );
  }

  // Show "no backups" message when there's no backup info
  if (!loadingInfo && !backupInfo) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-300">No hay backups de Spark pendientes en Dropbox</p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 mb-4 transition-all duration-200 ${
      hasNewPresets ? 'bg-blue-900/20 border-blue-600' : 'bg-gray-800 border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <svg className={`h-5 w-5 mr-2 ${
            hasNewPresets ? 'text-blue-400' : 'text-gray-400'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="flex-1">
            {isFetching ? (
              <p className="text-sm text-gray-300 flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Comprobando disponibilidad de backup...
              </p>
            ) : hasNewPresets ? (
              <div>
                <p className="text-sm font-medium text-blue-300">
                  {newPresetsAvailable} {newPresetsAvailable === 1 ? 'nuevo preset disponible' : 'nuevos presets disponibles'} en tu backup de Spark
                </p>
                {backupInfo?.lastModified && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Backup del {format(new Date(backupInfo.lastModified), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-300">
                  Backup de Spark sincronizado • {backupInfo?.totalPresets || 0} presets en total
                </p>
                {backupInfo?.lastModified && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Última actualización: {format(new Date(backupInfo.lastModified), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showDetails && (
            <span className="text-xs text-gray-400 mr-2">
              {backupInfo?.fileSizeMB}
            </span>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-400 hover:text-gray-200"
          >
            <svg className={`h-4 w-4 transition-transform ${
              showDetails ? 'rotate-180' : ''
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {hasNewPresets && (
            <button
              onClick={handleImport}
              disabled={isImporting || importMutation.isPending}
              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-white ${
                isImporting || importMutation.isPending
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isImporting || importMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importando...
                </>
              ) : (
                'Importar ahora'
              )}
            </button>
          )}
          
          <button
            onClick={handleManualRefresh}
            disabled={isFetching}
            className={`text-sm font-medium transition-colors ${
              isFetching 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-blue-400 hover:text-blue-300'
            }`}
            title="Actualizar información del backup"
          >
            <svg className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      {showDetails && backupInfo && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Total presets</p>
              <p className="font-medium text-gray-100">{backupInfo.totalPresets}</p>
            </div>
            <div>
              <p className="text-gray-400">Categorías</p>
              <p className="font-medium text-gray-100">{backupInfo.categories.length}</p>
            </div>
            <div>
              <p className="text-gray-400">Tamaño</p>
              <p className="font-medium text-gray-100">{backupInfo.fileSizeMB}</p>
            </div>
            <div>
              <p className="text-gray-400">Importados</p>
              <p className="font-medium text-gray-100">{currentPresetCount}</p>
            </div>
          </div>
          
          {backupInfo.lastModified && (
            <div className="mt-3 text-xs text-gray-400">
              <p>Fecha del backup: {format(new Date(backupInfo.lastModified), "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm:ss", { locale: es })}</p>
            </div>
          )}
          
          {/* Show new presets list when available */}
          {hasNewPresets && newPresetNames.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-300 font-medium mb-2">Presets nuevos disponibles:</p>
              <div className="max-h-32 overflow-y-auto">
                <ul className="text-xs text-gray-300 space-y-1">
                  {newPresetNames.slice(0, 10).map((name: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      {name}
                    </li>
                  ))}
                  {newPresetNames.length > 10 && (
                    <li className="text-gray-400 italic">...y {newPresetNames.length - 10} más</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      {importMutation.isSuccess && (
        <div className="mt-2 text-sm text-green-400 text-center">
          ✓ Backup importado exitosamente
        </div>
      )}
      
      {importMutation.isError && (
        <div className="mt-2 text-sm text-red-400 text-center">
          ✗ Error al importar el backup. Por favor, intenta de nuevo.
        </div>
      )}
    </div>
  );
};