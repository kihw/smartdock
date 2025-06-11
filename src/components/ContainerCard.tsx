import React from 'react';
import { motion } from 'framer-motion';
import {
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
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Container as ContainerType } from '../types';
import { LoadingOverlay } from './LoadingSpinner';

interface ContainerCardProps {
  container: ContainerType;
  isSelected: boolean;
  isLoading: boolean;
  onToggleSelect: () => void;
  onAction: (action: string) => void;
}

const statusColors = {
  running: 'bg-green-100 text-green-800 border-green-200',
  stopped: 'bg-red-100 text-red-800 border-red-200',
  restarting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paused: 'bg-blue-100 text-blue-800 border-blue-200',
  exited: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusIcons = {
  running: Activity,
  stopped: Square,
  restarting: RotateCcw,
  paused: Clock,
  exited: Square
};

const healthStatusColors = {
  healthy: 'text-green-400',
  unhealthy: 'text-red-400',
  starting: 'text-yellow-400',
  none: 'text-gray-400'
};

const healthStatusIcons = {
  healthy: CheckCircle,
  unhealthy: AlertTriangle,
  starting: Clock,
  none: Shield
};

export const ContainerCard: React.FC<ContainerCardProps> = ({
  container,
  isSelected,
  isLoading,
  onToggleSelect,
  onAction
}) => {
  const StatusIcon = statusIcons[container.status] || Square;
  const HealthIcon = healthStatusIcons[container.healthStatus || 'none'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-800 border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      <LoadingOverlay loading={isLoading} text="Action en cours...">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Container className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">{container.name}</h3>
                <p className="text-sm text-gray-400">{container.image}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  statusColors[container.status] || statusColors.exited
                }`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {container.status}
              </span>
              
              {container.healthStatus && container.healthStatus !== 'none' && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 border border-gray-200 ${
                  healthStatusColors[container.healthStatus]
                }`}>
                  <HealthIcon className="h-3 w-3 mr-1" />
                  {container.healthStatus}
                </span>
              )}
              
              {container.smartWakeUp && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Smart Wake-Up
                </span>
              )}
              
              {container.autoUpdate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Auto-Update
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              <span>{container.uptime || '-'}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Cpu className="h-4 w-4 mr-2" />
              <span>{container.cpu?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center text-gray-400">
              <HardDrive className="h-4 w-4 mr-2" />
              <span>{container.memory || '0 B'}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Network className="h-4 w-4 mr-2" />
              <span>{container.ports?.length || 0} ports</span>
            </div>
          </div>

          {/* Resource Usage Bars */}
          <div className="mb-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>CPU</span>
                <span>{container.cpu?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(container.cpu || 0, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Mémoire</span>
                <span>{container.memoryUsage?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(container.memoryUsage || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">Ports:</div>
            <div className="flex flex-wrap gap-1">
              {(container.ports || []).slice(0, 3).map((port, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                >
                  {port.publicPort ? `${port.publicPort}:${port.privatePort}` : port.privatePort}
                </span>
              ))}
              {(container.ports?.length || 0) > 3 && (
                <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                  +{(container.ports?.length || 0) - 3}
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {container.status === 'running' ? (
              <button
                onClick={() => onAction('stop')}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Square className="h-4 w-4" />
                <span>Arrêter</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onAction('start')}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <Play className="h-4 w-4" />
                  <span>Démarrer</span>
                </button>
                {container.smartWakeUp && (
                  <button
                    onClick={() => onAction('smart-wakeup')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-md transition-colors duration-200"
                    title="Smart Wake-Up"
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => onAction('restart')}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAction('settings')}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md transition-colors duration-200"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </LoadingOverlay>
    </motion.div>
  );
};