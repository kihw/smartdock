import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Settings,
  Activity,
  Clock,
  Cpu,
  HardDrive,
  Network,
  MoreVertical,
  Zap
} from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useNotifications } from '../utils/notifications';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';
import { SmartWakeUpModal } from '../components/SmartWakeUpModal';
import { Container as ContainerType } from '../types';

const statusColors = {
  running: 'bg-green-100 text-green-800 border-green-200',
  stopped: 'bg-red-100 text-red-800 border-red-200',
  restarting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paused: 'bg-blue-100 text-blue-800 border-blue-200',
  exited: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusIcons = {
  running: Activity,
  stopped: Square,
  restarting: RotateCcw,
  paused: Clock,
  exited: Square
};

export const Containers: React.FC = () => {
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [wakeUpModal, setWakeUpModal] = useState<{
    isOpen: boolean;
    container?: ContainerType;
  }>({ isOpen: false });

  const { data: containers, loading, error, refetch } = useApi<ContainerType[]>('/containers');
  const { success, error: notifyError } = useNotifications();

  // Mutations for container actions
  const startMutation = useApiMutation('/containers/:id/start', 'POST');
  const stopMutation = useApiMutation('/containers/:id/stop', 'POST');
  const restartMutation = useApiMutation('/containers/:id/restart', 'POST');

  const toggleContainer = (id: string) => {
    setSelectedContainers(prev =>
      prev.includes(id)
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleAction = async (action: string, containerId?: string) => {
    try {
      if (containerId) {
        const container = containers?.find(c => c.id === containerId);
        if (!container) return;

        switch (action) {
          case 'start':
            await startMutation.mutate(undefined, { 
              url: `/containers/${containerId}/start` 
            });
            success('Conteneur démarré', `${container.name} a été démarré avec succès`);
            break;
          case 'stop':
            await stopMutation.mutate(undefined, { 
              url: `/containers/${containerId}/stop` 
            });
            success('Conteneur arrêté', `${container.name} a été arrêté`);
            break;
          case 'restart':
            await restartMutation.mutate(undefined, { 
              url: `/containers/${containerId}/restart` 
            });
            success('Conteneur redémarré', `${container.name} a été redémarré`);
            break;
          case 'smart-wakeup':
            setWakeUpModal({ isOpen: true, container });
            return;
        }
        
        // Refresh container list after action
        setTimeout(refetch, 1000);
      }
    } catch (error) {
      notifyError('Erreur', `Impossible d'exécuter l'action: ${error}`);
    }
  };

  const handleSmartWakeUp = async () => {
    if (!wakeUpModal.container) return;
    
    try {
      await startMutation.mutate(undefined, { 
        url: `/containers/${wakeUpModal.container.id}/start` 
      });
      
      // Simulate health check delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('Smart Wake-Up', `${wakeUpModal.container.name} est maintenant actif`);
      refetch();
    } catch (error) {
      notifyError('Erreur Smart Wake-Up', `Impossible de démarrer le conteneur: ${error}`);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des conteneurs..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Erreur lors du chargement des conteneurs</div>
        <button 
          onClick={refetch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Conteneurs</h1>
          <p className="mt-2 text-gray-400">
            Gérez vos conteneurs Docker avec Smart Wake-Up
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2">
            <Container className="h-4 w-4" />
            <span>Nouveau Conteneur</span>
          </button>
          {selectedContainers.length > 0 && (
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
            </div>
          )}
        </div>
      </div>

      {/* Containers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {containers?.map((container, index) => {
          const StatusIcon = statusIcons[container.status];
          const isLoading = startMutation.loading || stopMutation.loading || restartMutation.loading;
          
          return (
            <motion.div
              key={container.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-gray-800 border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${
                selectedContainers.includes(container.id)
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <LoadingOverlay loading={isLoading} text="Action en cours...">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedContainers.includes(container.id)}
                        onChange={() => toggleContainer(container.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Container className="h-6 w-6 text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{container.name}</h3>
                        <p className="text-sm text-gray-400">{container.image}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[container.status]
                        }`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {container.status}
                      </span>
                      {container.smartWakeUp && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <Zap className="h-3 w-3 mr-1" />
                          Smart Wake-Up
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{container.uptime}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Cpu className="h-4 w-4 mr-2" />
                      <span>{container.cpu}%</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <HardDrive className="h-4 w-4 mr-2" />
                      <span>{container.memory}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Network className="h-4 w-4 mr-2" />
                      <span>{container.ports.length} ports</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Ports:</div>
                    <div className="flex flex-wrap gap-1">
                      {container.ports.slice(0, 3).map((port, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                        >
                          {port.publicPort ? `${port.publicPort}:${port.privatePort}` : port.privatePort}
                        </span>
                      ))}
                      {container.ports.length > 3 && (
                        <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                          +{container.ports.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {container.status === 'running' ? (
                      <button
                        onClick={() => handleAction('stop', container.id)}
                        disabled={isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <Square className="h-4 w-4" />
                        <span>Arrêter</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction('start', container.id)}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <Play className="h-4 w-4" />
                          <span>Démarrer</span>
                        </button>
                        {container.smartWakeUp && (
                          <button
                            onClick={() => handleAction('smart-wakeup', container.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-md transition-colors duration-200"
                            title="Smart Wake-Up"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleAction('restart', container.id)}
                      disabled={isLoading}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAction('settings', container.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md transition-colors duration-200"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </LoadingOverlay>
            </motion.div>
          );
        })}
      </div>

      {/* Smart Wake-Up Modal */}
      <SmartWakeUpModal
        isOpen={wakeUpModal.isOpen}
        onClose={() => setWakeUpModal({ isOpen: false })}
        containerName={wakeUpModal.container?.name || ''}
        domain={`${wakeUpModal.container?.name}.example.com`}
        onWakeUp={handleSmartWakeUp}
      />
    </div>
  );
};