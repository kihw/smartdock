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

// Docker client with error handling
let docker;
try {
  docker = new Docker({
    socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock'
  });
} catch (error) {
  console.error('Failed to initialize Docker client:', error);
  docker = null;
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

// API Routes
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SmartDock API is running',
    timestamp: new Date().toISOString()
  });
});

// Containers endpoints
apiRouter.get('/containers', async (req, res) => {
  try {
    if (!docker) {
      return res.status(503).json({ 
        success: false, 
        error: 'Docker client not available' 
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
    if (!docker) {
      return res.status(503).json({ 
        success: false, 
        error: 'Docker client not available' 
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
    if (!docker) {
      return res.status(503).json({ 
        success: false, 
        error: 'Docker client not available' 
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
    if (!docker) {
      return res.status(503).json({ 
        success: false, 
        error: 'Docker client not available' 
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
    if (!docker) {
      return res.status(503).json({ 
        success: false, 
        error: 'Docker client not available' 
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
    if (!docker) {
      return res.json({
        success: true,
        data: {
          containers: {
            total: 0,
            running: 0,
            stopped: 0,
            paused: 0
          },
          stacks: {
            total: 0,
            running: 0,
            stopped: 0,
            partial: 0
          },
          system: {
            cpu: 0,
            memory: {
              used: 0,
              total: 0,
              percentage: 0
            },
            disk: {
              used: 0,
              total: 0,
              percentage: 0
            },
            uptime: formatUptime(process.uptime())
          },
          docker: {
            version: 'N/A',
            apiVersion: 'N/A',
            status: 'disconnected'
          }
        }
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
    if (!docker) {
      return res.status(503).json({ 
        success: false, 
        error: 'Docker client not available' 
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
        if (docker) {
          const containers = await docker.listContainers({ all: true });
          socket.emit('containers:update', containers);
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
  if (!docker) return;
  
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
  if (!docker) return false;
  
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SmartDock server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  
  // Test Docker connection
  if (docker) {
    docker.ping()
      .then(() => console.log('✅ Docker connection successful'))
      .catch(err => console.error('❌ Docker connection failed:', err.message));
  } else {
    console.warn('⚠️  Docker client not initialized');
  }
});