/**
 * LifeOS Plugin Marketplace
 * 
 * Provides plugin discovery, installation, and management capabilities
 */

export interface PluginListing {
  id: string
  name: string
  description: string
  author: string
  version: string
  category: PluginCategory
  tags: string[]
  icon?: string
  screenshots?: string[]
  downloads: number
  rating: number
  reviewCount: number
  lastUpdated: Date
  compatibility: {
    minVersion: string
    platforms: Platform[]
  }
  pricing: PricingModel
  oauthScopes?: string[]
  dependencies?: string[]
  readme?: string
  changelog?: string[]
}

export type PluginCategory = 
  | 'sync' 
  | 'health' 
  | 'productivity' 
  | 'entertainment' 
  | 'social' 
  | 'finance' 
  | 'education' 
  | 'other'

export type Platform = 'web' | 'desktop' | 'mobile' | 'cli'

export type PricingModel = 'free' | 'premium' | 'subscription' | 'one-time'

export interface PluginReview {
  id: string
  pluginId: string
  userId: string
  rating: number
  comment: string
  date: Date
  helpful: number
}

export interface PluginInstallation {
  pluginId: string
  version: string
  installedAt: Date
  status: 'active' | 'inactive' | 'error'
  settings: Record<string, any>
  lastSync?: Date
}

export interface MarketplaceStats {
  totalPlugins: number
  totalDownloads: number
  totalReviews: number
  categories: Record<PluginCategory, number>
  topRated: PluginListing[]
  mostDownloaded: PluginListing[]
  recentlyUpdated: PluginListing[]
}

export interface MarketplaceFilters {
  category?: PluginCategory
  platform?: Platform
  pricing?: PricingModel
  rating?: number
  search?: string
  tags?: string[]
}
