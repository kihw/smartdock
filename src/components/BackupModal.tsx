import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Download,
  Upload,
  Calendar,
  Clock,
  HardDrive,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  Folder,
  Archive,
  Trash2
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBackup: (config: BackupConfig) => void;
}

interface BackupConfig {
  name: string;
  type: 'full' | 'incremental' | 'containers' | 'volumes';
  schedule?: string;
  retention: number;
  compression: boolean;
  includes: string[];
  excludes: string[];
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onCreateBackup
}) => {
  const [config, setConfig] = useState<BackupConfig>({
    name: '',
    type: 'full',
    retention: 7,
    compression: true,
    includes: [],
    excludes: []
  });

  const [activeTab, setActiveTab] = useState<'config' | 'schedule' | 'advanced'>('config');

  const backupTypes = [
    {
      value: 'full',
      label: 'Sauvegarde complète',
      description: 'Tous les conteneurs, volumes et configurations',
      icon: Database
    },
    {
      value: 'incremental',
      label: 'Sauvegarde incrémentale',
      description: 'Seulement les changements depuis la dernière sauvegarde',
      icon: Archive
    },
    {
      value: 'containers',
      label: 'Conteneurs uniquement',
      description: 'Images et configurations des conteneurs',
      icon: Settings
    },
    {
      value: 'volumes',
      label: 'Volumes uniquement',
      description: 'Données des volumes Docker',
      icon: HardDrive
    }
  ];

  const schedulePresets = [
    { value: '', label: 'Sauvegarde manuelle' },
    { value: '0 2 * * *', label: 'Quotidienne à 2h00' },
    { value: '0 2 * * 0', label: 'Hebdomadaire (dimanche 2h00)' },
    { value: '0 2 1 * *', label: 'Mensuelle (1er du mois 2h00)' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateBackup(config);
    onClose();
  };

  const renderConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Nom de la sauvegarde *
        </label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="backup-production-2024"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Type de sauvegarde
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {backupTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, type: type.value as any }))}
              className={`p-4 rounded-lg border transition-all text-left ${
                config.type === type.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-start space-x-3">
                <type.icon className={`h-5 w-5 mt-0.5 ${
                  config.type === type.value ? 'text-blue-400' : 'text-gray-400'
                }`} />
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm opacity-80 mt-1">{type.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Rétention (jours)
          </label>
          <input
            type="number"
            value={config.retention}
            onChange={(e) => setConfig(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="365"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Compression</h4>
            <p className="text-sm text-gray-400">Réduire la taille des sauvegardes</p>
          </div>
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, compression: !prev.compression }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              config.compression ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.compression ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Planification automatique
        </label>
        <select
          value={config.schedule || ''}
          onChange={(e) => setConfig(prev => ({ ...prev, schedule: e.target.value || undefined }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {schedulePresets.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {config.schedule && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 font-medium">Planification active</span>
          </div>
          <p className="text-blue-200 text-sm">
            Les sauvegardes seront créées automatiquement selon la planification sélectionnée.
            Vous recevrez une notification en cas de succès ou d'échec.
          </p>
        </div>
      )}

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Historique des sauvegardes</h4>
        <div className="space-y-2">
          {[
            { name: 'backup-2024-01-15', date: '15/01/2024 02:00', size: '2.3 GB', status: 'success' },
            { name: 'backup-2024-01-14', date: '14/01/2024 02:00', size: '2.1 GB', status: 'success' },
            { name: 'backup-2024-01-13', date: '13/01/2024 02:00', size: '2.2 GB', status: 'error' }
          ].map((backup, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-600 rounded p-3">
              <div className="flex items-center space-x-3">
                <Folder className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="text-white text-sm font-medium">{backup.name}</div>
                  <div className="text-gray-400 text-xs">{backup.date} • {backup.size}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {backup.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <button className="text-gray-400 hover:text-white">
                  <Download className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Inclure spécifiquement
        </label>
        <textarea
          value={config.includes.join('\n')}
          onChange={(e) => setConfig(prev => ({ 
            ...prev, 
            includes: e.target.value.split('\n').filter(line => line.trim()) 
          }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="container-name&#10;/path/to/volume&#10;specific-image"
        />
        <p className="text-xs text-gray-500 mt-1">
          Un élément par ligne. Laissez vide pour inclure tout selon le type sélectionné.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Exclure
        </label>
        <textarea
          value={config.excludes.join('\n')}
          onChange={(e) => setConfig(prev => ({ 
            ...prev, 
            excludes: e.target.value.split('\n').filter(line => line.trim()) 
          }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="temp-container&#10;/tmp/*&#10;*.log"
        />
        <p className="text-xs text-gray-500 mt-1">
          Éléments à exclure de la sauvegarde. Supporte les wildcards (*).
        </p>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium">Recommandations</h4>
            <ul className="text-yellow-200 text-sm mt-2 space-y-1">
              <li>• Testez vos sauvegardes régulièrement</li>
              <li>• Stockez les sauvegardes sur un système externe</li>
              <li>• Vérifiez l'espace disque disponible</li>
              <li>• Documentez votre stratégie de sauvegarde</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'schedule', label: 'Planification', icon: Calendar },
    { id: 'advanced', label: 'Avancé', icon: Database }
  ];

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
                <Shield className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Nouvelle sauvegarde</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'config' && renderConfig()}
              {activeTab === 'schedule' && renderSchedule()}
              {activeTab === 'advanced' && renderAdvanced()}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!config.name}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Créer la sauvegarde</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};