import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
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
  GitBranch,
  Calendar,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Stack, Service } from '../types';
import { StatusIndicator } from './StatusIndicator';
import { MetricsChart } from './MetricsChart';

interface StackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stack: Stack | null;
  onAction: (action: string, serviceId?: string) => void;
}

export const StackDetailsModal: React.FC<StackDetailsModalProps> = ({
  isOpen,
  onClose,
  stack,
  onAction
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'logs' | 'compose' | 'metrics'>('overview');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (!stack) return null;

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Layers },
    { id: 'services', label: 'Services', icon: Container },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'compose', label: 'Compose', icon: Settings },
    { id: 'metrics', label: 'Métriques', icon: Activity }
  ];

  const mockLogs = [
    { timestamp: '2024-01-15 10:30:15', level: 'info', service: 'nginx', message: 'Server started on port 80' },
    { timestamp: '2024-01-15 10:30:16', level: 'info', service: 'api', message: 'Connected to database' },
    { timestamp: '2024-01-15 10:30:17', level: 'warn', service: 'postgres', message: 'High memory usage detected' },
    { timestamp: '2024-01-15 10:30:18', level: 'info', service: 'nginx', message: 'Request processed: GET /' }
  ];

  const mockComposeFile = `version: '3.8'
services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    depends_on:
      - api
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    
  api:
    image: node:18-alpine
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
    
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`;

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
              <h4 className="text-white font-medium">Services</h4>
              <p className="text-2xl font-bold text-blue-400">{stack.runningServices}/{stack.totalServices}</p>
            </div>
            <Container className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Uptime</h4>
              <p className="text-2xl font-bold text-green-400">{stack.uptime}</p>
            </div>
            <Clock className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Statut</h4>
              <StatusIndicator status={stack.status === 'running' ? 'healthy' : 'warning'} showText />
            </div>
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Fichier Compose:</span>
            <span className="text-white ml-2 font-mono">{stack.composeFile}</span>
          </div>
          <div>
            <span className="text-gray-400">Dernier déploiement:</span>
            <span className="text-white ml-2">{new Date(stack.lastDeploy).toLocaleString()}</span>
          </div>
          {stack.githubRepo && (
            <div>
              <span className="text-gray-400">Repository:</span>
              <span className="text-blue-400 ml-2 font-mono">{stack.githubRepo}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400">Auto-Update:</span>
            <span className={`ml-2 ${stack.autoUpdate ? 'text-green-400' : 'text-gray-400'}`}>
              {stack.autoUpdate ? 'Activé' : 'Désactivé'}
            </span>
          </div>
        </div>
      </div>

      {Object.keys(stack.environment).length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Variables d'environnement</h4>
          <div className="space-y-2">
            {Object.entries(stack.environment).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-400 font-mono">{key}:</span>
                <span className="text-white font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderServices = () => (
    <div className="space-y-4">
      {stack.services.map((service) => (
        <div key={service.id} className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Container className="h-5 w-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">{service.name}</h4>
                <p className="text-sm text-gray-400">{service.image}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIndicator 
                status={service.status === 'running' ? 'healthy' : 'unhealthy'} 
                showText 
              />
              <button
                onClick={() => onAction('service-logs', service.id)}
                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-md transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Répliques:</span>
              <span className="text-white ml-2">{service.replicas}</span>
            </div>
            <div>
              <span className="text-gray-400">Ports:</span>
              <span className="text-white ml-2">{service.ports.length}</span>
            </div>
            <div>
              <span className="text-gray-400">CPU:</span>
              <span className="text-green-400 ml-2">{Math.random() * 100 | 0}%</span>
            </div>
            <div>
              <span className="text-gray-400">Mémoire:</span>
              <span className="text-blue-400 ml-2">{Math.random() * 100 | 0}%</span>
            </div>
          </div>

          {service.ports.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-400 text-sm">Ports exposés:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {service.ports.map((port, idx) => (
                  <span key={idx} className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded">
                    {port.publicPort ? `${port.publicPort}:${port.privatePort}` : port.privatePort}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
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
            <span className="text-purple-400">{log.service}:</span>
            <span className="text-white">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompose = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Docker Compose</h4>
        <div className="flex space-x-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
            <Upload className="h-4 w-4" />
            <span>Redéployer</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-4">
        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code>{mockComposeFile}</code>
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
          <h5 className="text-white font-medium mb-3">Réseau</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Trafic entrant:</span>
              <span className="text-green-400">1.2 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trafic sortant:</span>
              <span className="text-blue-400">856 MB</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h5 className="text-white font-medium mb-3">Stockage</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Volumes utilisés:</span>
              <span className="text-purple-400">2.1 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Images:</span>
              <span className="text-orange-400">1.8 GB</span>
            </div>
          </div>
        </div>
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
                <Layers className="h-6 w-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">{stack.name}</h2>
                  <p className="text-gray-400 text-sm">{stack.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAction('start')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start</span>
                  </button>
                  <button
                    onClick={() => onAction('stop')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
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
              {activeTab === 'services' && renderServices()}
              {activeTab === 'logs' && renderLogs()}
              {activeTab === 'compose' && renderCompose()}
              {activeTab === 'metrics' && renderMetrics()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};