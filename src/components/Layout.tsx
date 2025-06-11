import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Container, Layers, Globe, Clock, RefreshCw, Settings, Menu, X, Pocket as Docker } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Conteneurs', href: '/containers', icon: Container },
  { name: 'Stacks', href: '/stacks', icon: Layers },
  { name: 'Proxy', href: '/proxy', icon: Globe },
  { name: 'Horaires', href: '/schedules', icon: Clock },
  { name: 'Mises à jour', href: '/updates', icon: RefreshCw },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 lg:hidden"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Docker className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white">SmartDock</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-gray-800 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Docker className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">SmartDock</span>
            </div>
            <nav className="mt-8 flex-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white border-r-4 border-blue-400 shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Docker className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-white">SmartDock</span>
            </div>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};