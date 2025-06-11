import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Plus,
  Play,
  Pause,
  Trash2,
  Settings,
  Calendar,
  Repeat,
  Power,
  Container,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useNotifications } from '../utils/notifications';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';
import { Schedule } from '../types';

const actionColors = {
  start: 'bg-green-100 text-green-800 border-green-200',
  stop: 'bg-red-100 text-red-800 border-red-200',
  restart: 'bg-orange-100 text-orange-800 border-orange-200',
  update: 'bg-blue-100 text-blue-800 border-blue-200'
};

const actionIcons = {
  start: Play,
  stop: Pause,
  restart: Power,
  update: Repeat
};

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  running: 'bg-blue-100 text-blue-800 border-blue-200'
};

const statusIcons = {
  active: Activity,
  inactive: Clock,
  error: AlertCircle,
  running: Play
};

export const Schedules: React.FC = () => {
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  const { data: schedules, loading, error, refetch } = useApi<Schedule[]>('/schedules');
  const { success, error: notifyError } = useNotifications();

  // Mutations for schedule actions
  const createMutation = useApiMutation('', 'POST');
  const updateMutation = useApiMutation('', 'PUT');
  const deleteMutation = useApiMutation('', 'DELETE');
  const runMutation = useApiMutation('', 'POST');

  const handleToggleSchedule = async (id: string) => {
    try {
      const schedule = schedules?.find(s => s.id === id);
      if (!schedule) return;

      const newStatus = schedule.enabled ? false : true;
      await updateMutation.mutate({ enabled: newStatus }, { 
        url: `/schedules/${id}` 
      });
      
      success('Tâche mise à jour', `La tâche ${schedule.name} est maintenant ${newStatus ? 'activée' : 'désactivée'}`);
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Impossible de modifier la tâche');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const schedule = schedules?.find(s => s.id === id);
      if (!schedule) return;

      await deleteMutation.mutate(undefined, { 
        url: `/schedules/${id}` 
      });
      
      success('Tâche supprimée', `La tâche ${schedule.name} a été supprimée`);
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Impossible de supprimer la tâche');
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      const schedule = schedules?.find(s => s.id === id);
      if (!schedule) return;

      await runMutation.mutate({ scheduleId: id }, { 
        url: `/schedules/${id}/run` 
      });
      
      success('Tâche exécutée', `La tâche ${schedule.name} a été exécutée manuellement`);
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Impossible d\'exécuter la tâche');
    }
  };

  const cronToHuman = (cron: string) => {
    // Conversion basique du cron en langage humain
    if (cron === '0 23 * * *') return 'Tous les jours à 23h00';
    if (cron === '0 8 * * 1-5') return 'Lun-Ven à 08h00';
    if (cron === '0 4 * * 0') return 'Dimanche à 04h00';
    if (cron === '0 2 * * *') return 'Tous les jours à 02h00';
    if (cron === '*/15 * * * *') return 'Toutes les 15 minutes';
    if (cron === '0 */6 * * *') return 'Toutes les 6 heures';
    return cron;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des tâches programmées..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Erreur lors du chargement des tâches</div>
        <button 
          onClick={() => refetch().catch(console.error)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const scheduleList = schedules || [];
  const activeSchedules = scheduleList.filter(s => s.enabled).length;
  const totalExecutions = scheduleList.reduce((acc, s) => acc + (s.lastRun ? 1 : 0), 0);
  const nextHourSchedules = scheduleList.filter(s => {
    if (!s.nextRun || !s.enabled) return false;
    const nextRun = new Date(s.nextRun);
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return nextRun <= oneHourFromNow;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tâches Programmées</h1>
          <p className="mt-2 text-gray-400">
            Automatisez le démarrage et l'arrêt de vos conteneurs
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddSchedule(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{scheduleList.length}</div>
              <div className="text-sm text-gray-400">Tâches Totales</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{activeSchedules}</div>
              <div className="text-sm text-gray-400">Actives</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{totalExecutions}</div>
              <div className="text-sm text-gray-400">Exécutions</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Repeat className="h-5 w-5 text-orange-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{nextHourSchedules}</div>
              <div className="text-sm text-gray-400">Prochaine 1h</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des tâches */}
      {scheduleList.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 mb-4">Aucune tâche programmée</div>
          <button 
            onClick={() => setShowAddSchedule(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Créer une tâche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scheduleList.map((schedule, index) => {
            const ActionIcon = actionIcons[schedule.action] || Play;
            const StatusIcon = statusIcons[schedule.status] || Clock;
            const TargetIcon = schedule.targetType === 'container' ? Container : Layers;
            const isLoading = updateMutation.loading || deleteMutation.loading || runMutation.loading;
            
            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all duration-200"
              >
                <LoadingOverlay loading={isLoading} text="Action en cours...">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">{schedule.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{schedule.description}</p>
                      
                      <div className="flex items-center space-x-3 mb-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            statusColors[schedule.status] || statusColors.inactive
                          }`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {schedule.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            actionColors[schedule.action] || actionColors.start
                          }`}
                        >
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {schedule.action}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSchedule(schedule.id)}
                        disabled={isLoading}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          schedule.enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            schedule.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Cible:</span>
                      <div className="flex items-center space-x-1">
                        <TargetIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-400">{schedule.target}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Planification:</span>
                      <span className="text-gray-300">{cronToHuman(schedule.schedule)}</span>
                    </div>
                    {schedule.lastRun && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dernière exécution:</span>
                        <span className="text-gray-300">{new Date(schedule.lastRun).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prochaine exécution:</span>
                      <span className="text-green-400">
                        {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRunNow(schedule.id)}
                      disabled={!schedule.enabled || isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <Play className="h-4 w-4" />
                      <span>Exécuter</span>
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md transition-colors duration-200">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </LoadingOverlay>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};