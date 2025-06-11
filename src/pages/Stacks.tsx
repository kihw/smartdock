import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Settings,
  Upload,
  Download,
  GitBranch,
  Clock,
  Activity,
  Container,
  Network,
  HardDrive
} from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useNotifications } from '../utils/notifications';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';
import { Stack } from '../types';

const statusColors = {
  running: 'bg-green-100 text-green-800 border-green-200',
  stopped: 'bg-red-100 text-red-800 border-red-200',
  partial: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const statusIcons = {
  running: Activity,
  stopped: Square,
  partial: RotateCcw
};

export const Stacks: React.FC = () => {
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  const { data: stacks, loading, error, refetch } = useApi<Stack[]>('/stacks');
  const { success, error: notifyError } = useNotifications();

  // Mutations for stack actions
  const startMutation = useApiMutation('', 'POST');
  const stopMutation = useApiMutation('', 'POST');
  const restartMutation = useApiMutation('', 'POST');

  const toggleStack = (id: string) => {
    setSelectedStacks(prev =>
      prev.includes(id)
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    );
  };

  const handleAction = async (action: string, stackId?: string) => {
    if (!stackId) return;
    
    try {
      const stack = stacks?.find(s => s.id === stackId);
      if (!stack) {
        notifyError('Erreur', 'Stack introuvable');
        return;
      }

      switch (action) {
        case 'start':
          await startMutation.mutate(undefined, { 
            url: `/stacks/${stackId}/start` 
          });
          success('Stack démarrée', `${stack.name} a été démarrée avec succès`);
          break;
        case 'stop':
          await stopMutation.mutate(undefined, { 
            url: `/stacks/${stackId}/stop` 
          });
          success('Stack arrêtée', `${stack.name} a été arrêtée`);
          break;
        case 'restart':
          await restartMutation.mutate(undefined, { 
            url: `/stacks/${stackId}/restart` 
          });
          success('Stack redémarrée', `${stack.name} a été redémarrée`);
          break;
        default:
          console.log(`Action ${action} not implemented for stacks`);
          return;
      }
      
      // Refresh stack list after action
      setTimeout(() => {
        refetch().catch(console.error);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notifyError('Erreur', `Impossible d'exécuter l'action: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des stacks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Erreur lors du chargement des stacks</div>
        <button 
          onClick={() => refetch().catch(console.error)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stacks || stacks.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-400 mb-4">Aucune stack trouvée</div>
        <button 
          onClick={() => refetch().catch(console.error)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Stacks Docker</h1>
          <p className="mt-2 text-gray-400">
            Gérez vos stacks Docker Compose avec déploiement automatique
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Importer Stack</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>Nouvelle Stack</span>
          </button>
        </div>
      </div>

      {/* Stacks Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {stacks.map((stack, index) => {
          const StatusIcon = statusIcons[stack.status] || Square;
          const isLoading = startMutation.loading || stopMutation.loading || restartMutation.loading;
          
          return (
            <motion.div
              key={stack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-gray-800 border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${
                selectedStacks.includes(stack.id)
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <LoadingOverlay loading={isLoading} text="Action en cours...">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedStacks.includes(stack.id)}
                        onChange={() => toggleStack(stack.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Layers className="h-6 w-6 text-blue-400" />
                          <h3 className="text-xl font-semibold text-white">{stack.name}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{stack.description}</p>
                        
                        <div className="flex items-center space-x-3 mb-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              statusColors[stack.status] || statusColors.stopped
                            }`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {stack.status}
                          </span>
                          {stack.autoUpdate && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              Auto-Update
                            </span>
                          )}
                          {stack.githubRepo && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              <GitBranch className="h-3 w-3 mr-1" />
                              GitHub
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Container className="h-4 w-4 mr-2" />
                      <span>{stack.runningServices || 0}/{stack.totalServices || 0} services</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{stack.uptime || '-'}</span>
                    </div>
                  </div>

                  {stack.githubRepo && (
                    <div className="mb-4 p-3 bg-gray-700 rounded-md">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Repository:</span>
                        <span className="text-blue-400 font-mono">{stack.githubRepo}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-400">Dernier déploiement:</span>
                        <span className="text-gray-300">{stack.lastDeploy}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {stack.status === 'running' ? (
                      <button
                        onClick={() => handleAction('stop', stack.id)}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('start', stack.id)}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('restart', stack.id)}
                      disabled={isLoading}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    {stack.githubRepo && (
                      <button
                        onClick={() => handleAction('pull', stack.id)}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('settings', stack.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Services status bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((stack.runningServices || 0) / (stack.totalServices || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    {stack.runningServices || 0} sur {stack.totalServices || 0} services actifs
                  </div>
                </div>
              </LoadingOverlay>
            </motion.div>
          );
        })}
      </div>

      {/* Bulk Actions */}
      {selectedStacks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-4"
        >
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">
              {selectedStacks.length} stack(s) sélectionnée(s)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('start-multiple')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleAction('stop-multiple')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                <Square className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleAction('restart-multiple')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};