import React from 'react';
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
  RefreshCw
} from 'lucide-react';

const stats = [
  {
    name: 'Conteneurs Actifs',
    value: '12',
    change: '+2',
    changeType: 'positive',
    icon: Container,
    color: 'text-green-400'
  },
  {
    name: 'Stacks Déployées',
    value: '4',
    change: '0',
    changeType: 'neutral',
    icon: Layers,
    color: 'text-blue-400'
  },
  {
    name: 'Domaines Configurés',
    value: '8',
    change: '+1',
    changeType: 'positive',
    icon: Globe,
    color: 'text-purple-400'
  },
  {
    name: 'Tâches Programmées',
    value: '6',
    change: '+1',
    changeType: 'positive',
    icon: Clock,
    color: 'text-orange-400'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'start',
    message: 'Conteneur web-app démarré via Smart Wake-Up',
    time: '2 min',
    icon: Zap,
    color: 'text-green-400'
  },
  {
    id: 2,
    type: 'update',
    message: 'Mise à jour automatique de nginx:latest',
    time: '15 min',
    icon: TrendingUp,
    color: 'text-blue-400'
  },
  {
    id: 3,
    type: 'proxy',
    message: 'Nouveau sous-domaine api.example.com configuré',
    time: '1h',
    icon: Globe,
    color: 'text-purple-400'
  },
  {
    id: 4,
    type: 'security',
    message: 'Scan de sécurité terminé - 0 vulnérabilité',
    time: '2h',
    icon: Shield,
    color: 'text-green-400'
  }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Vue d'ensemble de votre infrastructure Docker
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">
                        {stat.value}
                      </div>
                      {stat.change !== '0' && (
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {stat.change}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">État du Système</h3>
            <Activity className="h-5 w-5 text-green-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Docker Daemon</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Actif
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Proxy Caddy</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Actif
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Smart Wake-Up</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activé
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Mises à jour Auto</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Programmé
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Activité Récente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">{activity.message}</p>
                  <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2">
            <Container className="h-4 w-4" />
            <span>Nouveau Conteneur</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>Déployer Stack</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Config Proxy</span>
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Tout Mettre à Jour</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};