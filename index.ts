/**
 * LifeOS Plugin SDK
 * 
 * A unified, open-source plugin system for the LifeOS ecosystem.
 * 
 * This SDK provides:
 * - Standardized plugin interfaces
 * - Plugin lifecycle management
 * - Event routing and handling
 * - Cross-platform compatibility
 * 
 * Usage:
 * - LifeOS Core (local): import from '@lifeos/plugin-sdk'
 * - LifeOS Premium (cloud): import from '@lifeos/plugin-sdk'
 * - Third-party plugins: implement LifeOSPlugin interface
 */

// Core interfaces (types only)
export type { 
  LifeOSPlugin, 
  PluginCapability, 
  PluginSettings, 
  SyncResult, 
  SystemStatus, 
  PluginStatus 
} from './interfaces'

// Plugin management (implementations)
export { PluginManager } from './core/plugin-manager'
export { PluginRegistry } from './core/plugin-registry'

// Built-in plugins
export * from './plugins/obsidian-plugin'
export * from './plugins/base-plugin'

// Plugin marketplace
export * from './marketplace'
export { MarketplaceService } from './marketplace/marketplace-service'

// Utilities
export * from './utils/plugin-helpers'
export * from './utils/event-routing'

// Types
export * from './types'

// Version info
export const PLUGIN_SDK_VERSION = '1.0.0'
export const PLUGIN_SDK_NAME = 'LifeOS Plugin SDK' 