import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import cron from 'node-cron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: false
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Docker client with improved error handling
let docker = null;
let dockerAvailable = false;

async function initializeDocker() {
  const dockerOptions = [];
  
  // Try different Docker connection options based on platform
  if (process.platform === 'win32') {
    dockerOptions.push(
      { socketPath: '\\\\.\\pipe\\docker_engine' },
      { host: 'localhost', port: 2375 },
      { host: 'localhost', port: 2376, protocol: 'https' }
    );
  } else {
    // Add Unix socket options
    dockerOptions.push({ socketPath: '/var/run/docker.sock' });
    dockerOptions.push({ host: 'localhost', port: 2375 });
    
    // Add custom DOCKER_HOST socket if provided and valid
    if (process.env.DOCKER_HOST && process.env.DOCKER_HOST.startsWith('unix://')) {
      const socketPath = process.env.DOCKER_HOST.replace('unix://', '');
      if (socketPath) {
        dockerOptions.push({ socketPath });
      }
    }
  }

  // Add custom DOCKER_HOST if provided
  if (process.env.DOCKER_HOST) {
    if (process.env.DOCKER_HOST.startsWith('npipe://')) {
      dockerOptions.unshift({ socketPath: process.env.DOCKER_HOST.replace('npipe://', '') });
    } else if (process.env.DOCKER_HOST.startsWith('tcp://')) {
      const url = new URL(process.env.DOCKER_HOST);
      dockerOptions.unshift({ 
        host: url.hostname, 
        port: parseInt(url.port) || 2376,
        protocol: url.protocol.replace(':', '')
      });
    }
  }

  for (const option of dockerOptions) {
    try {
      console.log(`🔍 Trying Docker connection:`, option);
      const testDocker = new Docker(option);
      
      // Test the connection with a timeout
      const pingPromise = testDocker.ping();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      await Promise.race([pingPromise, timeoutPromise]);
      
      docker = testDocker;
      dockerAvailable = true;
      console.log('✅ Docker connection successful with options:', option);
      return true;
    } catch (error) {
      console.log(`❌ Docker connection failed with options ${JSON.stringify(option)}:`, error.message);
      continue;
    }
  }
  
  console.warn('⚠️  Could not establish Docker connection. Running in mock mode.');
  console.warn('💡 To fix this:');
  console.warn('   - Ensure Docker Desktop is running');
  console.warn('   - On Windows: Set DOCKER_HOST=npipe:////./pipe/docker_engine');
  console.warn('   - On macOS/Linux: Ensure /var/run/docker.sock is accessible');
  console.warn('   - Or set DOCKER_HOST environment variable to your Docker daemon');
  
  dockerAvailable = false;
  return false;
}

// In-memory storage (replace with database in production)
const storage = {
  schedules: new Map(),
  proxyRules: new Map(),
  settings: {
    docker: {
      host: process.env.DOCKER_HOST || '/var/run/docker.sock',
      apiVersion: '1.41'
    },
    proxy: {
      enabled: true,
      provider: 'caddy',
      configPath: '/etc/caddy/Caddyfile',
      mainDomain: process.env.MAIN_DOMAIN || 'localhost',
      autoSSL: true
    },
    smartWakeUp: {
      enabled: true,
      timeout: 30000,
      retries: 3
    }
  }
};

// Mock data for when Docker is not available
const mockContainers = [
  {
    id: 'mock-container-1',
    name: 'nginx-proxy',
    image: 'nginx:latest',
    status: 'running',
    state: 'Up 2 hours',
    uptime: '2h 15m',
    ports: [{ privatePort: 80, publicPort: 8080, type: 'tcp', ip: '0.0.0.0' }],
    cpu: 15.2,
    memory: '64 MB',
    memoryUsage: 25.6,
    smartWakeUp: true,
    autoUpdate: false,
    created: new Date(Date.now() - 86400000).toISOString(),
    labels: { 'smartdock.wakeup': 'true' },
    networks: ['bridge'],
    mounts: []
  },
  {
    id: 'mock-container-2',
    name: 'redis-cache',
    image: 'redis:alpine',
    status: 'exited',
    state: 'Exited (0) 1 hour ago',
    uptime: '-',
    ports: [],
    cpu: 0,
    memory: '32 MB',
    memoryUsage: 0,
    smartWakeUp: false,
    autoUpdate: true,
    created: new Date(Date.now() - 172800000).toISOString(),
    labels: { 'smartdock.autoupdate': 'true' },
    networks: ['bridge'],
    mounts: []
  }
];

