/**
 * LifeOS Plugin SDK - Core Interfaces
 * 
 * These interfaces define the contract that all LifeOS plugins must implement.
 * They are platform-agnostic and work in both LifeOS Core and LifeOS Premium.
 */

import { LifeOSEvent } from '@angelguirao/lifeos-protocol'

/**
 * Core plugin interface that all LifeOS plugins must implement
 */
export interface LifeOSPlugin {
  // Plugin identification
  id: string
  name: string
  version: string
  description: string
  author: string
  
  // Plugin capabilities
  capabilities: PluginCapability[]
  
  // Plugin lifecycle
  initialize(): Promise<void>
  destroy(): Promise<void>
  
  // Event handling (optional - plugins can choose which to implement)
  onEventCreated?(event: LifeOSEvent): Promise<void>
  onEventUpdated?(event: LifeOSEvent): Promise<void>
  onEventDeleted?(eventId: string): Promise<void>
  
  // Data synchronization (optional)
  sync?(): Promise<SyncResult>
  
  // Plugin settings management
  getSettings(): Promise<PluginSettings>
  updateSettings(settings: Partial<PluginSettings>): Promise<void>
}

/**
 * Defines what a plugin can do
 */
export interface PluginCapability {
  type: 'import' | 'export' | 'sync' | 'oauth' | 'webhook' | 'api' | 'custom'
  description: string
  configurable: boolean
  metadata?: Record<string, any>
}

/**
 * Plugin configuration and preferences
 */
export interface PluginSettings {
  enabled: boolean
  autoSync: boolean
  syncInterval?: number // minutes
  credentials?: Record<string, any>
  customSettings?: Record<string, any>
  platform?: 'core' | 'premium' | 'both'
}

/**
 * Result of a synchronization operation
 */
export interface SyncResult {
  success: boolean
  eventsImported: number
  eventsExported: number
  errors?: string[]
  lastSync: Date
  metadata?: Record<string, any>
}

/**
 * Plugin registry for managing multiple plugins
 */
export interface PluginRegistry {
  plugins: Map<string, LifeOSPlugin>
  register(plugin: LifeOSPlugin): void
  unregister(pluginId: string): void
  getPlugin(pluginId: string): LifeOSPlugin | undefined
  getAllPlugins(): LifeOSPlugin[]
  getPluginsByCapability(capability: string): LifeOSPlugin[]
}

/**
 * Plugin manager for lifecycle and operations
 */
export interface PluginManager {
  registry: PluginRegistry
  
  // Plugin lifecycle
  loadPlugin(pluginId: string): Promise<void>
  unloadPlugin(pluginId: string): Promise<void>
  reloadPlugin(pluginId: string): Promise<void>
  
  // Plugin operations
  enablePlugin(pluginId: string): Promise<void>
  disablePlugin(pluginId: string): Promise<void>
  
  // Event routing
  routeEvent(event: LifeOSEvent): Promise<void>
  
  // System operations
  getSystemStatus(): Promise<SystemStatus>
  performSystemSync(): Promise<SyncResult[]>
}

/**
 * Overall system health and status
 */
export interface SystemStatus {
  totalPlugins: number
  activePlugins: number
  lastSync: Date
  systemHealth: 'healthy' | 'warning' | 'error'
  pluginStatuses: PluginStatus[]
  platform: 'core' | 'premium'
}

/**
 * Individual plugin status
 */
export interface PluginStatus {
  pluginId: string
  name: string
  status: 'active' | 'inactive' | 'error' | 'syncing'
  lastSync?: Date
  errorCount: number
  lastError?: string
  capabilities: string[]
} 