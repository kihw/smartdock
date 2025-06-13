import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Pocket as Docker, 
  Globe, 
  Shield, 
  Bell, 
  Database, 
  Server, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Key, 
  HardDrive,
  Monitor,
  Users,
  Palette,
  Download,
  Upload
} from 'lucide-react';
import { useNotifications } from '../utils/notifications';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'docker',
    title: 'Configuration Docker',
    description: 'Paramètres de connexion et configuration Docker',
    icon: Docker
  },
  {
    id: 'proxy',
    title: 'Configuration Proxy',
    description: 'Paramètres Caddy et gestion des domaines',
    icon: Globe
  },
  {
    id: 'security',
    title: 'Sécurité',
    description: 'Authentification et paramètres de sécurité',
    icon: Shield
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Alertes et notifications système',
    icon: Bell
  },
  {
    id: 'storage',
    title: 'Stockage & Sauvegarde',
    description: 'Configuration des volumes et backups',
    icon: HardDrive
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    description: 'Surveillance et métriques système',
    icon: Monitor
  },
  {
    id: 'users',
    title: 'Utilisateurs',
    description: 'Gestion des utilisateurs et permissions',
    icon: Users
  },
  {
    id: 'appearance',
    title: 'Apparence',
    description: 'Thème et personnalisation interface',
    icon: Palette
  },
  {
    id: 'system',
    title: 'Système',
    description: 'Paramètres généraux du système',
    icon: Server
  }
];

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('docker');
  const [loading, setLoading] = useState(false);
  const { success, error: notifyError } = useNotifications();

  // Docker settings
  const [dockerHost, setDockerHost] = useState('unix:///var/run/docker.sock');
  const [dockerTLS, setDockerTLS] = useState(false);
  const [dockerTimeout, setDockerTimeout] = useState(30);

  // Proxy settings
  const [caddyConfig, setCaddyConfig] = useState('/etc/caddy/Caddyfile');
  const [mainDomain, setMainDomain] = useState('localhost');
  const [autoSSL, setAutoSSL] = useState(true);
  const [forceHTTPS, setForceHTTPS] = useState(true);

  // Security settings
  const [apiKey, setApiKey] = useState('');
  const [enableAuth, setEnableAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(24);
  const [rateLimiting, setRateLimiting] = useState(true);

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: { enabled: true, smtp: { host: '', port: 587, user: '', password: '' } },
    discord: { enabled: false, webhook: '' },
    slack: { enabled: false, webhook: '' },
    pushover: { enabled: false, userKey: '', appToken: '' }
  });

  // Monitoring settings
  const [monitoring, setMonitoring] = useState({
    enabled: true,
    retention: '30d',
    alertThresholds: { cpu: 80, memory: 85, disk: 90 }
  });

  // Appearance settings
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Europe/Paris');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Paramètres sauvegardés', 'Tous les paramètres ont été sauvegardés avec succès');
    } catch (error) {
      notifyError('Erreur', 'Impossible de sauvegarder les paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (service: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Test ${service}`, `Connexion ${service} réussie`);
    } catch (error) {
      notifyError(`Erreur ${service}`, `Test de connexion ${service} échoué`);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setApiKey(key);
    success('Clé générée', 'Nouvelle clé API générée avec succès');
  };

  const exportSettings = () => {
    const settings = {
      docker: { host: dockerHost, tls: dockerTLS, timeout: dockerTimeout },
      proxy: { config: caddyConfig, domain: mainDomain, ssl: autoSSL, https: forceHTTPS },
      security: { auth: enableAuth, timeout: sessionTimeout, rateLimit: rateLimiting },
      notifications,
      monitoring,
      appearance: { theme, language, timezone }
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartdock-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    success('Export réussi', 'Paramètres exportés avec succès');
  };

  const renderDockerSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Docker Host
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={dockerHost}
            onChange={(e) => setDockerHost(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="unix:///var/run/docker.sock"
          />
          <button
            onClick={() => handleTest('docker')}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Tester
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Chemin vers le socket Docker ou URL TCP (ex: tcp://localhost:2376)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Timeout (secondes)
          </label>
          <input
            type="number"
            value={dockerTimeout}
            onChange={(e) => setDockerTimeout(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="5"
            max="300"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">TLS/SSL</h4>
            <p className="text-sm text-gray-400">Connexion sécurisée</p>
          </div>
          <button
            onClick={() => setDockerTLS(!dockerTLS)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              dockerTLS ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                dockerTLS ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Docker Daemon</h4>
              <p className="text-sm text-gray-400">État de connexion</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Version Docker</h4>
              <p className="text-sm text-gray-400">24.0.7</p>
            </div>
            <Docker className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Options avancées</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Activer les métriques Docker</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Surveillance automatique des conteneurs</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-300">Nettoyage automatique des images inutilisées</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Notifications en temps réel</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Clé API
        </label>
        <div className="flex space-x-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez une clé API sécurisée"
          />
          <button
            onClick={generateApiKey}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-1"
          >
            <Key className="h-4 w-4" />
            <span>Générer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Timeout de session (heures)
          </label>
          <input
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="168"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Authentification</h4>
              <p className="text-sm text-gray-400">Requise pour l'API</p>
            </div>
            <button
              onClick={() => setEnableAuth(!enableAuth)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                enableAuth ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enableAuth ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Limitation de débit</h4>
              <p className="text-sm text-gray-400">Protection contre le spam</p>
            </div>
            <button
              onClick={() => setRateLimiting(!rateLimiting)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                rateLimiting ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  rateLimiting ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium">Recommandations de sécurité</h4>
            <ul className="text-yellow-200 text-sm mt-2 space-y-1">
              <li>• Utilisez une clé API forte et unique</li>
              <li>• Activez l'authentification à deux facteurs</li>
              <li>• Surveillez régulièrement les journaux d'accès</li>
              <li>• Limitez l'accès réseau à SmartDock</li>
              <li>• Mettez à jour régulièrement le système</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoringSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Monitoring activé</h3>
          <p className="text-sm text-gray-400">Surveillance système et alertes</p>
        </div>
        <button
          onClick={() => setMonitoring(prev => ({ ...prev, enabled: !prev.enabled }))}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            monitoring.enabled ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              monitoring.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Rétention des métriques
        </label>
        <select
          value={monitoring.retention}
          onChange={(e) => setMonitoring(prev => ({ ...prev, retention: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">7 jours</option>
          <option value="30d">30 jours</option>
          <option value="90d">90 jours</option>
          <option value="1y">1 an</option>
        </select>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Seuils d'alerte</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              CPU (%)
            </label>
            <input
              type="number"
              value={monitoring.alertThresholds.cpu}
              onChange={(e) => setMonitoring(prev => ({
                ...prev,
                alertThresholds: { ...prev.alertThresholds, cpu: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Mémoire (%)
            </label>
            <input
              type="number"
              value={monitoring.alertThresholds.memory}
              onChange={(e) => setMonitoring(prev => ({
                ...prev,
                alertThresholds: { ...prev.alertThresholds, memory: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Disque (%)
            </label>
            <input
              type="number"
              value={monitoring.alertThresholds.disk}
              onChange={(e) => setMonitoring(prev => ({
                ...prev,
                alertThresholds: { ...prev.alertThresholds, disk: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Thème
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dark">Sombre</option>
            <option value="light">Clair</option>
            <option value="auto">Automatique</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Langue
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Fuseau horaire
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
          <option value="Europe/London">Europe/London (UTC+0)</option>
          <option value="America/New_York">America/New_York (UTC-5)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
        </select>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Aperçu du thème</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-600 rounded p-3 text-center text-white text-sm">Primaire</div>
          <div className="bg-green-600 rounded p-3 text-center text-white text-sm">Succès</div>
          <div className="bg-red-600 rounded p-3 text-center text-white text-sm">Erreur</div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'docker':
        return renderDockerSettings();
      case 'security':
        return renderSecuritySettings();
      case 'monitoring':
        return renderMonitoringSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Section en cours de développement...</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des paramètres..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="mt-2 text-gray-400">
            Configuration de SmartDock et intégrations
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={exportSettings}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation des sections */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <section.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm opacity-80">{section.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu de la section */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              {React.createElement(
                settingsSections.find(section => section.id === activeSection)?.icon || SettingsIcon,
                { className: "h-6 w-6 text-blue-400" }
              )}
              <h2 className="text-xl font-semibold text-white">
                {settingsSections.find(section => section.id === activeSection)?.title}
              </h2>
            </div>
            
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};