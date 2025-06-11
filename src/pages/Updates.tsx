import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Play,
  Container,
  Layers,
  Calendar,
  Activity
} from 'lucide-react';

interface UpdateItem {
  id: string;
  name: string;
  type: 'container' | 'stack';
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  autoUpdate: boolean;
  lastUpdated: string;
  status: 'up-to-date' | 'update-available' | 'updating' | 'error';
  description: string;
}

const updateItems: UpdateItem[] = [
  {
    id: '1',
    name: 'web-app',
    type: 'container',
    currentVersion: 'nginx:1.24',
    latestVersion: 'nginx:1.25',
    hasUpdate: true,
    autoUpdate: true,
    lastUpdated: '2024-01-10 14:30',
    status: 'update-available',
    description: 'Serveur web principal'
  },
  {
    id: '2',
    name: 'api-server',
    type: 'container',
    currentVersion: 'node:18.19',
    latestVersion: 'node:18.19',
    hasUpdate: false,
    autoUpdate: true,
    lastUpdated: '2024-01-15 09:15',
    status: 'up-to-date',
    description: 'API Backend'
  },
  {
    id: '3',
    name: 'database',
    type: 'container',
    currentVersion: 'postgres:15.4',
    latestVersion: 'postgres:16.1',
    hasUpdate: true,
    autoUpdate: false,
    lastUpdated: '2024-01-05 16:20',
    status: 'update-available',
    description: 'Base de données principale'
  },
  {
    id: '4',
    name: 'monitoring',
    type: 'stack',
    currentVersion: 'v2.1.0',
    latestVersion: 'v2.2.0',
    hasUpdate: true,
    autoUpdate: true,
    lastUpdated: '2024-01-12 11:45',
    status: 'update-available',
    description: 'Stack Prometheus + Grafana'
  },
  {
    id: '5',
    name: 'cache-server',
    type: 'container',
    currentVersion: 'redis:7.0',
    latestVersion: 'redis:7.2',
    hasUpdate: true,
    autoUpdate: false,
    lastUpdated: '2024-01-08 13:30',
    status: 'updating',
    description: 'Cache Redis'
  }
];

const statusColors = {
  'up-to-date': 'bg-green-100 text-green-800 border-green-200',
  'update-available': 'bg-orange-100 text-orange-800 border-orange-200',
  'updating': 'bg-blue-100 text-blue-800 border-blue-200',
  'error': 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  'up-to-date': CheckCircle,
  'update-available': AlertCircle,
  'updating': RefreshCw,
  'error': AlertCircle
};

export const Updates: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [updateSchedule, setUpdateSchedule] = useState('weekly');

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleUpdate = (id: string) => {
    console.log(`Update item ${id}`);
    // Ici on implémenterait la logique de mise à jour
  };

  const handleBulkUpdate = () => {
    console.log(`Bulk update items:`, selectedItems);
    // Ici on implémenterait la logique de mise à jour en lot
  };

  const handleUpdateAll = () => {
    console.log('Update all items');
    // Ici on implémenterait la logique de mise à jour globale
  };

  const availableUpdates = updateItems.filter(item => item.hasUpdate).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mises à Jour</h1>
          <p className="mt-2 text-gray-400">
            Gérez les mises à jour automatiques et manuelles de vos conteneurs
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleUpdateAll}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Tout Mettre à Jour</span>
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Mettre à Jour ({selectedItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Configuration auto-update */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Configuration Automatique</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Mises à jour automatiques</h3>
              <p className="text-sm text-gray-400">
                Mettre à jour automatiquement selon la planification
              </p>
            </div>
            <button
              onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                autoUpdateEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoUpdateEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Fréquence des mises à jour
            </label>
            <select
              value={updateSchedule}
              onChange={(e) => setUpdateSchedule(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
              <option value="manual">Manuelle uniquement</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Download className="h-5 w-5 text-orange-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{availableUpdates}</div>
              <div className="text-sm text-gray-400">Mises à jour disponibles</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{updateItems.length - availableUpdates}</div>
              <div className="text-sm text-gray-400">À jour</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-gray-400">Auto-update activé</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">Dim</div>
              <div className="text-sm text-gray-400">Prochaine vérification</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des éléments */}
      <div className="space-y-4">
        {updateItems.map((item, index) => {
          const StatusIcon = statusIcons[item.status];
          const TypeIcon = item.type === 'container' ? Container : Layers;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-gray-800 border rounded-lg p-6 hover:border-gray-600 transition-all duration-200 ${
                selectedItems.includes(item.id)
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex items-center space-x-3">
                    <TypeIcon className="h-6 w-6 text-blue-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            statusColors[item.status]
                          }`}
                        >
                          <StatusIcon className={`h-3 w-3 mr-1 ${item.status === 'updating' ? 'animate-spin' : ''}`} />
                          {item.status.replace('-', ' ')}
                        </span>
                        {item.autoUpdate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            Auto
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Actuelle</div>
                    <div className="text-sm font-mono text-white">{item.currentVersion}</div>
                  </div>
                  
                  {item.hasUpdate && (
                    <>
                      <div className="text-gray-500">→</div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Disponible</div>
                        <div className="text-sm font-mono text-green-400">{item.latestVersion}</div>
                      </div>
                    </>
                  )}
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Dernière MAJ</div>
                    <div className="text-sm text-gray-300">{item.lastUpdated}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {item.hasUpdate && item.status !== 'updating' ? (
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Mettre à jour</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-600 text-gray-400 py-2 px-4 rounded-md cursor-not-allowed flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>À jour</span>
                      </button>
                    )}
                    
                    <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md transition-colors duration-200">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};