const mockStacks = [
  {
    id: 'web-stack',
    name: 'web-stack',
    description: 'Web application stack with nginx and php',
    status: 'running',
    services: [
      { id: 'web-nginx', name: 'nginx', image: 'nginx:latest', status: 'running', replicas: 1, ports: [] },
      { id: 'web-php', name: 'php', image: 'php:fpm', status: 'running', replicas: 1, ports: [] }
    ],
    runningServices: 2,
    totalServices: 2,
    uptime: '1d 5h',
    autoUpdate: false,
    lastDeploy: new Date(Date.now() - 86400000).toISOString(),
    composeFile: '',
    environment: {}
  }
];

// API Routes
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SmartDock API is running',
    dockerAvailable,
    timestamp: new Date().toISOString()
  });
});

// Containers endpoints
apiRouter.get('/containers', async (req, res) => {
  try {
    if (!dockerAvailable) {
      return res.json({ 
        success: true, 
        data: mockContainers,
        mock: true,
        message: 'Docker not available - showing mock data'
      });
    }

    const containers = await docker.listContainers({ all: true });
    const enrichedContainers = await Promise.all(
      containers.map(async (container) => {
        try {
          const inspect = await docker.getContainer(container.Id).inspect();
          const startedAt = inspect.State.StartedAt ? new Date(inspect.State.StartedAt) : null;
          const uptime = startedAt ? Math.floor((Date.now() - startedAt.getTime()) / 1000) : 0;
          
          return {
            id: container.Id,
            name: container.Names[0].replace('/', ''),
            image: container.Image,
            status: container.State,
            state: container.Status,
            uptime: formatUptime(uptime),
            ports: container.Ports.map(port => ({
              privatePort: port.PrivatePort,
              publicPort: port.PublicPort,
              type: port.Type,
              ip: port.IP
            })),
            cpu: Math.random() * 100, // Mock data - implement real CPU monitoring
            memory: formatBytes(inspect.HostConfig.Memory || 0),
            memoryUsage: Math.random() * 100,
            smartWakeUp: inspect.Config.Labels?.['smartdock.wakeup'] === 'true',
            autoUpdate: inspect.Config.Labels?.['smartdock.autoupdate'] === 'true',
            created: inspect.Created,
            labels: inspect.Config.Labels || {},
            networks: Object.keys(inspect.NetworkSettings.Networks || {}),
            mounts: inspect.Mounts || []
          };
        } catch (error) {
          console.error(`Error inspecting container ${container.Id}:`, error);
          return {
            id: container.Id,
            name: container.Names[0].replace('/', ''),
            image: container.Image,
            status: container.State,
            state: container.Status,
            uptime: '-',
            ports: container.Ports || [],
            cpu: 0,
            memory: '0 B',
            memoryUsage: 0,
            smartWakeUp: false,
            autoUpdate: false,
            created: '',
            labels: {},
            networks: [],
            mounts: []
          };
        }
      })
    );
    
    res.json({ success: true, data: enrichedContainers });
  } catch (error) {
    console.error('Error fetching containers:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch containers' 
    });
  }
});

apiRouter.post('/containers/:id/start', async (req, res) => {
  try {
    if (!dockerAvailable) {
      return res.json({ 
        success: true, 
        message: 'Container start simulated (Docker not available)',
        mock: true
      });
    }

    const container = docker.getContainer(req.params.id);
    await container.start();
    
    // Emit real-time update
    io.emit('container:started', { id: req.params.id });
    
    res.json({ success: true, message: 'Container started successfully' });
  } catch (error) {
    console.error('Error starting container:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to start container' 
    });
  }
});

apiRouter.post('/containers/:id/stop', async (req, res) => {
  try {
    if (!dockerAvailable) {
      return res.json({ 
        success: true, 
        message: 'Container stop simulated (Docker not available)',
        mock: true
      });
    }

    const container = docker.getContainer(req.params.id);
    await container.stop();
    
    // Emit real-time update
    io.emit('container:stopped', { id: req.params.id });
    
    res.json({ success: true, message: 'Container stopped successfully' });
  } catch (error) {
    console.error('Error stopping container:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to stop container' 
    });
  }
});

apiRouter.post('/containers/:id/restart', async (req, res) => {
  try {
    if (!dockerAvailable) {
      return res.json({ 
        success: true, 
        message: 'Container restart simulated (Docker not available)',
        mock: true
      });
    }

    const container = docker.getContainer(req.params.id);
    await container.restart();
    
    // Emit real-time update
    io.emit('container:restarted', { id: req.params.id });
    
    res.json({ success: true, message: 'Container restarted successfully' });
  } catch (error) {
    console.error('Error restarting container:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to restart container' 
    });
  }
});

