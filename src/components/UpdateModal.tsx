import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Container,
  Layers,
  Calendar,
  Activity,
  Shield,
  Info,
  ExternalLink,
  GitBranch,
  Package
} from 'lucide-react';
import { Update } from '../types';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  update: Update | null;
  onUpdate: () => void;
  onSchedule?: (schedule: string) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  update,
  onUpdate,
  onSchedule
}) => {
  const [updateSchedule, setUpdateSchedule] = useState('now');
  const [backupBeforeUpdate, setBackupBeforeUpdate] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);

  if (!update) return null;

  const TypeIcon = update.type === 'container' ? Container : Layers;
  
  const mockChangelog = `## Version ${update.latestVersion}

### 🚀 Nouvelles fonctionnalités
- Amélioration des performances de 25%
- Nouveau système de cache intelligent
- Support pour les webhooks personnalisés

### 🐛 Corrections de bugs
- Correction du problème de mémoire lors du redémarrage
- Résolution des erreurs de connexion réseau
- Amélioration de la stabilité générale

### 🔒 Sécurité
- Mise à jour des dépendances de sécurité
- Correction de vulnérabilités mineures
- Renforcement de l'authentification

### ⚠️ Changements importants
- Configuration requise pour les nouveaux paramètres
- Migration automatique des données existantes`;

  const scheduleOptions = [
    { value: 'now', label: 'Maintenant' },
    { value: '1h', label: 'Dans 1 heure' },
    { value: '6h', label: 'Dans 6 heures' },
    { value: '1d', label: 'Demain' },
    { value: 'weekend', label: 'Ce week-end' },
    { value: 'maintenance', label: 'Prochaine fenêtre de maintenance' }
  ];

  const handleUpdate = () => {
    if (updateSchedule === 'now') {
      onUpdate();
    } else {
      onSchedule?.(updateSchedule);
    }
    onClose();
  };

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
                <RefreshCw className="h-6 w-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Mise à jour disponible</h2>
                  <p className="text-gray-400 text-sm">{update.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Update Info */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <TypeIcon className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{update.name}</h3>
                      <p className="text-gray-400 text-sm">{update.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Version actuelle:</span>
                      <span className="text-white ml-2 font-mono">{update.currentVersion}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Nouvelle version:</span>
                      <span className="text-green-400 ml-2 font-mono">{update.latestVersion}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Dernière MAJ:</span>
                      <span className="text-white ml-2">{new Date(update.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Taille:</span>
                      <span className="text-white ml-2">{update.size ? `${(update.size / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span>
                    </div>
                  </div>

                  {update.securityUpdate && (
                    <div className="mt-4 bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 font-medium">Mise à jour de sécurité</span>
                      </div>
                      <p className="text-red-200 text-sm mt-1">
                        Cette mise à jour contient des correctifs de sécurité importants.
                      </p>
                    </div>
                  )}
                </div>

                {/* Changelog */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Notes de version</h4>
                    <button
                      onClick={() => setShowChangelog(!showChangelog)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                    >
                      <GitBranch className="h-4 w-4" />
                      <span>{showChangelog ? 'Masquer' : 'Afficher'} le changelog</span>
                    </button>
                  </div>
                  
                  {showChangelog && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-900 rounded p-4 overflow-hidden"
                    >
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {update.changelog || mockChangelog}
                      </pre>
                    </motion.div>
                  )}
                </div>

                {/* Update Options */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Options de mise à jour</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Planification
                      </label>
                      <select
                        value={updateSchedule}
                        onChange={(e) => setUpdateSchedule(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {scheduleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Sauvegarde avant mise à jour</h5>
                        <p className="text-sm text-gray-400">
                          Créer une sauvegarde automatique avant la mise à jour
                        </p>
                      </div>
                      <button
                        onClick={() => setBackupBeforeUpdate(!backupBeforeUpdate)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          backupBeforeUpdate ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            backupBeforeUpdate ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {update.rollbackAvailable && (
                      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Info className="h-4 w-4 text-blue-400" />
                          <span className="text-blue-400 font-medium">Rollback disponible</span>
                        </div>
                        <p className="text-blue-200 text-sm mt-1">
                          Vous pourrez revenir à la version précédente si nécessaire.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated Impact */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Impact estimé</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                      <div className="text-white font-medium">~2 minutes</div>
                      <div className="text-gray-400">Temps d'arrêt</div>
                    </div>
                    <div className="text-center">
                      <Download className="h-6 w-6 text-green-400 mx-auto mb-1" />
                      <div className="text-white font-medium">Automatique</div>
                      <div className="text-gray-400">Téléchargement</div>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                      <div className="text-white font-medium">Vérification</div>
                      <div className="text-gray-400">Post-update</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Voir les détails</span>
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>
                        {updateSchedule === 'now' ? 'Mettre à jour maintenant' : 'Programmer la mise à jour'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};