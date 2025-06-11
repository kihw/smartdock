import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Containers } from './pages/Containers';
import { Stacks } from './pages/Stacks';
import { Proxy } from './pages/Proxy';
import { Schedules } from './pages/Schedules';
import { Updates } from './pages/Updates';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/stacks" element={<Stacks />} />
          <Route path="/proxy" element={<Proxy />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;