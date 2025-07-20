import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDownTrayIcon, FolderIcon, ClockIcon } from '@heroicons/react/24/outline';
import { dropboxService } from '../services/dropbox';

interface ImportHistoryEntry {
  userId: string;
  backupPath: string;
  timestamp: string;
  result: {
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
  backupInfo?: {
    totalPresets: number;
    fileSize: number;
    fileSizeMB: string;
    md5Hash: string;
  };
}

export const History: React.FC = () => {
  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ['import-history'],
    queryFn: dropboxService.getImportHistory,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Consultando información histórica en Dropbox...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-400">Error al cargar el historial</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Historial de Importaciones</h1>
      
      {history.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <FolderIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No hay importaciones registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry: ImportHistoryEntry, index: number) => {
            const timestamp = new Date(entry.timestamp);
            const fileName = entry.backupPath.split('/').pop() || 'backup.zip';
            
            return (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <ArrowDownTrayIcon className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-medium text-gray-100">{fileName}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>Fecha de importación:</span>
                        </div>
                        <p className="text-gray-200">
                          {format(timestamp, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                      
                      {entry.backupInfo && (
                        <div>
                          <p className="text-gray-400 mb-1">Información del archivo:</p>
                          <p className="text-gray-200">
                            {entry.backupInfo.fileSizeMB} - {entry.backupInfo.totalPresets} presets
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-400">Nuevos:</span>
                        <span className="ml-2 text-green-400 font-medium">{entry.result.imported}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Actualizados:</span>
                        <span className="ml-2 text-yellow-400 font-medium">{entry.result.updated}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Omitidos:</span>
                        <span className="ml-2 text-gray-300 font-medium">{entry.result.skipped}</span>
                      </div>
                      {entry.result.errors.length > 0 && (
                        <div>
                          <span className="text-gray-400">Errores:</span>
                          <span className="ml-2 text-red-400 font-medium">{entry.result.errors.length}</span>
                        </div>
                      )}
                    </div>
                    
                    {entry.result.errors.length > 0 && (
                      <div className="mt-3 bg-red-900/20 border border-red-800 rounded p-3">
                        <p className="text-red-400 text-xs font-medium mb-1">Errores encontrados:</p>
                        <ul className="text-xs text-red-300 space-y-1">
                          {entry.result.errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {entry.backupInfo?.md5Hash && (
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500">MD5:</p>
                      <p className="text-xs font-mono text-gray-400">{entry.backupInfo.md5Hash.substring(0, 8)}...</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};