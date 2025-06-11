import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Pocket as Docker, Globe, Shield, Bell, Database, Server, Save, RefreshCw, CheckCircle, AlertCircle, Key, HardDrive } from 'lucide-react';

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
    title: 'Stockage',
    description: 'Configuration des volumes et backups',
    icon: HardDrive
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
  const [dockerHost, setDockerHost] = useState('unix:///var/run/docker.sock');
  const [caddyConfig, setCaddyConfig] = useState('/etc/caddy/Caddyfile');
  const [mainDomain, setMainDomain] = useState('example.com');
  const [apiKey, setApiKey] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    discord: false,
    slack: false
  });

  const handleSave = () => {
    console.log('Saving settings...');
    // Ici on implémenterait la sauvegarde
  };

  const handleTest = (service: string) => {
    console.log(`Testing ${service} connection...`);
    // Ici on implémenterait les tests de connexion
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Tester
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Chemin vers le socket Docker ou URL TCP
        </p>
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
        </div>
      </div>
    </div>
  );

  const renderProxySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Domaine Principal
        </label>
        <input
          type="text"
          value={mainDomain}
          onChange={(e) => setMainDomain(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Fichier Configuration Caddy
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={caddyConfig}
            onChange={(e) => setCaddyConfig(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/etc/caddy/Caddyfile"
          />
          <button
            onClick={() => handleTest('caddy')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Tester
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Service Caddy</h4>
              <p className="text-sm text-gray-400">Statut du reverse proxy</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Certificats SSL</h4>
              <p className="text-sm text-gray-400">Let's Encrypt actif</p>
            </div>
            <Shield className="h-5 w-5 text-green-400" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Configuration SSL</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Génération automatique de certificats SSL</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Redirection HTTP vers HTTPS</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-300">HSTS (HTTP Strict Transport Security)</span>
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
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
            Générer
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Paramètres d'authentification</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Authentification requise pour l'API</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-300">Authentification à deux facteurs</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Journalisation des accès</span>
          </label>
        </div>
      </div>

      <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium">Recommandations de sécurité</h4>
            <ul className="text-yellow-200 text-sm mt-2 space-y-1">
              <li>• Utilisez une clé API forte et unique</li>
              <li>• Activez l'authentification à deux facteurs</li>
              <li>• Surveillez régulièrement les journaux d'accès</li>
              <li>• Limitez l'accès réseau à SmartDock</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-3">Canaux de notification</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-white">Email</h5>
              <p className="text-sm text-gray-400">Notifications par email</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({...prev, email: !prev.email}))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notifications.email ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.email ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-white">Discord</h5>
              <p className="text-sm text-gray-400">Webhook Discord</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({...prev, discord: !prev.discord}))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notifications.discord ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.discord ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-white">Slack</h5>
              <p className="text-sm text-gray-400">Webhook Slack</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({...prev, slack: !prev.slack}))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notifications.slack ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.slack ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Types d'événements</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Démarrage/arrêt de conteneurs</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-gray-300">Erreurs et pannes</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-300">Mises à jour disponibles</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-300">Smart Wake-Up activé</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'docker':
        return renderDockerSettings();
      case 'proxy':
        return renderProxySettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'storage':
        return (
          <div className="text-center py-12">
            <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Configuration du stockage à venir...</p>
          </div>
        );
      case 'system':
        return (
          <div className="text-center py-12">
            <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Paramètres système à venir...</p>
          </div>
        );
      default:
        return null;
    }
  };

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
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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