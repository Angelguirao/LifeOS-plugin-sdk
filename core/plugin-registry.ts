/**
 * LifeOS Plugin SDK - Plugin Registry
 * 
 * Manages plugin registration, discovery, and lifecycle.
 */

import { LifeOSPlugin } from '../interfaces'

export class PluginRegistry {
  plugins = new Map<string, LifeOSPlugin>()

  /**
   * Register a new plugin
   */
  register(plugin: LifeOSPlugin): void {
    this.plugins.set(plugin.id, plugin)
    console.log(`Plugin registered: ${plugin.name} (${plugin.id})`)
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      this.plugins.delete(pluginId)
      console.log(`Plugin unregistered: ${plugin.name} (${pluginId})`)
    }
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): LifeOSPlugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): LifeOSPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugins by capability
   */
  getPluginsByCapability(capability: string): LifeOSPlugin[] {
    return this.getAllPlugins().filter(plugin =>
      plugin.capabilities.some(cap => cap.type === capability)
    )
  }

  /**
   * Check if a plugin is registered
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * Get plugin count
   */
  getPluginCount(): number {
    return this.plugins.size
  }
}

 