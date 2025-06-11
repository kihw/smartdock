import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Container,
  Layers,
  Globe,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  User
} from 'lucide-react';
import { Activity as ActivityType } from '../types';

interface ActivityFeedProps {
  activities: ActivityType[];
  maxItems?: number;
  showUser?: boolean;
}

const activityIcons = {
  container: Container,
  stack: Layers,
  proxy: Globe,
  schedule: Clock,
  update: RefreshCw,
  system: Activity
};

const statusColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
};

const statusIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 10,
  showUser = false
}) => {
  const displayActivities = activities.slice(0, maxItems);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return activityTime.toLocaleDateString('fr-FR');
  };

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Aucune activité récente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayActivities.map((activity, index) => {
        const TypeIcon = activityIcons[activity.type] || Activity;
        const StatusIcon = statusIcons[activity.status] || Info;
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex-shrink-0">
              <div className="relative">
                <TypeIcon className="h-5 w-5 text-blue-400" />
                <StatusIcon className={`h-3 w-3 absolute -bottom-1 -right-1 ${statusColors[activity.status]}`} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white font-medium truncate">
                  {activity.message}
                </p>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">
                  {activity.target}
                </span>
                {activity.duration && (
                  <span className="text-xs text-gray-500">
                    • {activity.duration}ms
                  </span>
                )}
                {showUser && activity.user && (
                  <span className="text-xs text-gray-500 flex items-center">
                    • <User className="h-3 w-3 mr-1" /> {activity.user}
                  </span>
                )}
              </div>
              
              {activity.details && Object.keys(activity.details).length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {Object.entries(activity.details).map(([key, value]) => (
                    <span key={key} className="mr-3">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};