// Stacks endpoints
apiRouter.get('/stacks', async (req, res) => {
  try {
    if (!dockerAvailable) {
      return res.json({ 
        success: true, 
        data: mockStacks,
        mock: true,
        message: 'Docker not available - showing mock data'
      });
    }

    // Get containers with compose labels
    const containers = await docker.listContainers({ all: true });
    const stacks = new Map();
    
    containers.forEach(container => {
      const projectName = container.Labels?.['com.docker.compose.project'];
      if (projectName) {
        if (!stacks.has(projectName)) {
          stacks.set(projectName, {
            id: projectName,
            name: projectName,
            description: `Docker Compose stack: ${projectName}`,
            status: 'stopped',
            services: [],
            runningServices: 0,
            totalServices: 0,
            uptime: '-',
            autoUpdate: false,
            lastDeploy: new Date().toISOString(),
            composeFile: '',
            environment: {}
          });
        }
        
        const stack = stacks.get(projectName);
        stack.services.push({
          id: container.Id,
          name: container.Labels['com.docker.compose.service'],
          image: container.Image,
          status: container.State,
          replicas: 1,
          ports: container.Ports
        });
        
        if (container.State === 'running') {
          stack.runningServices++;
        }
        stack.totalServices++;
        
        // Determine overall stack status
        if (stack.runningServices === stack.totalServices) {
          stack.status = 'running';
        } else if (stack.runningServices > 0) {
          stack.status = 'partial';
        } else {
          stack.status = 'stopped';
        }
      }
    });
    
    res.json({ success: true, data: Array.from(stacks.values()) });
  } catch (error) {
    console.error('Error fetching stacks:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch stacks' 
    });
  }
});

// Proxy rules endpoints
apiRouter.get('/proxy/rules', async (req, res) => {
  try {
    const rules = Array.from(storage.proxyRules.values());
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching proxy rules:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch proxy rules' 
    });
  }
});

apiRouter.post('/proxy/rules', async (req, res) => {
  try {
    const { subdomain, domain, target, container, ssl = true } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    
    const rule = {
      id,
      subdomain,
      domain,
      target,
      container,
      ssl,
      status: 'active',
      autoGenerated: false,
      lastCheck: new Date().toISOString(),
      healthCheck: true
    };
    
    storage.proxyRules.set(id, rule);
    
    res.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error creating proxy rule:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create proxy rule' 
    });
  }
});

// Schedules endpoints
apiRouter.get('/schedules', async (req, res) => {
  try {
    const schedules = Array.from(storage.schedules.values());
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch schedules' 
    });
  }
});

apiRouter.post('/schedules', async (req, res) => {
  try {
    const { name, description, target, targetType, action, schedule, enabled = true } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    
    const scheduleItem = {
      id,
      name,
      description,
      target,
      targetType,
      action,
      scheduleType: 'cron',
      schedule,
      enabled,
      lastRun: null,
      nextRun: getNextCronRun(schedule),
      status: enabled ? 'active' : 'inactive'
    };
    
    storage.schedules.set(id, scheduleItem);
    
    // Setup cron job
    if (enabled) {
      setupCronJob(scheduleItem);
    }
    
    res.json({ success: true, data: scheduleItem });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create schedule' 
    });
  }
});

// System endpoints
apiRouter.get('/system/stats', async (req, res) => {
  try {
    if (!dockerAvailable) {
      return res.json({
        success: true,
        data: {
          containers: {
            total: mockContainers.length,
            running: mockContainers.filter(c => c.status === 'running').length,
            stopped: mockContainers.filter(c => c.status === 'exited').length,
            paused: 0
          },
          stacks: {
            total: mockStacks.length,
            running: mockStacks.filter(s => s.status === 'running').length,
            stopped: mockStacks.filter(s => s.status === 'stopped').length,
            partial: mockStacks.filter(s => s.status === 'partial').length
          },
          system: {
            cpu: Math.random() * 100,
            memory: {
              used: 4 * 1024 * 1024 * 1024, // 4GB
              total: 8 * 1024 * 1024 * 1024, // 8GB
              percentage: 50
            },
            disk: {
              used: 50 * 1024 * 1024 * 1024, // Mock 50GB
              total: 100 * 1024 * 1024 * 1024, // Mock 100GB
              percentage: 50
            },
            uptime: formatUptime(process.uptime())
          },
          docker: {
            version: 'N/A (Mock Mode)',
            apiVersion: 'N/A',
            status: 'disconnected'
          }
        },
        mock: true,
        message: 'Docker not available - showing mock data'
      });
    }

    const containers = await docker.listContainers({ all: true });
    let info;
    try {
      info = await docker.info();
    } catch (error) {
      console.warn('Could not fetch Docker info:', error.message);
      info = {
        ServerVersion: 'Unknown',
        ApiVersion: 'Unknown',
        MemTotal: 0,
        MemFree: 0
      };
    }
    
    const stats = {
      containers: {
        total: containers.length,
        running: containers.filter(c => c.State === 'running').length,
        stopped: containers.filter(c => c.State === 'exited').length,
        paused: containers.filter(c => c.State === 'paused').length
      },
      stacks: {
        total: 4, // Mock data
        running: 2,
        stopped: 1,
        partial: 1
      },
      system: {
        cpu: Math.random() * 100,
        memory: {
          used: info.MemTotal ? info.MemTotal - info.MemFree : 0,
          total: info.MemTotal || 0,
          percentage: info.MemTotal ? ((info.MemTotal - info.MemFree) / info.MemTotal) * 100 : 0
        },
        disk: {
          used: 50 * 1024 * 1024 * 1024, // Mock 50GB
          total: 100 * 1024 * 1024 * 1024, // Mock 100GB
          percentage: 50
        },
        uptime: formatUptime(process.uptime())
      },
      docker: {
        version: info.ServerVersion || 'Unknown',
        apiVersion: info.ApiVersion || 'Unknown',
        status: 'connected'
      }
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch system stats' 
    });
  }
});

