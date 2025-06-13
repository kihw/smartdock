import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Container,
  Layers,
  Play,
  Square,
  RotateCcw,
  RefreshCw,
  Calendar,
  Bell,
  Settings,
  Info
} from 'lucide-react';
import { Schedule } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: Schedule | null;
  onSave: (schedule: Partial<Schedule>) => void;
}

const actionOptions = [
  { value: 'start', label: 'Démarrer', icon: Play, color: 'text-green-400' },
  { value: 'stop', label: 'Arrêter', icon: Square, color: 'text-red-400' },
  { value: 'restart', label: 'Redémarrer', icon: RotateCcw, color: 'text-orange-400' },
  { value: 'update', label: 'Mettre à jour', icon: RefreshCw, color: 'text-blue-400' }
];

const cronPresets = [
  { label: 'Tous les jours à minuit', value: '0 0 * * *' },
  { label: 'Tous les jours à 6h', value: '0 6 * * *' },
  { label: 'Lundi-Vendredi à 8h', value: '0 8 * * 1-5' },
  { label: 'Dimanche à 2h', value: '0 2 * * 0' },
  { label: 'Toutes les heures', value: '0 * * * *' },
  { label: 'Toutes les 15 minutes', value: '*/15 * * * *' },
  { label: 'Personnalisé', value: 'custom' }
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    description: schedule?.description || '',
    target: schedule?.target || '',
    targetType: schedule?.targetType || 'container' as 'container' | 'stack',
    action: schedule?.action || 'start' as 'start' | 'stop' | 'restart' | 'update',
    schedule: schedule?.schedule || '0 0 * * *',
    enabled: schedule?.enabled ?? true,
    notifications: schedule?.notifications || {
      onSuccess: true,
      onFailure: true,
      channels: ['email']
    },
    conditions: schedule?.conditions || []
  });

  const [cronPreset, setCronPreset] = useState(() => {
    const preset = cronPresets.find(p => p.value === formData.schedule);
    return preset ? preset.value : 'custom';
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleCronPresetChange = (value: string) => {
    setCronPreset(value);
    if (value !== 'custom') {
      setFormData(prev => ({ ...prev, schedule: value }));
    }
  };

  const cronToHuman = (cron: string) => {
    const preset = cronPresets.find(p => p.value === cron);
    return preset ? preset.label : cron;
  };

  const selectedAction = actionOptions.find(a => a.value === formData.action);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  {schedule ? 'Modifier la tâche' : 'Nouvelle tâche programmée'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nom de la tâche *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Arrêt nocturne des services"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Description de la tâche programmée..."
                    />
                  </div>
                </div>

                {/* Target and Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Type de cible
                    </label>
                    <select
                      value={formData.targetType}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="container">Conteneur</option>
                      <option value="stack">Stack</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Cible *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {formData.targetType === 'container' ? (
                          <Container className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Layers className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.target}
                        onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={formData.targetType === 'container' ? 'nginx-proxy' : 'web-stack'}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Action à exécuter
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {actionOptions.map((action) => (
                      <button
                        key={action.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, action: action.value as any }))}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                          formData.action === action.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <action.icon className={`h-4 w-4 ${formData.action === action.value ? action.color : ''}`} />
                        <span className="text-sm">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Planification
                    </label>
                    <select
                      value={cronPreset}
                      onChange={(e) => handleCronPresetChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {cronPresets.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {cronPreset === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Expression Cron personnalisée
                      </label>
                      <input
                        type="text"
                        value={formData.schedule}
                        onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="0 0 * * *"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: minute heure jour mois jour-semaine
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">
                        Planification: <span className="text-white font-medium">{cronToHuman(formData.schedule)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Activer la tâche</h4>
                    <p className="text-sm text-gray-400">La tâche sera exécutée selon la planification</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.enabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Advanced Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Options avancées</span>
                  </button>
                </div>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Notifications */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Notifier en cas de succès</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, onSuccess: !prev.notifications.onSuccess }
                            }))}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              formData.notifications.onSuccess ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                formData.notifications.onSuccess ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Notifier en cas d'échec</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, onFailure: !prev.notifications.onFailure }
                            }))}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              formData.notifications.onFailure ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                formData.notifications.onFailure ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Help */}
                    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-400 font-medium mb-1">Aide pour les expressions Cron</p>
                          <ul className="text-blue-200 space-y-1 text-xs">
                            <li>• <code>0 0 * * *</code> - Tous les jours à minuit</li>
                            <li>• <code>0 8 * * 1-5</code> - Lundi à vendredi à 8h</li>
                            <li>• <code>*/15 * * * *</code> - Toutes les 15 minutes</li>
                            <li>• <code>0 2 * * 0</code> - Dimanche à 2h du matin</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    {schedule ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};