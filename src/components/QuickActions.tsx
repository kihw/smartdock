import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Plus,
  RefreshCw,
  Zap,
  Shield
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  hoverColor: string;
  action: () => void;
  disabled?: boolean;
  badge?: string | number;
}

interface QuickActionsProps {
  actions: QuickAction[];
  layout?: 'grid' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    button: 'p-2',
    icon: 'h-4 w-4',
    text: 'text-xs',
    grid: 'grid-cols-4'
  },
  md: {
    button: 'p-3',
    icon: 'h-5 w-5',
    text: 'text-sm',
    grid: 'grid-cols-3'
  },
  lg: {
    button: 'p-4',
    icon: 'h-6 w-6',
    text: 'text-base',
    grid: 'grid-cols-2'
  }
};

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  layout = 'grid',
  size = 'md'
}) => {
  const config = sizeConfig[size];

  const containerClass = layout === 'grid' 
    ? `grid ${config.grid} gap-3`
    : 'flex space-x-3 overflow-x-auto';

  return (
    <div className={containerClass}>
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.action}
          disabled={action.disabled}
          className={`
            relative ${config.button} rounded-lg transition-all duration-200 
            ${action.color} ${action.hoverColor} 
            disabled:opacity-50 disabled:cursor-not-allowed
            flex flex-col items-center justify-center space-y-1
            min-w-0 flex-shrink-0
          `}
        >
          <div className="relative">
            <action.icon className={config.icon} />
            {action.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </div>
          <span className={`${config.text} font-medium truncate w-full text-center`}>
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

// Predefined action sets
export const containerActions = (onAction: (action: string) => void): QuickAction[] => [
  {
    id: 'start',
    label: 'Démarrer',
    icon: Play,
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
    action: () => onAction('start')
  },
  {
    id: 'stop',
    label: 'Arrêter',
    icon: Square,
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    action: () => onAction('stop')
  },
  {
    id: 'restart',
    label: 'Redémarrer',
    icon: RotateCcw,
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    action: () => onAction('restart')
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
    action: () => onAction('settings')
  }
];

export const systemActions = (onAction: (action: string) => void): QuickAction[] => [
  {
    id: 'refresh',
    label: 'Actualiser',
    icon: RefreshCw,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    action: () => onAction('refresh')
  },
  {
    id: 'backup',
    label: 'Sauvegarde',
    icon: Shield,
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    action: () => onAction('backup')
  },
  {
    id: 'update',
    label: 'Mises à jour',
    icon: Download,
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
    action: () => onAction('update'),
    badge: 3
  },
  {
    id: 'smart-wakeup',
    label: 'Smart Wake-Up',
    icon: Zap,
    color: 'bg-yellow-600',
    hoverColor: 'hover:bg-yellow-700',
    action: () => onAction('smart-wakeup')
  }
];