// Smart Wake-Up endpoint
apiRouter.post('/wakeup/:domain', async (req, res) => {
  try {
    if (!dockerAvailable) {
      return res.json({ 
        success: true, 
        message: 'Smart wake-up simulated (Docker not available)',
        status: 'ready',
        mock: true
      });
    }

    const domain = req.params.domain;
    const containers = await docker.listContainers({ all: true });
    
    // Find container associated with this domain
    const targetContainer = containers.find(container => {
      const labels = container.Labels || {};
      return labels['smartdock.domain'] === domain || 
             container.Names[0].replace('/', '') === domain.split('.')[0];
    });
    
    if (!targetContainer) {
      return res.status(404).json({ 
        success: false, 
        error: 'No container found for this domain' 
      });
    }
    
    // Check if container is already running
    if (targetContainer.State === 'running') {
      return res.json({ 
        success: true, 
        message: 'Container is already running',
        status: 'ready'
      });
    }
    
    // Start the container
    const container = docker.getContainer(targetContainer.Id);
    await container.start();
    
    // Wait for container to be ready
    await waitForContainer(targetContainer.Id);
    
    res.json({ 
      success: true, 
      message: 'Container started successfully',
      status: 'ready'
    });
  } catch (error) {
    console.error('Error in smart wake-up:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Smart wake-up failed' 
    });
  }
});

app.use('/api', apiRouter);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Send real-time updates
  socket.on('subscribe:containers', () => {
    // Send periodic container updates
    const interval = setInterval(async () => {
      try {
        if (dockerAvailable && docker) {
          const containers = await docker.listContainers({ all: true });
          socket.emit('containers:update', containers);
        } else {
          // Send mock data updates
          socket.emit('containers:update', mockContainers);
        }
      } catch (error) {
        console.error('Error sending container updates:', error);
      }
    }, 5000);
    
    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });
});

// Utility functions
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getNextCronRun(cronExpression) {
  // Simple implementation - in production use a proper cron parser
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function setupCronJob(schedule) {
  if (cron.validate(schedule.schedule)) {
    cron.schedule(schedule.schedule, async () => {
      try {
        await executeScheduledAction(schedule);
      } catch (error) {
        console.error('Error executing scheduled action:', error);
      }
    });
  }
}

async function executeScheduledAction(schedule) {
  if (!dockerAvailable || !docker) return;
  
  const { target, targetType, action } = schedule;
  
  if (targetType === 'container') {
    const container = docker.getContainer(target);
    switch (action) {
      case 'start':
        await container.start();
        break;
      case 'stop':
        await container.stop();
        break;
      case 'restart':
        await container.restart();
        break;
    }
  }
  
  // Update last run time
  schedule.lastRun = new Date().toISOString();
  storage.schedules.set(schedule.id, schedule);
  
  // Emit update
  io.emit('schedule:executed', schedule);
}

async function waitForContainer(containerId, timeout = 30000) {
  if (!dockerAvailable || !docker) return false;
  
  const start = Date.now();
  const container = docker.getContainer(containerId);
  
  while (Date.now() - start < timeout) {
    try {
      const inspect = await container.inspect();
      if (inspect.State.Running) {
        return true;
      }
    } catch (error) {
      // Container might not be ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Container failed to become ready within timeout');
}

const PORT = process.env.PORT || 3000;

// Initialize Docker connection before starting server
initializeDocker().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartDock server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    
    if (dockerAvailable) {
      console.log('✅ Docker connection successful');
    } else {
      console.log('⚠️  Running in mock mode - Docker not available');
      console.log('💡 The application will work with simulated data');
    }
  });
});