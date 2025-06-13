import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Globe,
  Shield,
  Settings,
  Plus,
  Trash2,
  Activity,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProxyRule } from '../types';

interface ProxyRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: ProxyRule | null;
  onSave: (rule: Partial<ProxyRule>) => void;
  onTest?: (rule: ProxyRule) => void;
}

export const ProxyRuleModal: React.FC<ProxyRuleModalProps> = ({
  isOpen,
  onClose,
  rule,
  onSave,
  onTest
}) => {
  const [formData, setFormData] = useState({
    subdomain: rule?.subdomain || '',
    domain: rule?.domain || 'localhost',
    target: rule?.target || 'http://localhost:3000',
    container: rule?.container || '',
    ssl: rule?.ssl ?? true,
    healthCheck: rule?.healthCheck ?? true,
    middleware: rule?.middleware || [],
    rateLimit: rule?.rateLimit || { enabled: false, requests: 100, window: '1m' },
    redirects: rule?.redirects || []
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newRedirect, setNewRedirect] = useState({ from: '', to: '', permanent: false });
  const [newMiddleware, setNewMiddleware] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addRedirect = () => {
    if (newRedirect.from && newRedirect.to) {
      setFormData(prev => ({
        ...prev,
        redirects: [...prev.redirects, newRedirect]
      }));
      setNewRedirect({ from: '', to: '', permanent: false });
    }
  };

  const removeRedirect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      redirects: prev.redirects.filter((_, i) => i !== index)
    }));
  };

  const addMiddleware = () => {
    if (newMiddleware && !formData.middleware.includes(newMiddleware)) {
      setFormData(prev => ({
        ...prev,
        middleware: [...prev.middleware, newMiddleware]
      }));
      setNewMiddleware('');
    }
  };

  const removeMiddleware = (middleware: string) => {
    setFormData(prev => ({
      ...prev,
      middleware: prev.middleware.filter(m => m !== middleware)
    }));
  };

  const previewUrl = `${formData.ssl ? 'https' : 'http'}://${formData.subdomain}.${formData.domain}`;

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
            className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  {rule ? 'Modifier la règle proxy' : 'Nouvelle règle proxy'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* URL Preview */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium mb-1">URL générée</h4>
                      <div className="flex items-center space-x-2">
                        <code className="text-blue-400 bg-gray-800 px-2 py-1 rounded">
                          {previewUrl}
                        </code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(previewUrl)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    {formData.ssl && (
                      <Shield className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </div>

                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sous-domaine *
                    </label>
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="app"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Domaine principal
                    </label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      URL cible *
                    </label>
                    <input
                      type="url"
                      value={formData.target}
                      onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="http://localhost:3000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Conteneur (optionnel)
                    </label>
                    <input
                      type="text"
                      value={formData.container}
                      onChange={(e) => setFormData(prev => ({ ...prev, container: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="nginx-proxy"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">SSL/HTTPS</h4>
                      <p className="text-sm text-gray-400">Activer le certificat SSL automatique</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, ssl: !prev.ssl }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        formData.ssl ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.ssl ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Health Check</h4>
                      <p className="text-sm text-gray-400">Vérifier la santé du service cible</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, healthCheck: !prev.healthCheck }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        formData.healthCheck ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.healthCheck ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>Options avancées</span>
                  </button>
                </div>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {/* Rate Limiting */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Limitation de débit</h4>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            rateLimit: { ...prev.rateLimit, enabled: !prev.rateLimit.enabled }
                          }))}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            formData.rateLimit.enabled ? 'bg-blue-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              formData.rateLimit.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {formData.rateLimit.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Requêtes max</label>
                            <input
                              type="number"
                              value={formData.rateLimit.requests}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                rateLimit: { ...prev.rateLimit, requests: parseInt(e.target.value) }
                              }))}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Fenêtre</label>
                            <select
                              value={formData.rateLimit.window}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                rateLimit: { ...prev.rateLimit, window: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                            >
                              <option value="1m">1 minute</option>
                              <option value="5m">5 minutes</option>
                              <option value="1h">1 heure</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Middleware */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Middleware</h4>
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newMiddleware}
                          onChange={(e) => setNewMiddleware(e.target.value)}
                          placeholder="cors, gzip, auth..."
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={addMiddleware}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.middleware.map((middleware) => (
                          <span
                            key={middleware}
                            className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-sm flex items-center space-x-1"
                          >
                            <span>{middleware}</span>
                            <button
                              type="button"
                              onClick={() => removeMiddleware(middleware)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Redirects */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Redirections</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <input
                          type="text"
                          value={newRedirect.from}
                          onChange={(e) => setNewRedirect(prev => ({ ...prev, from: e.target.value }))}
                          placeholder="De (ex: /old)"
                          className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                        <input
                          type="text"
                          value={newRedirect.to}
                          onChange={(e) => setNewRedirect(prev => ({ ...prev, to: e.target.value }))}
                          placeholder="Vers (ex: /new)"
                          className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                        <label className="flex items-center space-x-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={newRedirect.permanent}
                            onChange={(e) => setNewRedirect(prev => ({ ...prev, permanent: e.target.checked }))}
                          />
                          <span>Permanent (301)</span>
                        </label>
                        <button
                          type="button"
                          onClick={addRedirect}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                        >
                          Ajouter
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.redirects.map((redirect, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                            <span className="text-sm text-gray-300">
                              {redirect.from} → {redirect.to} {redirect.permanent && '(301)'}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeRedirect(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-6 border-t border-gray-700">
                  <div>
                    {rule && onTest && (
                      <button
                        type="button"
                        onClick={() => onTest(rule)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Activity className="h-4 w-4" />
                        <span>Tester</span>
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      {rule ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};