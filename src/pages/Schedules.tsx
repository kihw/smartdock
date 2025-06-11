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

interface Schedule {
  id: string;
  name: string;
  description: string;
  target: string;
  targetType: 'container' | 'stack';
  action: 'start' | 'stop' | 'restart';
  scheduleType: 'cron' | 'interval' | 'once';
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  status: 'active' | 'inactive' | 'error';
}

const schedules: Schedule[] = [
  {
    id: '1',
    name: 'Arrêt nocturne dev',
    description: 'Arrêter l\'environnement de développement la nuit',
    target: 'dev-environment',
    targetType: 'stack',
    action: 'stop',
    scheduleType: 'cron',
    schedule: '0 23 * * *',
    enabled: true,
    lastRun: '2024-01-15 23:00',
    nextRun: '2024-01-16 23:00',
    status: 'active'
  },
  {
    id: '2',
    name: 'Démarrage matinal dev',
    description: 'Redémarrer l\'environnement de développement le matin',
    target: 'dev-environment',
    targetType: 'stack',
    action: 'start',
    scheduleType: 'cron',
    schedule: '0 8 * * 1-5',
    enabled: true,
    lastRun: '2024-01-16 08:00',
    nextRun: '2024-01-17 08:00',
    status: 'active'
  },
  {
    id: '3',
    name: 'Redémarrage hebdomadaire',
    description: 'Redémarrer tous les conteneurs chaque dimanche',
    target: 'all',
    targetType: 'container',
    action: 'restart',
    scheduleType: 'cron',
    schedule: '0 4 * * 0',
    enabled: true,
    nextRun: '2024-01-21 04:00',
    status: 'active'
  },
  {
    id: '4',
    name: 'Backup quotidien',
    description: 'Démarrer la stack de backup tous les jours',
    target: 'backup-stack',
    targetType: 'stack',
    action: 'start',
    scheduleType: 'cron',
    schedule: '0 2 * * *',
    enabled: false,
    nextRun: '-',
    status: 'inactive'
  }
];

const actionColors = {
  start: 'bg-green-100 text-green-800 border-green-200',
  stop: 'bg-red-100 text-red-800 border-red-200',
  restart: 'bg-orange-100 text-orange-800 border-orange-200'
};

const actionIcons = {
  start: Play,
  stop: Pause,
  restart: Power
};

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  error: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  active: Activity,
  inactive: Clock,
  error: AlertCircle
};

export const Schedules: React.FC = () => {
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  const handleToggleSchedule = (id: string) => {
    console.log(`Toggle schedule ${id}`);
    // Ici on implémenterait la logique de basculement
  };

  const handleDeleteSchedule = (id: string) => {
    console.log(`Delete schedule ${id}`);
    // Ici on implémenterait la logique de suppression
  };

  const handleRunNow = (id: string) => {
    console.log(`Run schedule ${id} now`);
    // Ici on implémenterait la logique d'exécution immédiate
  };

  const cronToHuman = (cron: string) => {
    // Conversion basique du cron en langage humain
    const parts = cron.split(' ');
    if (cron === '0 23 * * *') return 'Tous les jours à 23h00';
    if (cron === '0 8 * * 1-5') return 'Lun-Ven à 08h00';
    if (cron === '0 4 * * 0') return 'Dimanche à 04h00';
    if (cron === '0 2 * * *') return 'Tous les jours à 02h00';
    return cron;
  };

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
              <div className="text-2xl font-bold text-white">6</div>
              <div className="text-sm text-gray-400">Tâches Totales</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-gray-400">Actives</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-sm text-gray-400">Exécutions/Jour</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Repeat className="h-5 w-5 text-orange-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-sm text-gray-400">Prochaine 1h</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des tâches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schedules.map((schedule, index) => {
          const ActionIcon = actionIcons[schedule.action];
          const StatusIcon = statusIcons[schedule.status];
          const TargetIcon = schedule.targetType === 'container' ? Container : Layers;
          
          return (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all duration-200"
            >
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
                        statusColors[schedule.status]
                      }`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {schedule.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        actionColors[schedule.action]
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
                    <span className="text-gray-300">{schedule.lastRun}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Prochaine exécution:</span>
                  <span className="text-green-400">{schedule.nextRun}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleRunNow(schedule.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                  disabled={!schedule.enabled}
                >
                  <Play className="h-4 w-4" />
                  <span>Exécuter</span>
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md transition-colors duration-200">
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};