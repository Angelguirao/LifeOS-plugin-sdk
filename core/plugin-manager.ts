/**
 * LifeOS Plugin SDK - Plugin Manager
 * 
 * Platform-agnostic plugin manager that handles plugin lifecycle,
 * event routing, and system operations. Works in both LifeOS Core and LifeOS Premium.
 */

import { 
  LifeOSPlugin, 
  PluginRegistry, 
  SystemStatus, 
  PluginStatus, 
  SyncResult,
  PluginSettings 
} from '../interfaces'
import { PluginRegistry as LifeOSPluginRegistry } from './plugin-registry'

export class PluginManager {
  registry: PluginRegistry
  private platform: 'core' | 'premium'
  private syncInterval?: NodeJS.Timeout

  constructor(platform: 'core' | 'premium' = 'premium') {
    this.registry = new LifeOSPluginRegistry()
    this.platform = platform
    this.startAutoSync()
  }

  /**
   * Load and initialize a plugin
   */
  async loadPlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.registry.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`)
      }

      await plugin.initialize()
      console.log(`Plugin loaded: ${plugin.name}`)
    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Unload and destroy a plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.registry.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`)
      }

      await plugin.destroy()
      this.registry.unregister(pluginId)
      console.log(`Plugin unloaded: ${plugin.name}`)
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Reload a plugin (unload then load)
   */
  async reloadPlugin(pluginId: string): Promise<void> {
    await this.unloadPlugin(pluginId)
    await this.loadPlugin(pluginId)
  }

  /**
   * Start a plugin
   */
  async startPlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.registry.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`)
      }

      await plugin.initialize()
      console.log(`Plugin started: ${plugin.name}`)
    } catch (error) {
      console.error(`Failed to start plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Stop a plugin
   */
  async stopPlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.registry.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`)
      }

      await plugin.destroy()
      console.log(`Plugin stopped: ${plugin.name}`)
    } catch (error) {
      console.error(`Failed to stop plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.registry.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`)
      }

      const settings = await plugin.getSettings()
      settings.enabled = true
      await plugin.updateSettings(settings)
      
      console.log(`Plugin enabled: ${plugin.name}`)
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.registry.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`)
      }

      const settings = await plugin.getSettings()
      settings.enabled = false
      await plugin.updateSettings(settings)
      
      console.log(`Plugin disabled: ${plugin.name}`)
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Route an event to all enabled plugins
   */
  async routeEvent(event: any): Promise<void> {
    const plugins = this.registry.getAllPlugins()
    
    for (const plugin of plugins) {
      try {
        const settings = await plugin.getSettings()
        if (settings.enabled) {
          if (event.type === 'created' && plugin.onEventCreated) {
            await plugin.onEventCreated(event)
          } else if (event.type === 'updated' && plugin.onEventUpdated) {
            await plugin.onEventUpdated(event)
          } else if (event.type === 'deleted' && plugin.onEventDeleted) {
            await plugin.onEventDeleted(event.id)
          }
        }
      } catch (error) {
        console.error(`Failed to route event to plugin ${plugin.id}:`, error)
      }
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const plugins = this.registry.getAllPlugins()
    const pluginStatuses: PluginStatus[] = []

    for (const plugin of plugins) {
      try {
        const settings = await plugin.getSettings()
        const status: PluginStatus = {
          pluginId: plugin.id,
          name: plugin.name,
          status: settings.enabled ? 'active' : 'inactive',
          errorCount: 0, // TODO: Implement error tracking
          lastError: undefined,
          capabilities: plugin.capabilities.map(cap => cap.type)
        }
        pluginStatuses.push(status)
      } catch (error) {
        pluginStatuses.push({
          pluginId: plugin.id,
          name: plugin.name,
          status: 'error',
          errorCount: 1,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          capabilities: plugin.capabilities.map(cap => cap.type)
        })
      }
    }

    const activePlugins = pluginStatuses.filter(p => p.status === 'active').length
    const systemHealth = this.determineSystemHealth(pluginStatuses)

    return {
      systemHealth,
      totalPlugins: plugins.length,
      activePlugins,
      lastSync: new Date(), // TODO: Track actual last sync
      pluginStatuses,
      platform: this.platform
    }
  }

  /**
   * Perform system-wide synchronization
   */
  async performSystemSync(): Promise<SyncResult[]> {
    const plugins = this.registry.getAllPlugins()
    const results: SyncResult[] = []

    for (const plugin of plugins) {
      try {
        const settings = await plugin.getSettings()
        if (settings.enabled && plugin.sync) {
          const result = await plugin.sync()
          results.push(result)
        }
      } catch (error) {
        console.error(`Failed to sync plugin ${plugin.id}:`, error)
        results.push({
          success: false,
          eventsImported: 0,
          eventsExported: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          lastSync: new Date()
        })
      }
    }

    return results
  }

  /**
   * Get plugins by capability
   */
  getPluginsByCapability(capability: string): LifeOSPlugin[] {
    return this.registry.getPluginsByCapability(capability)
  }

  /**
   * Determine overall system health
   */
  private determineSystemHealth(pluginStatuses: PluginStatus[]): 'healthy' | 'warning' | 'error' {
    const errorCount = pluginStatuses.filter(p => p.status === 'error').length
    const totalPlugins = pluginStatuses.length

    if (errorCount === 0) return 'healthy'
    if (errorCount < totalPlugins / 2) return 'warning'
    return 'error'
  }

  /**
   * Start auto-sync for plugins
   */
  private startAutoSync(): void {
    // Auto-sync every 5 minutes
    this.syncInterval = setInterval(async () => {
      try {
        await this.performSystemSync()
      } catch (error) {
        console.error('Auto-sync failed:', error)
      }
    }, 5 * 60 * 1000)
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    // Unload all plugins
    const plugins = this.registry.getAllPlugins()
    plugins.forEach(plugin => {
      plugin.destroy().catch(console.error)
    })
  }
}

 