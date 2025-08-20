/**
 * LifeOS Plugin SDK - Base Plugin
 * 
 * Abstract base class that provides common functionality for all LifeOS plugins.
 * Plugins can extend this class to get standard implementations of common methods.
 */

import { LifeOSPlugin, PluginCapability, PluginSettings, SyncResult } from '../interfaces'

export abstract class BaseLifeOSPlugin implements LifeOSPlugin {
  // Plugin identification - must be implemented by subclasses
  abstract id: string
  abstract name: string
  abstract version: string
  abstract description: string
  abstract author: string
  abstract capabilities: PluginCapability[]

  // Default settings
  protected defaultSettings: PluginSettings = {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    credentials: {},
    customSettings: {},
    platform: 'both' // Works on both Core and Premium by default
  }

  // Current settings
  protected settings: PluginSettings = { ...this.defaultSettings }

  /**
   * Initialize the plugin
   */
  async initialize(): Promise<void> {
    try {
      await this.loadSettings()
      console.log(`Plugin initialized: ${this.name}`)
    } catch (error) {
      console.error(`Failed to initialize plugin ${this.name}:`, error)
      throw error
    }
  }

  /**
   * Clean up plugin resources
   */
  async destroy(): Promise<void> {
    try {
      await this.saveSettings()
      console.log(`Plugin destroyed: ${this.name}`)
    } catch (error) {
      console.error(`Failed to destroy plugin ${this.name}:`, error)
      throw error
    }
  }

  /**
   * Get plugin settings
   */
  async getSettings(): Promise<PluginSettings> {
    return { ...this.settings }
  }

  /**
   * Update plugin settings
   */
  async updateSettings(newSettings: Partial<PluginSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings }
    await this.saveSettings()
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(): boolean {
    return this.settings.enabled
  }

  /**
   * Check if plugin supports a specific capability
   */
  hasCapability(capability: string): boolean {
    return this.capabilities.some(cap => cap.type === capability)
  }

  /**
   * Check if plugin is compatible with a platform
   */
  isCompatibleWith(platform: 'core' | 'premium'): boolean {
    return !this.settings.platform || 
           this.settings.platform === platform || 
           this.settings.platform === 'both'
  }

  /**
   * Get plugin info for display
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      capabilities: this.capabilities,
      enabled: this.settings.enabled,
      platform: this.settings.platform
    }
  }

  /**
   * Validate plugin configuration
   */
  validateSettings(settings: Partial<PluginSettings>): string[] {
    const errors: string[] = []

    if (settings.syncInterval !== undefined && (settings.syncInterval < 1 || settings.syncInterval > 1440)) {
      errors.push('Sync interval must be between 1 and 1440 minutes')
    }

    if (settings.platform !== undefined && !['core', 'premium', 'both'].includes(settings.platform)) {
      errors.push('Platform must be core, premium, or both')
    }

    return errors
  }

  /**
   * Load settings from storage
   * Override this method to implement custom storage logic
   */
  protected async loadSettings(): Promise<void> {
    // Default implementation - override in subclasses
    // This could load from localStorage, database, file system, etc.
    try {
      const stored = localStorage.getItem(`lifeos-plugin-${this.id}`)
      if (stored) {
        this.settings = { ...this.defaultSettings, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn(`Failed to load settings for plugin ${this.id}:`, error)
      // Keep default settings
    }
  }

  /**
   * Save settings to storage
   * Override this method to implement custom storage logic
   */
  protected async saveSettings(): Promise<void> {
    // Default implementation - override in subclasses
    try {
      localStorage.setItem(`lifeos-plugin-${this.id}`, JSON.stringify(this.settings))
    } catch (error) {
      console.warn(`Failed to save settings for plugin ${this.id}:`, error)
    }
  }

  /**
   * Default event handlers - override in subclasses if needed
   */
  async onEventCreated?(event: any): Promise<void> {
    // Default: do nothing
  }

  async onEventUpdated?(event: any): Promise<void> {
    // Default: do nothing
  }

  async onEventDeleted?(eventId: string): Promise<void> {
    // Default: do nothing
  }

  /**
   * Default sync implementation - override in subclasses if needed
   */
  async sync?(): Promise<SyncResult> {
    return {
      success: true,
      eventsImported: 0,
      eventsExported: 0,
      lastSync: new Date()
    }
  }
} 