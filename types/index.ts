/**
 * LifeOS Plugin SDK - Type Definitions
 * 
 * Common types and interfaces used throughout the plugin system.
 */

import { LifeOSPlugin, PluginCapability, PluginStatus } from '../interfaces';

/**
 * Plugin configuration options
 */
export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  capabilities: PluginCapability[];
  settings?: Record<string, any>;
  autoStart?: boolean;
  dependencies?: string[];
}

/**
 * Plugin health information
 */
export interface PluginHealth {
  isHealthy: boolean;
  lastCheck: Date;
  errors?: string[];
  warnings?: string[];
  metrics?: Record<string, number>;
}

/**
 * Plugin event data
 */
export interface PluginEvent {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Plugin lifecycle events
 */
export type PluginLifecycleEvent = 
  | 'installing'
  | 'installed'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped'
  | 'error'
  | 'uninstalling'
  | 'uninstalled';

/**
 * Plugin manager configuration
 */
export interface PluginManagerConfig {
  autoLoadPlugins?: boolean;
  pluginDirectory?: string;
  maxConcurrentPlugins?: number;
  enableHotReload?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
  plugin: LifeOSPlugin;
  config: PluginConfig;
  health: PluginHealth;
  lastUpdated: Date;
  usage: {
    totalEvents: number;
    lastEvent: Date;
    averageResponseTime: number;
  };
}
