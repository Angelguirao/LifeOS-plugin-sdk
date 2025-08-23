/**
 * LifeOS Plugin SDK - Core Interfaces
 * 
 * These interfaces define the contract that all LifeOS plugins must implement.
 * They are platform-agnostic and work in both LifeOS Core and LifeOS Premium.
 */

import { LifeOSEvent } from '@angelguirao/lifeos-protocol'

/**
 * Core plugin interface that all LifeOS plugins must implement
 * This interface is stable and will not change between major versions
 */
export interface LifeOSPlugin {
  // Plugin identification (stable)
  id: string
  name: string
  version: string
  description: string
  author: string
  
  // Version compatibility (new)
  requiredLifeOSVersion: string // Semver range like ">=1.0.0"
  requiredCapabilities: string[] // What LifeOS capabilities this plugin needs
  
  // Plugin capabilities (enhanced)
  capabilities: PluginCapability[]
  
  // Plugin lifecycle (stable)
  initialize(): Promise<void>
  destroy(): Promise<void>
  
  // Event handling (optional - plugins can choose which to implement)
  onEventCreated?(event: LifeOSEvent): Promise<void>
  onEventUpdated?(event: LifeOSEvent): Promise<void>
  onEventDeleted?(eventId: string): Promise<void>
  
  // Data synchronization (stable)
  sync(): Promise<SyncResult>
  getStatus(): Promise<PluginStatus>
  
  // Plugin settings management (stable)
  getSettings(): Promise<PluginSettings>
  updateSettings(settings: Partial<PluginSettings>): Promise<void>
}

/**
 * Enhanced plugin capability system
 */
export interface PluginCapability {
  type: PluginCapabilityType
  description: string
  configurable: boolean
  metadata?: Record<string, any>
  // New: Version requirements for capabilities
  minLifeOSVersion?: string
  dependencies?: string[] // Other capabilities this depends on
}

/**
 * All available capability types
 */
export type PluginCapabilityType = 
  // Core capabilities
  | 'import' | 'export' | 'sync' | 'oauth' | 'webhook' | 'api' | 'custom'
  // Music-specific capabilities
  | 'music-tracking' | 'mood-analysis' | 'playlist-creation' | 'real-time-sync'
  | 'offline-caching' | 'audio-analysis' | 'recommendations'
  // LifeOS-specific capabilities
  | 'life-timeline' | 'event-correlation' | 'mood-tracking' | 'focus-tracking'
  | 'social-integration' | 'data-visualization'

/**
 * Plugin configuration and preferences (enhanced)
 */
export interface PluginSettings {
  enabled: boolean
  autoSync: boolean
  syncInterval?: number // minutes
  credentials?: Record<string, any>
  customSettings?: Record<string, any>
  platform?: 'core' | 'premium' | 'both'
  // New: Capability-specific settings
  capabilitySettings?: Record<string, any>
  // New: Version compatibility info
  compatibilityInfo?: {
    lifeOSVersion: string
    lastCompatibilityCheck: Date
    warnings?: string[]
  }
}

/**
 * Enhanced sync result with capability-specific data
 */
export interface SyncResult {
  success: boolean
  eventsImported: number
  eventsExported: number
  errors?: string[]
  lastSync: Date
  metadata?: Record<string, any>
  // New: Capability-specific results
  capabilityResults?: Record<string, any>
  // New: Performance metrics
  performance?: {
    duration: number
    memoryUsage?: number
    apiCalls?: number
  }
}

/**
 * Enhanced plugin status with capability information
 */
export interface PluginStatus {
  pluginId: string
  name: string
  version: string
  status: 'active' | 'inactive' | 'error' | 'syncing' | 'initializing'
  lastSync?: Date
  errorCount: number
  lastError?: string
  capabilities: string[]
  // New: Capability status
  capabilityStatus?: Record<string, {
    enabled: boolean
    lastUsed?: Date
    errorCount: number
    lastError?: string
  }>
  // New: Health metrics
  health: {
    uptime: number
    memoryUsage?: number
    apiLatency?: number
  }
}

/**
 * Plugin compatibility information
 */
export interface PluginCompatibility {
  pluginId: string
  compatible: boolean
  lifeOSVersion: string
  requiredVersion: string
  missingCapabilities: string[]
  warnings: string[]
  recommendations: string[]
}

/**
 * Plugin registry for managing multiple plugins (enhanced)
 */
export interface PluginRegistry {
  plugins: Map<string, LifeOSPlugin>
  register(plugin: LifeOSPlugin): void
  unregister(pluginId: string): void
  getPlugin(pluginId: string): LifeOSPlugin | undefined
  getAllPlugins(): LifeOSPlugin[]
  getPluginsByCapability(capability: string): LifeOSPlugin[]
  // New: Version compatibility methods
  checkCompatibility(plugin: LifeOSPlugin): PluginCompatibility
  getCompatiblePlugins(lifeOSVersion: string): LifeOSPlugin[]
  // New: Capability management
  getCapabilityProviders(capability: string): LifeOSPlugin[]
  validateCapabilityDependencies(plugin: LifeOSPlugin): boolean
}

/**
 * Plugin manager for lifecycle and operations (enhanced)
 */
export interface PluginManager {
  registry: PluginRegistry
  
  // Plugin lifecycle (stable)
  loadPlugin(pluginId: string): Promise<void>
  unloadPlugin(pluginId: string): Promise<void>
  reloadPlugin(pluginId: string): Promise<void>
  
  // Plugin operations (stable)
  enablePlugin(pluginId: string): Promise<void>
  disablePlugin(pluginId: string): Promise<void>
  
  // Event routing (stable)
  routeEvent(event: LifeOSEvent): Promise<void>
  
  // System operations (stable)
  getSystemStatus(): Promise<SystemStatus>
  performSystemSync(): Promise<SyncResult[]>
  
  // New: Capability management
  enableCapability(pluginId: string, capability: string): Promise<void>
  disableCapability(pluginId: string, capability: string): Promise<void>
  getCapabilityStatus(capability: string): Promise<CapabilityStatus>
  
  // New: Version management
  checkPluginCompatibility(pluginId: string): Promise<PluginCompatibility>
  updatePluginCapabilities(pluginId: string): Promise<void>
}

/**
 * Overall system health and status (enhanced)
 */
export interface SystemStatus {
  totalPlugins: number
  activePlugins: number
  lastSync: Date
  systemHealth: 'healthy' | 'warning' | 'error'
  pluginStatuses: PluginStatus[]
  platform: 'core' | 'premium'
  // New: Capability overview
  capabilityOverview: Record<string, {
    totalProviders: number
    activeProviders: number
    lastUsed: Date
  }>
  // New: System metrics
  metrics: {
    totalEvents: number
    syncFrequency: number
    averageLatency: number
    errorRate: number
  }
}

/**
 * Capability status across all plugins
 */
export interface CapabilityStatus {
  capability: string
  totalProviders: number
  activeProviders: number
  lastUsed: Date
  providers: Array<{
    pluginId: string
    pluginName: string
    status: 'active' | 'inactive' | 'error'
    lastUsed: Date
  }>
} 