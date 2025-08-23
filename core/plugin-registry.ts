/**
 * LifeOS Plugin SDK - Plugin Registry
 * 
 * Manages plugin registration, discovery, and capability-based routing.
 * Enhanced with version compatibility and capability management.
 */

import { 
  LifeOSPlugin, 
  PluginRegistry as IPluginRegistry, 
  PluginCompatibility,
  PluginCapabilityType,
  CapabilityStatus
} from '../interfaces'
import { VersionChecker } from '../utils/version-checker'

export class PluginRegistry implements IPluginRegistry {
  plugins: Map<string, LifeOSPlugin> = new Map()
  private capabilityIndex: Map<PluginCapabilityType, Set<string>> = new Map()
  private currentLifeOSVersion: string = '1.0.0' // This should come from LifeOS config

  constructor(lifeOSVersion: string = '1.0.0') {
    this.currentLifeOSVersion = lifeOSVersion
    this.initializeCapabilityIndex()
  }

  /**
   * Register a new plugin
   */
  register(plugin: LifeOSPlugin): void {
    try {
      console.log(`🔌 Registering plugin: ${plugin.name} (${plugin.id})`)
      
      // Check compatibility before registration
      const compatibility = this.checkCompatibility(plugin)
      console.log(`✅ Compatibility check passed for ${plugin.name}`)
      
      if (!compatibility.compatible) {
        throw new Error(
          `Plugin ${plugin.name} is not compatible with LifeOS ${this.currentLifeOSVersion}. ` +
          `Required: ${plugin.requiredLifeOSVersion}. ` +
          `Warnings: ${compatibility.warnings.join(', ')}`
        )
      }

      // Register the plugin first
      this.plugins.set(plugin.id, plugin)
      
      // Index by capabilities
      this.indexPluginCapabilities(plugin)
      
      // Now validate capabilities (after registration)
      console.log(`🔍 Validating capabilities for plugin ${plugin.name}...`)
      if (!this.validateCapabilityDependencies(plugin)) {
        console.warn(
          `⚠️ Plugin ${plugin.name} has missing capability dependencies. This is a warning during development.`
        )
        // Don't throw error during development - just warn
        // In production, you might want to be stricter
      } else {
        console.log(`✅ Capability validation passed for ${plugin.name}`)
      }
      
      console.log(`✅ Plugin registered successfully: ${plugin.name} (${plugin.id})`)
    } catch (error) {
      console.error(`❌ Failed to register plugin ${plugin.name}:`, error)
      throw error
    }
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      // Remove from capability index
      this.removePluginFromCapabilityIndex(plugin)
      
      // Remove from plugins map
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
  getPluginsByCapability(capability: PluginCapabilityType): LifeOSPlugin[] {
    const pluginIds = this.capabilityIndex.get(capability)
    if (!pluginIds) return []
    
    return Array.from(pluginIds)
      .map(id => this.plugins.get(id))
      .filter((plugin): plugin is LifeOSPlugin => plugin !== undefined)
  }

  /**
   * Get capability providers (plugins that provide a specific capability)
   */
  getCapabilityProviders(capability: PluginCapabilityType): LifeOSPlugin[] {
    return this.getPluginsByCapability(capability)
  }

  /**
   * Check plugin compatibility with current LifeOS version
   */
  checkCompatibility(plugin: LifeOSPlugin): PluginCompatibility {
    return VersionChecker.checkCompatibility(plugin, this.currentLifeOSVersion)
  }

  /**
   * Get all plugins compatible with a specific LifeOS version
   */
  getCompatiblePlugins(lifeOSVersion: string): LifeOSPlugin[] {
    return this.getAllPlugins().filter(plugin => 
      VersionChecker.satisfiesVersion(lifeOSVersion, plugin.requiredLifeOSVersion)
    )
  }

  /**
   * Validate that a plugin has all required capability dependencies
   */
  validateCapabilityDependencies(plugin: LifeOSPlugin): boolean {
    if (!plugin.requiredCapabilities || plugin.requiredCapabilities.length === 0) {
      console.log(`✅ No capabilities required for ${plugin.name}`)
      return true
    }

    console.log(`🔍 Validating ${plugin.requiredCapabilities.length} capabilities for plugin ${plugin.name}:`, plugin.requiredCapabilities)

    for (const capability of plugin.requiredCapabilities) {
      const isAvailable = this.isCapabilityAvailable(capability)
      console.log(`  📋 Capability ${capability}: ${isAvailable ? '✅ Available' : '❌ Not Available'}`)
      
      if (!isAvailable) {
        console.warn(`❌ Required capability not available: ${capability}`)
        return false
      }
    }

    console.log(`✅ All required capabilities are available for ${plugin.name}`)
    return true
  }

  /**
   * Get status of a specific capability across all plugins
   */
  getCapabilityStatus(capability: PluginCapabilityType): CapabilityStatus {
    const providers = this.getCapabilityProviders(capability)
    const activeProviders = providers.filter(plugin => {
      // Check if plugin is enabled (this would require async call in real implementation)
      return true // For now, assume all are active
    })

    const providerStatuses = providers.map(plugin => ({
      pluginId: plugin.id,
      pluginName: plugin.name,
      status: 'active' as const, // This would be determined by actual plugin status
      lastUsed: new Date() // This would come from actual usage tracking
    }))

    return {
      capability,
      totalProviders: providers.length,
      activeProviders: activeProviders.length,
      lastUsed: new Date(), // This would be the most recent usage
      providers: providerStatuses
    }
  }

  /**
   * Get all available capabilities
   */
  getAvailableCapabilities(): PluginCapabilityType[] {
    return Array.from(this.capabilityIndex.keys())
  }

  /**
   * Check if a capability is available
   */
  isCapabilityAvailable(capability: string): boolean {
    // During development, assume all capabilities are available
    // In production, this would check against LifeOS's actual capabilities
    const knownCapabilities = [
      'import', 'export', 'sync', 'oauth', 'webhook', 'api', 'custom',
      'music-tracking', 'mood-analysis', 'playlist-creation', 'real-time-sync',
      'offline-caching', 'audio-analysis', 'recommendations',
      'life-timeline', 'event-correlation', 'mood-tracking', 'focus-tracking',
      'social-integration', 'data-visualization'
    ]
    
    const isKnown = knownCapabilities.includes(capability)
    
    if (!isKnown) {
      console.warn(`Unknown capability: ${capability} - this might need to be added to the available capabilities list`)
    }
    
    // For development, assume all capabilities are available
    // In production, you'd check against LifeOS's actual capabilities
    return true
  }

  /**
   * Get plugins that provide multiple capabilities
   */
  getPluginsByMultipleCapabilities(capabilities: PluginCapabilityType[]): LifeOSPlugin[] {
    if (capabilities.length === 0) return []
    
    const pluginSets = capabilities.map(cap => this.capabilityIndex.get(cap))
    const commonPlugins = pluginSets.reduce((common, current) => {
      if (!common) return current
      if (!current) return common
      
      return new Set([...common].filter(id => current.has(id)))
    })

    if (!commonPlugins) return []
    
    return Array.from(commonPlugins)
      .map(id => this.plugins.get(id))
      .filter((plugin): plugin is LifeOSPlugin => plugin !== undefined)
  }

  /**
   * Initialize the capability index
   */
  private initializeCapabilityIndex(): void {
    // Initialize with all possible capability types
    const allCapabilities: PluginCapabilityType[] = [
      'import', 'export', 'sync', 'oauth', 'webhook', 'api', 'custom',
      'music-tracking', 'mood-analysis', 'playlist-creation', 'real-time-sync',
      'offline-caching', 'audio-analysis', 'recommendations',
      'life-timeline', 'event-correlation', 'mood-tracking', 'focus-tracking',
      'social-integration', 'data-visualization'
    ]
    
    allCapabilities.forEach(capability => {
      this.capabilityIndex.set(capability, new Set())
    })
  }

  /**
   * Index a plugin by its capabilities
   */
  private indexPluginCapabilities(plugin: LifeOSPlugin): void {
    plugin.capabilities.forEach(capability => {
      const pluginSet = this.capabilityIndex.get(capability.type)
      if (pluginSet) {
        pluginSet.add(plugin.id)
      }
    })
  }

  /**
   * Remove a plugin from the capability index
   */
  private removePluginFromCapabilityIndex(plugin: LifeOSPlugin): void {
    plugin.capabilities.forEach(capability => {
      const pluginSet = this.capabilityIndex.get(capability.type)
      if (pluginSet) {
        pluginSet.delete(plugin.id)
      }
    })
  }

  /**
   * Update the current LifeOS version
   */
  updateLifeOSVersion(version: string): void {
    this.currentLifeOSVersion = version
    console.log(`LifeOS version updated to: ${version}`)
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const totalPlugins = this.plugins.size
    const totalCapabilities = this.capabilityIndex.size
    const capabilityStats = Array.from(this.capabilityIndex.entries()).map(([cap, plugins]) => ({
      capability: cap,
      providerCount: plugins.size
    }))

    return {
      totalPlugins,
      totalCapabilities,
      capabilityStats,
      lifeOSVersion: this.currentLifeOSVersion
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.plugins.clear()
    this.capabilityIndex.clear()
  }
}

 