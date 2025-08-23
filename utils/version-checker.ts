/**
 * LifeOS Plugin SDK - Version Compatibility Checker
 * 
 * Handles semantic version checking and compatibility validation
 * between plugins and LifeOS versions.
 */

import { PluginCompatibility, LifeOSPlugin } from '../interfaces'

/**
 * Semantic version comparison and validation
 */
export class VersionChecker {
  private static readonly SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
  private static readonly RANGE_REGEX = /^([<>=~^]+)\s*(\d+\.\d+\.\d+)$/

  /**
   * Check if a plugin is compatible with the current LifeOS version
   */
  static checkCompatibility(
    plugin: LifeOSPlugin, 
    currentLifeOSVersion: string
  ): PluginCompatibility {
    const requiredVersion = plugin.requiredLifeOSVersion
    const compatible = this.satisfiesVersion(currentLifeOSVersion, requiredVersion)
    
    const missingCapabilities = this.checkRequiredCapabilities(plugin)
    const warnings = this.generateWarnings(plugin, currentLifeOSVersion)
    const recommendations = this.generateRecommendations(plugin, currentLifeOSVersion, compatible)

    return {
      pluginId: plugin.id,
      compatible,
      lifeOSVersion: currentLifeOSVersion,
      requiredVersion,
      missingCapabilities,
      warnings,
      recommendations
    }
  }

  /**
   * Check if a version satisfies a range requirement
   */
  static satisfiesVersion(version: string, range: string): boolean {
    try {
      // Handle basic operators
      if (range.startsWith('>=')) {
        return this.compareVersions(version, range.slice(2)) >= 0
      }
      if (range.startsWith('>')) {
        return this.compareVersions(version, range.slice(1)) > 0
      }
      if (range.startsWith('<=')) {
        return this.compareVersions(version, range.slice(2)) <= 0
      }
      if (range.startsWith('<')) {
        return this.compareVersions(version, range.slice(1)) < 0
      }
      if (range.startsWith('^')) {
        return this.satisfiesCaretRange(version, range.slice(1))
      }
      if (range.startsWith('~')) {
        return this.satisfiesTildeRange(version, range.slice(1))
      }
      
      // Exact version match
      return this.compareVersions(version, range) === 0
    } catch (error) {
      console.warn(`Version comparison failed for ${version} and ${range}:`, error)
      return false
    }
  }

  /**
   * Compare two semantic versions
   */
  private static compareVersions(version1: string, version2: string): number {
    const v1 = this.parseVersion(version1)
    const v2 = this.parseVersion(version2)

    for (let i = 0; i < 3; i++) {
      if (v1[i] > v2[i]) return 1
      if (v1[i] < v2[i]) return -1
    }
    return 0
  }

