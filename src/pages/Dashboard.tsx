import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Layers,
  Globe,
  Clock,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNotifications } from '../utils/notifications';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MetricsChart } from '../components/MetricsChart';
import { ActivityFeed } from '../components/ActivityFeed';
import { StatusIndicator } from '../components/StatusIndicator';
import { QuickActions, systemActions } from '../components/QuickActions';
import { SystemStats, Activity as ActivityType } from '../types';

export const Dashboard: React.FC = () => {
  const [metricsData, setMetricsData] = useState<Array<{
    timestamp: string;
    cpu: number;
    memory: number;
  }>>([]);

  const { data: stats, loading, error, refetch } = useApi<SystemStats>('/system/stats');
  const { data: activities } = useApi<ActivityType[]>('/activities');
  const { success, error: notifyError } = useNotifications();

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket('', {
    onMessage: (data) => {
      try {
        if (data?.event === 'container:started') {
          success('Conteneur démarré', `Le conteneur ${data.data?.containerName || 'inconnu'} a été démarré avec succès`);
          refetch();
        } else if (data?.event === 'container:stopped') {
          notifyError('Conteneur arrêté', `Le conteneur ${data.data?.containerName || 'inconnu'} a été arrêté`);
          refetch();
        } else if (data?.event === 'metrics:update') {
          // Update metrics data
          setMetricsData(prev => {
            const newData = [...prev, {
              timestamp: new Date().toISOString(),
              cpu: data.data?.cpu || 0,
              memory: data.data?.memory || 0
            }];
            return newData.slice(-20); // Keep last 20 data points
          });
        }
      } catch (err) {
        console.warn('Error processing WebSocket message:', err);
      }
    },
    onConnect: () => {
      console.log('Connected to WebSocket');
    },
    onDisconnect: () => {
      console.log('Disconnected from WebSocket');
    },
    onError: (error) => {
      console.warn('WebSocket error:', error);
    }
  });

  // Generate mock metrics data if none available
  useEffect(() => {
    if (stats && metricsData.length === 0) {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - (9 - i) * 60000).toISOString(),
        cpu: Math.random() * 100,
        memory: Math.random() * 100
      }));
      setMetricsData(mockData);
    }
  }, [stats, metricsData.length]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'refresh':
        refetch().catch(console.error);
        success('Actualisation', 'Données mises à jour');
        break;
      case 'backup':
        success('Sauvegarde', 'Sauvegarde lancée en arrière-plan');
        break;
      case 'update':
        success('Mises à jour', 'Vérification des mises à jour...');
        break;
      case 'smart-wakeup':
        success('Smart Wake-Up', 'Configuration Smart Wake-Up ouverte');
        break;
      default:
        console.log(`Action ${action} not implemented`);
    }
  };

  const statsCards = stats ? [
    {
      name: 'Conteneurs Actifs',
      value: stats.containers?.running?.toString() || '0',
      total: stats.containers?.total || 0,
      change: '+2',
      changeType: 'positive' as const,
      icon: Container,
      color: 'text-green-400',
      status: stats.containers?.running > 0 ? 'healthy' : 'warning'
    },
    {
      name: 'Stacks Déployées',
      value: stats.stacks?.running?.toString() || '0',
      total: stats.stacks?.total || 0,
      change: '0',
      changeType: 'neutral' as const,
      icon: Layers,
      color: 'text-blue-400',
      status: stats.stacks?.running > 0 ? 'healthy' : 'unknown'
    },
    {
      name: 'Utilisation CPU',
      value: `${Math.round(stats.system?.cpu || 0)}%`,
      change: (stats.system?.cpu || 0) > 80 ? 'Élevé' : 'Normal',
      changeType: (stats.system?.cpu || 0) > 80 ? 'negative' : 'positive',
      icon: Activity,
      color: 'text-purple-400',
      status: (stats.system?.cpu || 0) > 80 ? 'warning' : 'healthy'
    },
    {
      name: 'Mémoire',
      value: `${Math.round(stats.system?.memory?.percentage || 0)}%`,
      change: `${((stats.system?.memory?.used || 0) / (1024 * 1024 * 1024)).toFixed(1)}GB`,
      changeType: 'neutral' as const,
      icon: TrendingUp,
      color: 'text-orange-400',
      status: (stats.system?.memory?.percentage || 0) > 85 ? 'warning' : 'healthy'
    }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement du dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Erreur lors du chargement des données</div>
        <button 
          onClick={() => refetch().catch(console.error)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Vue d'ensemble de votre infrastructure Docker
          </p>
          <div className="flex items-center mt-2 text-sm">
            <StatusIndicator 
              status={isConnected ? 'healthy' : 'unhealthy'} 
              size="sm" 
              showText 
              text={isConnected ? 'Connecté en temps réel' : 'Déconnecté'}
            />
          </div>
        </div>
        
        <QuickActions
          actions={systemActions(handleQuickAction)}
          layout="horizontal"
          size="md"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <StatusIndicator status={stat.status} size="sm" />
              </div>
              <div className="mt-4">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-white">
                      {stat.value}
                    </div>
                    {stat.total && (
                      <div className="ml-2 text-sm text-gray-400">
                        / {stat.total}
                      </div>
                    )}
                    {stat.change !== '0' && (
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-green-400'
                            : stat.changeType === 'negative'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {stat.change}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Metrics Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-gray-800 shadow-lg rounded-lg border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Métriques Système</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-400">CPU</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-400">Mémoire</span>
              </div>
            </div>
          </div>
          <MetricsChart data={metricsData} type="area" height={250} />
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">État du Système</h3>
            <Server className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Docker Daemon</span>
              <StatusIndicator 
                status={stats?.docker?.status === 'connected' ? 'healthy' : 'unhealthy'}
                size="sm"
                showText
                text={stats?.docker?.status === 'connected' ? 'Connecté' : 'Déconnecté'}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Version Docker</span>
              <span className="text-gray-300">{stats?.docker?.version || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Smart Wake-Up</span>
              <StatusIndicator 
                status="healthy"
                size="sm"
                showText
                text="Activé"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uptime Système</span>
              <span className="text-gray-300">{stats?.system?.uptime || 'N/A'}</span>
            </div>
            {stats?.system?.load && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Charge Système</span>
                <span className="text-gray-300">
                  {stats.system.load.map(l => l.toFixed(2)).join(', ')}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Activité Récente</h3>
        <ActivityFeed activities={activities || []} maxItems={8} />
      </motion.div>
    </div>
  );
};