import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Plus,
  Settings,
  Trash2,
  ExternalLink,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  Edit,
  Search,
  Filter
} from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useNotifications } from '../utils/notifications';
import { LoadingSpinner, LoadingOverlay } from '../components/LoadingSpinner';
import { ProxyRuleModal } from '../components/ProxyRuleModal';
import { ProxyRule } from '../types';

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const statusIcons = {
  active: CheckCircle,
  inactive: Clock,
  error: AlertCircle,
  pending: RefreshCw
};

export const Proxy: React.FC = () => {
  const [autoProxy, setAutoProxy] = useState(true);
  const [mainDomain, setMainDomain] = useState('localhost');
  const [ruleModal, setRuleModal] = useState<{
    isOpen: boolean;
    rule?: ProxyRule | null;
  }>({ isOpen: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: proxyRules, loading, error, refetch } = useApi<ProxyRule[]>('/proxy/rules');
  const { success, error: notifyError } = useNotifications();

  // Mutations for proxy actions
  const createMutation = useApiMutation('/proxy/rules', 'POST');
  const updateMutation = useApiMutation('', 'PUT');
  const deleteMutation = useApiMutation('', 'DELETE');
  const testMutation = useApiMutation('', 'POST');

  const handleSaveRule = async (ruleData: Partial<ProxyRule>) => {
    try {
      if (ruleModal.rule) {
        // Update existing rule
        await updateMutation.mutate(ruleData, { 
          url: `/proxy/rules/${ruleModal.rule.id}` 
        });
        success('Règle mise à jour', 'La règle proxy a été mise à jour avec succès');
      } else {
        // Create new rule
        await createMutation.mutate(ruleData);
        success('Règle créée', 'La nouvelle règle proxy a été créée avec succès');
      }
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Impossible de sauvegarder la règle');
    }
  };

  const handleToggleRule = async (id: string) => {
    try {
      const rule = proxyRules?.find(r => r.id === id);
      if (!rule) return;

      const newStatus = rule.status === 'active' ? 'inactive' : 'active';
      await updateMutation.mutate({ status: newStatus }, { 
        url: `/proxy/rules/${id}` 
      });
      
      success('Règle mise à jour', `La règle ${rule.subdomain}.${rule.domain} est maintenant ${newStatus}`);
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Impossible de modifier la règle');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const rule = proxyRules?.find(r => r.id === id);
      if (!rule) return;

      await deleteMutation.mutate(undefined, { 
        url: `/proxy/rules/${id}` 
      });
      
      success('Règle supprimée', `La règle ${rule.subdomain}.${rule.domain} a été supprimée`);
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Impossible de supprimer la règle');
    }
  };

  const handleTestRule = async (rule: ProxyRule) => {
    try {
      await testMutation.mutate({ ruleId: rule.id }, { 
        url: `/proxy/rules/${rule.id}/test` 
      });
      
      success('Test réussi', `La règle ${rule.subdomain}.${rule.domain} fonctionne correctement`);
      refetch().catch(console.error);
    } catch (error) {
      notifyError('Erreur', 'Le test de la règle a échoué');
    }
  };

  // Filter rules based on search and status
  const filteredRules = proxyRules?.filter(rule => {
    const matchesSearch = rule.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des règles proxy..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Erreur lors du chargement des règles proxy</div>
        <button 
          onClick={() => refetch().catch(console.error)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const rules = proxyRules || [];
  const activeRules = rules.filter(r => r.status === 'active').length;
  const sslRules = rules.filter(r => r.ssl).length;
  const autoGeneratedRules = rules.filter(r => r.autoGenerated).length;
  const errorRules = rules.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Proxy & Domaines</h1>
          <p className="mt-2 text-gray-400">
            Configuration automatique des sous-domaines avec Caddy
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setRuleModal({ isOpen: true })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Règle</span>
          </button>
        </div>
      </div>

      {/* Configuration principale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Configuration Proxy</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Proxy Automatique</h3>
              <p className="text-sm text-gray-400">
                Créer automatiquement des sous-domaines pour les conteneurs
              </p>
            </div>
            <button
              onClick={() => setAutoProxy(!autoProxy)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                autoProxy ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoProxy ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-blue-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{activeRules}</div>
              <div className="text-sm text-gray-400">Règles Actives</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{sslRules}</div>
              <div className="text-sm text-gray-400">Certificats SSL</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-purple-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{autoGeneratedRules}</div>
              <div className="text-sm text-gray-400">Auto-générées</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <div className="text-2xl font-bold text-white">{errorRules}</div>
              <div className="text-sm text-gray-400">Erreurs</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des règles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts ({rules.length})</option>
              <option value="active">Actives ({activeRules})</option>
              <option value="inactive">Inactives ({rules.filter(r => r.status === 'inactive').length})</option>
              <option value="error">Erreurs ({errorRules})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Règles de proxy */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Règles de Proxy</h2>
        
        {filteredRules.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-400 mb-4">Aucune règle trouvée pour "{searchTerm}"</div>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Effacer la recherche
                </button>
              </>
            ) : (
              <>
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-400 mb-4">Aucune règle proxy configurée</div>
                <button 
                  onClick={() => setRuleModal({ isOpen: true })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Créer une règle
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRules.map((rule, index) => {
              const StatusIcon = statusIcons[rule.status] || Clock;
              const isLoading = updateMutation.loading || deleteMutation.loading || testMutation.loading;
              
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all duration-200"
                >
                  <LoadingOverlay loading={isLoading} text="Action en cours...">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="h-5 w-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">
                            {rule.subdomain}.{rule.domain}
                          </h3>
                          <a
                            href={`${rule.ssl ? 'https' : 'http'}://${rule.subdomain}.${rule.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              statusColors[rule.status] || statusColors.inactive
                            }`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {rule.status}
                          </span>
                          {rule.ssl && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <Shield className="h-3 w-3 mr-1" />
                              SSL
                            </span>
                          )}
                          {rule.autoGenerated && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              Auto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cible:</span>
                        <span className="text-gray-300 font-mono">{rule.target}</span>
                      </div>
                      {rule.container && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Conteneur:</span>
                          <span className="text-blue-400">{rule.container}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dernière vérification:</span>
                        <span className="text-gray-300">{new Date(rule.lastCheck).toLocaleString()}</span>
                      </div>
                      {rule.middleware && rule.middleware.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Middleware:</span>
                          <span className="text-gray-300">{rule.middleware.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTestRule(rule)}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <Activity className="h-4 w-4" />
                        <span>Tester</span>
                      </button>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        disabled={isLoading}
                        className={`py-2 px-3 rounded-md transition-colors duration-200 ${
                          rule.status === 'active'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {rule.status === 'active' ? (
                          <RefreshCw className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setRuleModal({ isOpen: true, rule })}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {!rule.autoGenerated && (
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </LoadingOverlay>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proxy Rule Modal */}
      <ProxyRuleModal
        isOpen={ruleModal.isOpen}
        onClose={() => setRuleModal({ isOpen: false })}
        rule={ruleModal.rule}
        onSave={handleSaveRule}
        onTest={handleTestRule}
      />
    </div>
  );
};