/**
 * LifeOS Plugin SDK - Main Entry Point
 * 
 * Provides a comprehensive plugin system for LifeOS with:
 * - Stable plugin contracts
 * - Version compatibility checking
 * - Capability-based architecture
 * - Enhanced plugin management
 */

// Core interfaces and types
export * from './interfaces'

// Core plugin management
export { PluginManager } from './core/plugin-manager'
export { PluginRegistry } from './core/plugin-registry'

// Utilities
export { VersionChecker } from './utils/version-checker'

// Built-in plugins
export { SpotifyLifeOSPlugin } from './plugins/spotify-lifeos-plugin'

// Plugin base classes and helpers
export { BasePlugin } from './plugins/base-plugin'

// OAuth services
export { OAuthService } from './oauth/oauth-service'

// Marketplace services
export { MarketplaceService } from './marketplace/marketplace-service'

// Event routing utilities
export { EventRouter } from './utils/event-routing'

// Plugin helper utilities
export * from './utils/plugin-helpers'

// Version information
export const SDK_VERSION = '2.0.0'
export const MIN_LIFEOS_VERSION = '1.0.0'

// Capability definitions
export const AVAILABLE_CAPABILITIES = [
  // Core capabilities
  'import', 'export', 'sync', 'oauth', 'webhook', 'api', 'custom',
  
  // Music-specific capabilities
  'music-tracking', 'mood-analysis', 'playlist-creation', 'real-time-sync',
  'offline-caching', 'audio-analysis', 'recommendations',
  
  // LifeOS-specific capabilities
  'life-timeline', 'event-correlation', 'mood-tracking', 'focus-tracking',
  'social-integration', 'data-visualization'
] as const

// Plugin system configuration
export const PLUGIN_SYSTEM_CONFIG = {
  autoSyncInterval: 5 * 60 * 1000, // 5 minutes
  maxConcurrentSyncs: 3,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  maxPluginMemoryUsage: 50 * 1024 * 1024, // 50MB
  capabilityValidation: true,
  versionCompatibility: true,
  performanceMonitoring: true
}

// Default plugin settings
export const DEFAULT_PLUGIN_SETTINGS = {
  enabled: true,
  autoSync: true,
  syncInterval: 5, // minutes
  credentials: {},
  customSettings: {},
  platform: 'premium' as const
}

// Plugin lifecycle events
export const PLUGIN_EVENTS = {
  REGISTERED: 'plugin:registered',
  UNREGISTERED: 'plugin:unregistered',
  ENABLED: 'plugin:enabled',
  DISABLED: 'plugin:disabled',
  SYNC_STARTED: 'plugin:sync:started',
  SYNC_COMPLETED: 'plugin:sync:completed',
  SYNC_FAILED: 'plugin:sync:failed',
  ERROR: 'plugin:error'
} as const

// Error codes
export const PLUGIN_ERROR_CODES = {
  COMPATIBILITY_ERROR: 'COMPATIBILITY_ERROR',
  CAPABILITY_MISSING: 'CAPABILITY_MISSING',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// Plugin validation schemas
export const PLUGIN_VALIDATION_SCHEMAS = {
  requiredFields: ['id', 'name', 'version', 'description', 'author', 'capabilities'],
  versionFormat: /^\d+\.\d+\.\d+$/,
  idFormat: /^[a-z0-9-]+$/,
  maxNameLength: 100,
  maxDescriptionLength: 500
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  maxSyncDuration: 30000, // 30 seconds
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  maxApiLatency: 5000, // 5 seconds
  maxErrorRate: 0.1 // 10%
}

// Export types for convenience
export type PluginCapabilityType = import('./interfaces').PluginCapabilityType
export type LifeOSPlugin = import('./interfaces').LifeOSPlugin
export type PluginSettings = import('./interfaces').PluginSettings
export type SyncResult = import('./interfaces').SyncResult
export type PluginStatus = import('./interfaces').PluginStatus
export type PluginCompatibility = import('./interfaces').PluginCompatibility
export type CapabilityStatus = import('./interfaces').CapabilityStatus 