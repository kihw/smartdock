import { Container, Stack, SystemStats } from '../types';

export class DockerAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = '/api', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data;
  }

  // Container methods
  async getContainers(): Promise<Container[]> {
    return this.request<Container[]>('/containers');
  }

  async getContainer(id: string): Promise<Container> {
    return this.request<Container>(`/containers/${id}`);
  }

  async startContainer(id: string): Promise<void> {
    return this.request<void>(`/containers/${id}/start`, { method: 'POST' });
  }

  async stopContainer(id: string): Promise<void> {
    return this.request<void>(`/containers/${id}/stop`, { method: 'POST' });
  }

  async restartContainer(id: string): Promise<void> {
    return this.request<void>(`/containers/${id}/restart`, { method: 'POST' });
  }

  async removeContainer(id: string, force: boolean = false): Promise<void> {
    return this.request<void>(`/containers/${id}?force=${force}`, { method: 'DELETE' });
  }

  async getContainerLogs(id: string, tail: number = 100): Promise<string[]> {
    return this.request<string[]>(`/containers/${id}/logs?tail=${tail}`);
  }

  async getContainerStats(id: string): Promise<any> {
    return this.request<any>(`/containers/${id}/stats`);
  }

  // Stack methods
  async getStacks(): Promise<Stack[]> {
    return this.request<Stack[]>('/stacks');
  }

  async getStack(id: string): Promise<Stack> {
    return this.request<Stack>(`/stacks/${id}`);
  }

  async deployStack(composeFile: string, name: string): Promise<Stack> {
    return this.request<Stack>('/stacks', {
      method: 'POST',
      body: JSON.stringify({ composeFile, name }),
    });
  }

  async startStack(id: string): Promise<void> {
    return this.request<void>(`/stacks/${id}/start`, { method: 'POST' });
  }

  async stopStack(id: string): Promise<void> {
    return this.request<void>(`/stacks/${id}/stop`, { method: 'POST' });
  }

  async removeStack(id: string): Promise<void> {
    return this.request<void>(`/stacks/${id}`, { method: 'DELETE' });
  }

  async updateStack(id: string): Promise<void> {
    return this.request<void>(`/stacks/${id}/update`, { method: 'POST' });
  }

  // System methods
  async getSystemStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/system/stats');
  }

  async getSystemInfo(): Promise<any> {
    return this.request<any>('/system/info');
  }

  async pruneSystem(): Promise<any> {
    return this.request<any>('/system/prune', { method: 'POST' });
  }

  // Image methods
  async getImages(): Promise<any[]> {
    return this.request<any[]>('/images');
  }

  async pullImage(name: string): Promise<void> {
    return this.request<void>('/images/pull', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async removeImage(id: string): Promise<void> {
    return this.request<void>(`/images/${id}`, { method: 'DELETE' });
  }

  // Network methods
  async getNetworks(): Promise<any[]> {
    return this.request<any[]>('/networks');
  }

  async createNetwork(name: string, driver: string = 'bridge'): Promise<any> {
    return this.request<any>('/networks', {
      method: 'POST',
      body: JSON.stringify({ name, driver }),
    });
  }

  async removeNetwork(id: string): Promise<void> {
    return this.request<void>(`/networks/${id}`, { method: 'DELETE' });
  }

  // Volume methods
  async getVolumes(): Promise<any[]> {
    return this.request<any[]>('/volumes');
  }

  async createVolume(name: string): Promise<any> {
    return this.request<any>('/volumes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async removeVolume(name: string): Promise<void> {
    return this.request<void>(`/volumes/${name}`, { method: 'DELETE' });
  }
}

export const dockerAPI = new DockerAPI();

// Utility functions
export function formatUptime(seconds: number): string {
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

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getContainerStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
      return 'text-green-400';
    case 'stopped':
    case 'exited':
      return 'text-red-400';
    case 'restarting':
      return 'text-yellow-400';
    case 'paused':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
}

export function parseDockerImage(image: string): { name: string; tag: string } {
  const parts = image.split(':');
  return {
    name: parts[0],
    tag: parts[1] || 'latest',
  };
}

export function generateContainerUrl(container: Container, domain: string): string | null {
  const httpPort = container.ports.find(p => p.privatePort === 80 || p.privatePort === 8080 || p.privatePort === 3000);
  
  if (httpPort && httpPort.publicPort) {
    return `http://${container.name}.${domain}`;
  }
  
  return null;
}