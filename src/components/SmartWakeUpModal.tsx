import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock, Activity, CheckCircle } from 'lucide-react';

interface SmartWakeUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerName: string;
  domain: string;
  onWakeUp: () => Promise<void>;
}

export const SmartWakeUpModal: React.FC<SmartWakeUpModalProps> = ({
  isOpen,
  onClose,
  containerName,
  domain,
  onWakeUp
}) => {
  const [status, setStatus] = useState<'waiting' | 'starting' | 'checking' | 'ready' | 'error'>('waiting');
  const [progress, setProgress] = useState(0);

  const handleWakeUp = async () => {
    try {
      setStatus('starting');
      setProgress(25);
      
      await onWakeUp();
      
      setStatus('checking');
      setProgress(75);
      
      // Simulate health check
      setTimeout(() => {
        setStatus('ready');
        setProgress(100);
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          window.location.href = `https://${domain}`;
        }, 2000);
      }, 2000);
      
    } catch (error) {
      setStatus('error');
      console.error('Failed to wake up container:', error);
    }
  };

  const statusConfig = {
    waiting: {
      icon: Zap,
      title: 'Conteneur en veille',
      message: `Le conteneur "${containerName}" est actuellement arrêté. Voulez-vous le démarrer ?`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    starting: {
      icon: Activity,
      title: 'Démarrage en cours...',
      message: 'Le conteneur est en cours de démarrage. Veuillez patienter.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    checking: {
      icon: Clock,
      title: 'Vérification de l\'état',
      message: 'Vérification que le service est prêt à recevoir des connexions.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    ready: {
      icon: CheckCircle,
      title: 'Service prêt !',
      message: 'Le conteneur est maintenant actif. Redirection en cours...',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    error: {
      icon: X,
      title: 'Erreur',
      message: 'Une erreur est survenue lors du démarrage du conteneur.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

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
            className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${currentStatus.bgColor}`}>
                  <StatusIcon className={`h-6 w-6 ${currentStatus.color}`} />
                </div>
                <h2 className="text-xl font-semibold text-white">Smart Wake-Up</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  {currentStatus.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {currentStatus.message}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Domaine:</span>
                  <span className="text-blue-400 font-mono">{domain}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Conteneur:</span>
                  <span className="text-white">{containerName}</span>
                </div>
              </div>

              {status !== 'waiting' && status !== 'error' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {status === 'waiting' && (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleWakeUp}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Démarrer</span>
                    </button>
                  </>
                )}
                
                {status === 'error' && (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={handleWakeUp}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Réessayer
                    </button>
                  </>
                )}
                
                {(status === 'starting' || status === 'checking') && (
                  <button
                    disabled
                    className="w-full bg-gray-600 text-gray-400 py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Activity className="h-4 w-4" />
                    </motion.div>
                    <span>Veuillez patienter...</span>
                  </button>
                )}
                
                {status === 'ready' && (
                  <button
                    disabled
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Redirection en cours...</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};