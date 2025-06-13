import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Play,
  Square,
  RotateCcw,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  Eye,
  Settings,
  Trash2
} from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useNotifications } from '../utils/notifications';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SmartWakeUpModal } from '../components/SmartWakeUpModal';
import { ContainerCard } from '../components/ContainerCard';
import { ContainerDetailsModal } from '../components/ContainerDetailsModal';
import { QuickActions, containerActions } from '../components/QuickActions';
import { Container as ContainerType } from '../types';

export const Containers: React.FC = () => {
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wakeUpModal, setWakeUpModal] = useState<{
    isOpen: boolean;
    container?: ContainerType;
  }>({ isOpen: false });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    container?: ContainerType;
  }>({ isOpen: false });

  const { data: containers, loading, error, refetch } = useApi<ContainerType[]>('/containers');
  const { success, error: notifyError } = useNotifications();

  // Mutations for container actions
  const startMutation = useApiMutation('', 'POST');
  const stopMutation = useApiMutation('', 'POST');
  const restartMutation = useApiMutation('', 'POST');
  const removeMutation = useApiMutation('', 'DELETE');

  const toggleContainer = (id: string) => {
    setSelectedContainers(prev =>
      prev.includes(id)
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleAction = async (action: string, containerId?: string) => {
    if (!containerId) return;
    
    try {
      const container = containers?.find(c => c.id === containerId);
      if (!container) {
        notifyError('Erreur', 'Conteneur introuvable');
        return;
      }

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
        case 'remove':
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer le conteneur ${container.name} ?`)) {
            await removeMutation.mutate(undefined, { 
              url: `/containers/${containerId}` 
            });
            success('Conteneur supprimé', `${container.name} a été supprimé`);
          }
          break;
        case 'smart-wakeup':
          setWakeUpModal({ isOpen: true, container });
          return;
        case 'details':
          setDetailsModal({ isOpen: true, container });
          return;
        default:
          console.log(`Action ${action} not implemented`);
          return;
      }
      
      // Refresh container list after action
      setTimeout(() => {
        refetch().catch(console.error);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notifyError('Erreur', `Impossible d'exécuter l'action: ${errorMessage}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedContainers.length === 0) return;

    try {
      const promises = selectedContainers.map(id => {
        switch (action) {
          case 'start':
            return startMutation.mutate(undefined, { url: `/containers/${id}/start` });
          case 'stop':
            return stopMutation.mutate(undefined, { url: `/containers/${id}/stop` });
          case 'restart':
            return restartMutation.mutate(undefined, { url: `/containers/${id}/restart` });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      success('Action groupée', `${action} exécuté sur ${selectedContainers.length} conteneurs`);
      setSelectedContainers([]);
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Impossible d\'exécuter l\'action groupée');
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
      refetch().catch(console.error);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notifyError('Erreur Smart Wake-Up', `Impossible de démarrer le conteneur: ${errorMessage}`);
      throw error;
    }
  };

  // Filter containers based on search and status
  const filteredContainers = containers?.filter(container => {
    const matchesSearch = container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.image.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || container.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const statusCounts = containers?.reduce((acc, container) => {
    acc[container.status] = (acc[container.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

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
          onClick={() => refetch().catch(console.error)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!containers || containers.length === 0) {
    return (
      <div className="text-center py-12">
        <Container className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-400 mb-4">Aucun conteneur trouvé</div>
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
          <h1 className="text-3xl font-bold text-white">Conteneurs</h1>
          <p className="mt-2 text-gray-400">
            Gérez vos conteneurs Docker avec Smart Wake-Up
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouveau Conteneur</span>
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Container className="h-5 w-5 text-blue-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{containers.length}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Play className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{statusCounts.running || 0}</div>
              <div className="text-sm text-gray-400">En cours</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Square className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{statusCounts.stopped || statusCounts.exited || 0}</div>
              <div className="text-sm text-gray-400">Arrêtés</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-purple-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">
                {containers.filter(c => c.smartWakeUp).length}
              </div>
              <div className="text-sm text-gray-400">Smart Wake-Up</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des conteneurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts ({containers.length})</option>
              <option value="running">En cours ({statusCounts.running || 0})</option>
              <option value="stopped">Arrêtés ({statusCounts.stopped || 0})</option>
              <option value="exited">Sortis ({statusCounts.exited || 0})</option>
              <option value="paused">En pause ({statusCounts.paused || 0})</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions for Selected Containers */}
      {selectedContainers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              {selectedContainers.length} conteneur(s) sélectionné(s)
            </span>
            <QuickActions
              actions={[
                {
                  id: 'start-selected',
                  label: 'Démarrer',
                  icon: Play,
                  color: 'bg-green-600',
                  hoverColor: 'hover:bg-green-700',
                  action: () => handleBulkAction('start')
                },
                {
                  id: 'stop-selected',
                  label: 'Arrêter',
                  icon: Square,
                  color: 'bg-red-600',
                  hoverColor: 'hover:bg-red-700',
                  action: () => handleBulkAction('stop')
                },
                {
                  id: 'restart-selected',
                  label: 'Redémarrer',
                  icon: RotateCcw,
                  color: 'bg-orange-600',
                  hoverColor: 'hover:bg-orange-700',
                  action: () => handleBulkAction('restart')
                }
              ]}
              layout="horizontal"
              size="sm"
            />
          </div>
        </motion.div>
      )}

      {/* Containers Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredContainers.map((container, index) => (
          <div key={container.id} className="relative">
            <ContainerCard
              container={container}
              isSelected={selectedContainers.includes(container.id)}
              isLoading={startMutation.loading || stopMutation.loading || restartMutation.loading}
              onToggleSelect={() => toggleContainer(container.id)}
              onAction={(action) => handleAction(action, container.id)}
            />
            
            {/* Additional action buttons */}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleAction('details', container.id)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded"
                title="Voir les détails"
              >
                <Eye className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleAction('remove', container.id)}
                className="bg-red-700 hover:bg-red-600 text-white p-1 rounded"
                title="Supprimer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredContainers.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 mb-2">Aucun conteneur trouvé pour "{searchTerm}"</div>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {/* Smart Wake-Up Modal */}
      <SmartWakeUpModal
        isOpen={wakeUpModal.isOpen}
        onClose={() => setWakeUpModal({ isOpen: false })}
        containerName={wakeUpModal.container?.name || ''}
        domain={`${wakeUpModal.container?.name}.example.com`}
        onWakeUp={handleSmartWakeUp}
      />

      {/* Container Details Modal */}
      <ContainerDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false })}
        container={detailsModal.container || null}
        onAction={(action) => handleAction(action, detailsModal.container?.id)}
      />
    </div>
  );
};