  /**
   * Parse semantic version string
   */
  private static parseVersion(version: string): [number, number, number] {
    const match = version.match(this.SEMVER_REGEX)
    if (!match) {
      throw new Error(`Invalid version format: ${version}`)
    }
    
    return [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10)
    ]
  }

  /**
   * Check caret range (^1.2.3 allows 1.2.3 to 1.x.x)
   */
  private static satisfiesCaretRange(version: string, rangeVersion: string): boolean {
    const v = this.parseVersion(version)
    const r = this.parseVersion(rangeVersion)
    
    if (r[0] === 0) {
      // ^0.x.x allows 0.x.x only
      return v[0] === 0 && this.compareVersions(version, rangeVersion) >= 0
    }
    
    // ^1.2.3 allows 1.2.3 to 1.x.x
    return v[0] === r[0] && this.compareVersions(version, rangeVersion) >= 0
  }

  /**
   * Check tilde range (~1.2.3 allows 1.2.3 to 1.2.x)
   */
  private static satisfiesTildeRange(version: string, rangeVersion: string): boolean {
    const v = this.parseVersion(version)
    const r = this.parseVersion(rangeVersion)
    
    return v[0] === r[0] && v[1] === r[1] && this.compareVersions(version, rangeVersion) >= 0
  }

  /**
   * Check if plugin has all required capabilities
   */
  private static checkRequiredCapabilities(plugin: LifeOSPlugin): string[] {
    const missing: string[] = []
    
    if (plugin.requiredCapabilities) {
      for (const capability of plugin.requiredCapabilities) {
        // For now, we'll assume all basic capabilities are available
        // In a real implementation, you'd check against LifeOS's actual capabilities
        if (!this.isCapabilityAvailable(capability)) {
          missing.push(capability)
        }
      }
    }
    
    return missing
  }

  /**
   * Check if a capability is available in LifeOS
   */
  private static isCapabilityAvailable(capability: string): boolean {
    // This would be implemented based on LifeOS's actual capabilities
    // For now, we'll assume all capabilities are available
    const availableCapabilities = [
      'import', 'export', 'sync', 'oauth', 'webhook', 'api', 'custom',
      'music-tracking', 'mood-analysis', 'playlist-creation', 'real-time-sync',
      'offline-caching', 'audio-analysis', 'recommendations',
      'life-timeline', 'event-correlation', 'mood-tracking', 'focus-tracking',
      'social-integration', 'data-visualization'
    ]
    
    // Check if the capability is in our known list
    const isKnown = availableCapabilities.includes(capability)
    
    if (!isKnown) {
      console.warn(`Unknown capability: ${capability} - this might need to be added to the available capabilities list`)
    }
    
    // For development, assume all capabilities are available
    // In production, you'd check against LifeOS's actual capabilities
    return true
  }

  /**
   * Generate compatibility warnings
   */
  private static generateWarnings(plugin: LifeOSPlugin, currentVersion: string): string[] {
    const warnings: string[] = []
    
    // Check if plugin version is very old
    if (this.isVersionOld(plugin.version)) {
      warnings.push(`Plugin version ${plugin.version} is quite old and may have compatibility issues`)
    }
    
    // Check if required version is very restrictive
    if (this.isVersionRestrictive(plugin.requiredLifeOSVersion)) {
      warnings.push(`Plugin has very restrictive version requirements: ${plugin.requiredLifeOSVersion}`)
    }
    
    return warnings
  }

  /**
   * Generate recommendations for compatibility issues
   */
  private static generateRecommendations(
    plugin: LifeOSPlugin, 
    currentVersion: string, 
    compatible: boolean
  ): string[] {
    const recommendations: string[] = []
    
    if (!compatible) {
      recommendations.push(`Update LifeOS to version ${plugin.requiredLifeOSVersion} or higher`)
      recommendations.push(`Or contact the plugin author to update compatibility requirements`)
    }
    
    if (plugin.requiredCapabilities && plugin.requiredCapabilities.length > 0) {
      recommendations.push(`Ensure all required capabilities are enabled: ${plugin.requiredCapabilities.join(', ')}`)
    }
    
    if (this.isVersionOld(plugin.version)) {
      recommendations.push(`Consider updating to a newer version of the plugin`)
    }
    
    return recommendations
  }

  /**
   * Check if a version is considered old
   */
  private static isVersionOld(version: string): boolean {
    try {
      const v = this.parseVersion(version)
      const currentYear = new Date().getFullYear()
      
      // Consider versions older than 2 years as old
      return v[0] < (currentYear - 2023)
    } catch {
      return false
    }
  }

  /**
   * Check if a version requirement is very restrictive
   */
  private static isVersionRestrictive(requiredVersion: string): boolean {
    // Check for exact version matches or very narrow ranges
    if (requiredVersion.match(/^\d+\.\d+\.\d+$/)) {
      return true // Exact version
    }
    
    if (requiredVersion.match(/^~\d+\.\d+\.\d+$/)) {
      return true // Tilde range (very narrow)
    }
    
    return false
  }

  /**
   * Get the latest compatible version from a range
   */
  static getLatestCompatibleVersion(range: string): string | null {
    try {
      if (range.startsWith('>=')) {
        return range.slice(2)
      }
      if (range.startsWith('>')) {
        return range.slice(1)
      }
      if (range.startsWith('^')) {
        return range.slice(1)
      }
      if (range.startsWith('~')) {
        return range.slice(1)
      }
      
      return range
    } catch {
      return null
    }
  }
}
