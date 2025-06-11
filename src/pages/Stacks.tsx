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

interface StackData {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'partial';
  services: number;
  runningServices: number;
  uptime: string;
  githubRepo?: string;
  autoUpdate: boolean;
  lastDeploy: string;
}

const stacks: StackData[] = [
  {
    id: '1',
    name: 'web-stack',
    description: 'Stack web complète avec Nginx, Node.js et PostgreSQL',
    status: 'running',
    services: 4,
    runningServices: 4,
    uptime: '2d 14h',
    githubRepo: 'user/web-app',
    autoUpdate: true,
    lastDeploy: '2024-01-15 14:30'
  },
  {
    id: '2',
    name: 'monitoring',
    description: 'Stack de monitoring avec Prometheus et Grafana',
    status: 'running',
    services: 3,
    runningServices: 3,
    uptime: '5d 8h',
    autoUpdate: false,
    lastDeploy: '2024-01-10 09:15'
  },
  {
    id: '3',
    name: 'dev-environment',
    description: 'Environnement de développement avec bases de données',
    status: 'partial',
    services: 5,
    runningServices: 3,
    uptime: '12h',
    githubRepo: 'user/dev-setup',
    autoUpdate: true,
    lastDeploy: '2024-01-16 08:45'
  },
  {
    id: '4',
    name: 'backup-stack',
    description: 'Services de sauvegarde automatique',
    status: 'stopped',
    services: 2,
    runningServices: 0,
    uptime: '-',
    autoUpdate: false,
    lastDeploy: '2024-01-12 16:20'
  }
];

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

  const toggleStack = (id: string) => {
    setSelectedStacks(prev =>
      prev.includes(id)
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    );
  };

  const handleAction = (action: string, stackId?: string) => {
    console.log(`Action ${action} on stack ${stackId || 'multiple'}`);
    // Ici on implémenterait la logique Docker Compose
  };

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
          const StatusIcon = statusIcons[stack.status];
          
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
                            statusColors[stack.status]
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
                    <span>{stack.runningServices}/{stack.services} services</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{stack.uptime}</span>
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
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                    >
                      <Square className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('start', stack.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleAction('restart', stack.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  {stack.githubRepo && (
                    <button
                      onClick={() => handleAction('pull', stack.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
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
                      width: `${(stack.runningServices / stack.services) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {stack.runningServices} sur {stack.services} services actifs
                </div>
              </div>
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