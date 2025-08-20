/**
 * LifeOS Plugin SDK - Plugin Helper Utilities
 * 
 * Common utility functions for plugin development and management.
 */

import { LifeOSPlugin, PluginCapability, PluginStatus } from '../interfaces';

/**
 * Check if a plugin has a specific capability
 */
export function hasCapability(plugin: LifeOSPlugin, capability: PluginCapability): boolean {
  return plugin.capabilities.includes(capability);
}

/**
 * Get all plugins with a specific capability
 */
export function getPluginsWithCapability(
  plugins: LifeOSPlugin[], 
  capability: PluginCapability
): LifeOSPlugin[] {
  return plugins.filter(plugin => hasCapability(plugin, capability));
}

/**
 * Check if a plugin is healthy and ready
 */
export function isPluginHealthy(plugin: LifeOSPlugin): boolean {
  return plugin.status === PluginStatus.ACTIVE && plugin.health?.isHealthy !== false;
}

/**
 * Get plugin statistics
 */
export function getPluginStats(plugins: LifeOSPlugin[]) {
  const total = plugins.length;
  const active = plugins.filter(p => p.status === PluginStatus.ACTIVE).length;
  const inactive = plugins.filter(p => p.status === PluginStatus.INACTIVE).length;
  const error = plugins.filter(p => p.status === PluginStatus.ERROR).length;
  
  return { total, active, inactive, error };
}

/**
 * Validate plugin configuration
 */
export function validatePluginConfig(plugin: LifeOSPlugin): string[] {
  const errors: string[] = [];
  
  if (!plugin.id) errors.push('Plugin ID is required');
  if (!plugin.name) errors.push('Plugin name is required');
  if (!plugin.version) errors.push('Plugin version is required');
  if (!plugin.capabilities || plugin.capabilities.length === 0) {
    errors.push('Plugin must have at least one capability');
  }
  
  return errors;
}
