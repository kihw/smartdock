import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, XCircle, Loader } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'healthy' | 'unhealthy' | 'warning' | 'unknown' | 'loading';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  text?: string;
  animated?: boolean;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    text: 'Sain'
  },
  unhealthy: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    text: 'Défaillant'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    text: 'Attention'
  },
  unknown: {
    icon: Clock,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/20',
    text: 'Inconnu'
  },
  loading: {
    icon: Loader,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    text: 'Chargement'
  }
};

const sizeConfig = {
  sm: {
    icon: 'h-3 w-3',
    container: 'h-6 w-6',
    text: 'text-xs'
  },
  md: {
    icon: 'h-4 w-4',
    container: 'h-8 w-8',
    text: 'text-sm'
  },
  lg: {
    icon: 'h-5 w-5',
    container: 'h-10 w-10',
    text: 'text-base'
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showText = false,
  text,
  animated = true
}) => {
  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];
  const Icon = config.icon;

  const displayText = text || config.text;

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        className={`${sizeClasses.container} ${config.bgColor} rounded-full flex items-center justify-center`}
        animate={animated && status === 'loading' ? { rotate: 360 } : {}}
        transition={animated && status === 'loading' ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      >
        <Icon className={`${sizeClasses.icon} ${config.color}`} />
      </motion.div>
      
      {showText && (
        <span className={`${sizeClasses.text} ${config.color} font-medium`}>
          {displayText}
        </span>
      )}
    </div>
  );
};