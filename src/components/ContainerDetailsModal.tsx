import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Container,
  Play,
  Square,
  RotateCcw,
  Settings,
  Activity,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Eye,
  Terminal,
  Download,
  Upload,
  Calendar,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Zap,
  Shield,
  Database,
  Globe
} from 'lucide-react';
import { Container as ContainerType } from '../types';
import { StatusIndicator } from './StatusIndicator';
import { MetricsChart } from './MetricsChart';

interface ContainerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: ContainerType | null;
  onAction: (action: string) => void;
}

export const ContainerDetailsModal: React.FC<ContainerDetailsModalProps> = ({
  isOpen,
  onClose,
  container,
  onAction
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'inspect' | 'metrics' | 'networks'>('overview');

  if (!container) return null;

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Container },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'inspect', label: 'Inspection', icon: Eye },
    { id: 'metrics', label: 'Métriques', icon: Activity },
    { id: 'networks', label: 'Réseaux', icon: Network }
  ];

  const mockLogs = [
    { timestamp: '2024-01-15 10:30:15', level: 'info', message: 'Container started successfully' },
    { timestamp: '2024-01-15 10:30:16', level: 'info', message: 'Listening on port 3000' },
    { timestamp: '2024-01-15 10:30:17', level: 'warn', message: 'High memory usage detected' },
    { timestamp: '2024-01-15 10:30:18', level: 'error', message: 'Failed to connect to database' }
  ];

  const mockMetrics = Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - (9 - i) * 60000).toISOString(),
    cpu: Math.random() * 100,
    memory: Math.random() * 100
  }));

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Statut</h4>
              <StatusIndicator 
                status={container.status === 'running' ? 'healthy' : 'unhealthy'} 
                showText 
                text={container.status}
              />
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Uptime</h4>
              <p className="text-2xl font-bold text-green-400">{container.uptime}</p>
            </div>
            <Clock className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">CPU</h4>
              <p className="text-2xl font-bold text-purple-400">{container.cpu?.toFixed(1) || 0}%</p>
            </div>
            <Cpu className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Image:</span>
            <span className="text-white ml-2 font-mono">{container.image}</span>
          </div>
          <div>
            <span className="text-gray-400">Créé:</span>
            <span className="text-white ml-2">{new Date(container.created).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Politique de redémarrage:</span>
            <span className="text-white ml-2">{container.restartPolicy || 'no'}</span>
          </div>
          <div>
            <span className="text-gray-400">Mémoire:</span>
            <span className="text-white ml-2">{container.memory}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Ports exposés</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {container.ports.map((port, idx) => (
            <div key={idx} className="bg-gray-600 rounded p-2 text-center">
              <div className="text-white font-mono text-sm">
                {port.publicPort ? `${port.publicPort}:${port.privatePort}` : port.privatePort}
              </div>
              <div className="text-gray-400 text-xs">{port.type.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Volumes montés</h4>
        <div className="space-y-2">
          {container.mounts.map((mount, idx) => (
            <div key={idx} className="bg-gray-600 rounded p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-white font-mono text-sm">{mount.source}</div>
                  <div className="text-gray-400 text-xs">→ {mount.destination}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    mount.type === 'volume' ? 'bg-blue-600 text-blue-100' :
                    mount.type === 'bind' ? 'bg-green-600 text-green-100' :
                    'bg-gray-600 text-gray-100'
                  }`}>
                    {mount.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    mount.rw ? 'bg-orange-600 text-orange-100' : 'bg-gray-600 text-gray-100'
                  }`}>
                    {mount.rw ? 'RW' : 'RO'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Logs en temps réel</h4>
        <div className="flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            Actualiser
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
            Télécharger
          </button>
        </div>
      </div>
      
      <div className="bg-black rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
        {mockLogs.map((log, idx) => (
          <div key={idx} className="flex space-x-3 mb-1">
            <span className="text-gray-500">{log.timestamp}</span>
            <span className={`${
              log.level === 'error' ? 'text-red-400' :
              log.level === 'warn' ? 'text-yellow-400' :
              log.level === 'info' ? 'text-blue-400' : 'text-gray-400'
            }`}>
              [{log.level.toUpperCase()}]
            </span>
            <span className="text-white">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInspect = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Configuration détaillée</h4>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
          <Copy className="h-4 w-4" />
          <span>Copier JSON</span>
        </button>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-4">
        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code>{JSON.stringify({
            Id: container.id,
            Name: container.name,
            Image: container.image,
            State: {
              Status: container.status,
              Running: container.status === 'running',
              Paused: container.status === 'paused',
              Restarting: container.status === 'restarting'
            },
            Config: {
              Image: container.image,
              Labels: container.labels,
              Env: container.environment || {}
            },
            NetworkSettings: {
              Networks: container.networks.reduce((acc, net) => {
                acc[net] = { NetworkID: `net_${net}` };
                return acc;
              }, {} as any)
            },
            Mounts: container.mounts
          }, null, 2)}</code>
        </pre>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-4">Utilisation des ressources</h4>
        <MetricsChart data={mockMetrics} type="area" height={300} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h5 className="text-white font-medium mb-3">Mémoire</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Utilisée:</span>
              <span className="text-blue-400">{container.memory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pourcentage:</span>
              <span className="text-green-400">{container.memoryUsage?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h5 className="text-white font-medium mb-3">Processeur</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Utilisation:</span>
              <span className="text-purple-400">{container.cpu?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Limite:</span>
              <span className="text-orange-400">Illimitée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNetworks = () => (
    <div className="space-y-4">
      <h4 className="text-white font-medium">Réseaux connectés</h4>
      <div className="space-y-3">
        {container.networks.map((network, idx) => (
          <div key={idx} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-white font-medium">{network}</h5>
                <p className="text-gray-400 text-sm">Réseau Docker</p>
              </div>
              <Network className="h-5 w-5 text-blue-400" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="text-white ml-2">bridge</span>
              </div>
              <div>
                <span className="text-gray-400">Driver:</span>
                <span className="text-white ml-2">bridge</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
            className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Container className="h-6 w-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">{container.name}</h2>
                  <p className="text-gray-400 text-sm">{container.image}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  {container.status === 'running' ? (
                    <button
                      onClick={() => onAction('stop')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onAction('start')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  )}
                  <button
                    onClick={() => onAction('restart')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Restart</span>
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'logs' && renderLogs()}
              {activeTab === 'inspect' && renderInspect()}
              {activeTab === 'metrics' && renderMetrics()}
              {activeTab === 'networks' && renderNetworks()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};