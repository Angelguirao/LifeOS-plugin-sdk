/**
 * LifeOS Plugin Marketplace Service
 * 
 * Handles plugin discovery, installation, and management
 */

import { 
  PluginListing, 
  PluginCategory, 
  MarketplaceFilters, 
  MarketplaceStats,
  PluginInstallation,
  Platform
} from './index'
import { mockPlugins, mockCategories, mockStats } from './mock-data'

export class MarketplaceService {
  private installedPlugins: Map<string, PluginInstallation> = new Map()

  constructor() {
    // Initialize with any previously installed plugins
    this.loadInstalledPlugins()
  }

  /**
   * Get all available plugins with optional filtering
   */
  async getPlugins(filters?: MarketplaceFilters): Promise<PluginListing[]> {
    let plugins = [...mockPlugins]

    if (filters?.category) {
      plugins = plugins.filter(p => p.category === filters.category)
    }

    if (filters?.platform) {
      plugins = plugins.filter(p => p.compatibility.platforms.includes(filters.platform!))
    }

    if (filters?.pricing) {
      plugins = plugins.filter(p => p.pricing === filters.pricing)
    }

    if (filters?.rating) {
      plugins = plugins.filter(p => p.rating >= filters.rating!)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      plugins = plugins.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    if (filters?.tags && filters.tags.length > 0) {
      plugins = plugins.filter(p => 
        filters.tags!.some(tag => p.tags.includes(tag))
      )
    }

    return plugins
  }

  /**
   * Get plugin by ID
   */
  async getPlugin(id: string): Promise<PluginListing | null> {
    return mockPlugins.find(p => p.id === id) || null
  }

  /**
   * Get all plugin categories
   */
  async getCategories(): Promise<Record<PluginCategory, { name: string; description: string; icon: string }>> {
    return mockCategories
  }

  /**
   * Get marketplace statistics
   */
  async getStats(): Promise<MarketplaceStats> {
    return mockStats
  }

  /**
   * Install a plugin
   */
  async installPlugin(pluginId: string, settings?: Record<string, any>): Promise<boolean> {
    try {
      const plugin = await this.getPlugin(pluginId)
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`)
      }

      // Check if already installed
      if (this.installedPlugins.has(pluginId)) {
        throw new Error(`Plugin ${pluginId} is already installed`)
      }

      // Simulate installation process
      await this.simulateInstallation(plugin)

      // Add to installed plugins
      const installation: PluginInstallation = {
        pluginId,
        version: plugin.version,
        installedAt: new Date(),
        status: 'active',
        settings: settings || {},
        lastSync: undefined
      }

      this.installedPlugins.set(pluginId, installation)
      this.saveInstalledPlugins()

      console.log(`Plugin ${plugin.name} installed successfully`)
      return true
    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error)
      return false
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: string): Promise<boolean> {
    try {
      if (!this.installedPlugins.has(pluginId)) {
        throw new Error(`Plugin ${pluginId} is not installed`)
      }

      // Simulate uninstallation process
      await this.simulateUninstallation(pluginId)

      // Remove from installed plugins
      this.installedPlugins.delete(pluginId)
      this.saveInstalledPlugins()

      console.log(`Plugin ${pluginId} uninstalled successfully`)
      return true
    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, error)
      return false
    }
  }

  /**
   * Get installed plugins
   */
  async getInstalledPlugins(): Promise<PluginInstallation[]> {
    return Array.from(this.installedPlugins.values())
  }

  /**
   * Check if a plugin is installed
   */
  async isPluginInstalled(pluginId: string): Promise<boolean> {
    return this.installedPlugins.has(pluginId)
  }

  /**
   * Update plugin settings
   */
  async updatePluginSettings(pluginId: string, settings: Record<string, any>): Promise<boolean> {
    try {
      const installation = this.installedPlugins.get(pluginId)
      if (!installation) {
        throw new Error(`Plugin ${pluginId} is not installed`)
      }

      installation.settings = { ...installation.settings, ...settings }
      this.saveInstalledPlugins()

      return true
    } catch (error) {
      console.error(`Failed to update settings for plugin ${pluginId}:`, error)
      return false
    }
  }

  /**
   * Get plugin installation status
   */
  async getPluginStatus(pluginId: string): Promise<'installed' | 'not-installed' | 'error'> {
    const installation = this.installedPlugins.get(pluginId)
    if (!installation) return 'not-installed'
    return installation.status === 'error' ? 'error' : 'installed'
  }

  /**
   * Search plugins by query
   */
  async searchPlugins(query: string): Promise<PluginListing[]> {
    return this.getPlugins({ search: query })
  }

  /**
   * Get plugins by category
   */
  async getPluginsByCategory(category: PluginCategory): Promise<PluginListing[]> {
    return this.getPlugins({ category })
  }

  /**
   * Get top rated plugins
   */
  async getTopRatedPlugins(limit: number = 10): Promise<PluginListing[]> {
    const plugins = await this.getPlugins()
    return plugins
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
  }

  /**
   * Get most downloaded plugins
   */
  async getMostDownloadedPlugins(limit: number = 10): Promise<PluginListing[]> {
    const plugins = await this.getPlugins()
    return plugins
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit)
  }

  /**
   * Get recently updated plugins
   */
  async getRecentlyUpdatedPlugins(limit: number = 10): Promise<PluginListing[]> {
    const plugins = await this.getPlugins()
    return plugins
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, limit)
  }

  /**
   * Simulate plugin installation process
   */
  private async simulateInstallation(plugin: PluginListing): Promise<void> {
    console.log(`Installing ${plugin.name}...`)
    
    // Simulate download time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate dependency check
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      console.log(`Checking dependencies: ${plugin.dependencies.join(', ')}`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Simulate OAuth setup if needed
    if (plugin.oauthScopes && plugin.oauthScopes.length > 0) {
      console.log(`OAuth scopes required: ${plugin.oauthScopes.join(', ')}`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`${plugin.name} installation completed`)
  }

  /**
   * Simulate plugin uninstallation process
   */
  private async simulateUninstallation(pluginId: string): Promise<void> {
    console.log(`Uninstalling plugin ${pluginId}...`)
    
    // Simulate cleanup time
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`Plugin ${pluginId} uninstallation completed`)
  }

  /**
   * Load installed plugins from storage
   */
  private loadInstalledPlugins(): void {
    try {
      // In a real app, this would load from localStorage, database, or API
      const stored = localStorage.getItem('lifeos-installed-plugins')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.installedPlugins = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.warn('Failed to load installed plugins from storage:', error)
    }
  }

  /**
   * Save installed plugins to storage
   */
  private saveInstalledPlugins(): void {
    try {
      // In a real app, this would save to localStorage, database, or API
      const serialized = Object.fromEntries(this.installedPlugins)
      localStorage.setItem('lifeos-installed-plugins', JSON.stringify(serialized))
    } catch (error) {
      console.warn('Failed to save installed plugins to storage:', error)
    }
  }
}
