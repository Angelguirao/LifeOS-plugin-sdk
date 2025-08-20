/**
 * Mock plugin data for the LifeOS Plugin Marketplace
 * In production, this would come from a database or API
 */

import { PluginListing, PluginCategory, Platform, PricingModel } from './index'

export const mockPlugins: PluginListing[] = [
  {
    id: 'obsidian-integration',
    name: 'Obsidian Integration',
    description: 'Sync your Obsidian vault with LifeOS. Import notes as events and export LifeOS data back to Obsidian.',
    author: 'LifeOS Team',
    version: '1.0.0',
    category: 'sync',
    tags: ['obsidian', 'notes', 'sync', 'markdown'],
    icon: '📝',
    downloads: 1247,
    rating: 4.8,
    reviewCount: 89,
    lastUpdated: new Date('2024-01-15'),
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['web', 'desktop']
    },
    pricing: 'free',
    oauthScopes: [],
    dependencies: [],
    readme: 'Full documentation for Obsidian integration...',
    changelog: [
      'v1.0.0 - Initial release with basic sync functionality',
      'v0.9.0 - Beta testing with early adopters'
    ]
  },
  {
    id: 'spotify-integration',
    name: 'Spotify Music Tracker',
    description: 'Track your listening habits, favorite artists, and music mood patterns in LifeOS.',
    author: 'Music Analytics Inc.',
    version: '2.1.0',
    category: 'entertainment',
    tags: ['spotify', 'music', 'analytics', 'mood'],
    icon: '🎵',
    screenshots: ['spotify-dashboard.png', 'music-timeline.png'],
    downloads: 3421,
    rating: 4.6,
    reviewCount: 156,
    lastUpdated: new Date('2024-01-20'),
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['web', 'mobile']
    },
    pricing: 'free',
    oauthScopes: ['user-read-recently-played', 'user-top-read', 'user-read-playback-state'],
    dependencies: [],
    readme: 'Connect your Spotify account to track music habits...',
    changelog: [
      'v2.1.0 - Added mood analysis based on music genres',
      'v2.0.0 - Complete rewrite with new API integration',
      'v1.5.0 - Added playlist tracking and recommendations'
    ]
  },
  {
    id: 'apple-health-sync',
    name: 'Apple Health Sync',
    description: 'Import health data from Apple Health including steps, heart rate, sleep, and workouts.',
    author: 'HealthSync Labs',
    version: '1.3.2',
    category: 'health',
    tags: ['apple-health', 'fitness', 'health', 'sync'],
    icon: '🏃‍♂️',
    screenshots: ['health-dashboard.png', 'fitness-timeline.png'],
    downloads: 2156,
    rating: 4.7,
    reviewCount: 203,
    lastUpdated: new Date('2024-01-18'),
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['web', 'mobile']
    },
    pricing: 'premium',
    oauthScopes: ['health.read'],
    dependencies: [],
    readme: 'Sync your Apple Health data with LifeOS...',
    changelog: [
      'v1.3.2 - Fixed sleep tracking accuracy',
      'v1.3.0 - Added workout type detection',
      'v1.2.0 - Improved heart rate variability analysis'
    ]
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar Sync',
    description: 'Sync your Google Calendar events with LifeOS timeline. Perfect for work-life balance tracking.',
    author: 'Calendar Pro',
    version: '1.8.1',
    category: 'productivity',
    tags: ['google-calendar', 'events', 'productivity', 'schedule'],
    icon: '📅',
    screenshots: ['calendar-view.png', 'event-timeline.png'],
    downloads: 1893,
    rating: 4.5,
    reviewCount: 127,
    lastUpdated: new Date('2024-01-22'),
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['web', 'desktop', 'mobile']
    },
    pricing: 'free',
    oauthScopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    dependencies: [],
    readme: 'Connect your Google Calendar to LifeOS...',
    changelog: [
      'v1.8.1 - Fixed timezone handling issues',
      'v1.8.0 - Added recurring event support',
      'v1.7.0 - Improved event categorization'
    ]
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker Pro',
    description: 'Track daily habits, build streaks, and analyze your habit patterns over time.',
    author: 'HabitMaster',
    version: '3.2.0',
    category: 'productivity',
    tags: ['habits', 'tracking', 'streaks', 'analytics'],
    icon: '✅',
    screenshots: ['habit-dashboard.png', 'streak-view.png'],
    downloads: 4567,
    rating: 4.9,
    reviewCount: 312,
    lastUpdated: new Date('2024-01-25'),
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['web', 'mobile']
    },
    pricing: 'subscription',
    oauthScopes: [],
    dependencies: [],
    readme: 'Build better habits with LifeOS...',
    changelog: [
      'v3.2.0 - Added habit templates and sharing',
      'v3.1.0 - Improved streak visualization',
      'v3.0.0 - Complete UI redesign with dark mode'
    ]
  },
  {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    description: 'Track your daily mood, emotions, and mental health patterns with beautiful visualizations.',
    author: 'Mindful Apps',
    version: '2.4.1',
    category: 'health',
    tags: ['mood', 'mental-health', 'emotions', 'tracking'],
    icon: '😊',
    screenshots: ['mood-chart.png', 'emotion-timeline.png'],
    downloads: 3124,
    rating: 4.8,
    reviewCount: 245,
    lastUpdated: new Date('2024-01-19'),
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['web', 'mobile']
    },
    pricing: 'free',
    oauthScopes: [],
    dependencies: [],
    readme: 'Track your emotional wellbeing...',
    changelog: [
      'v2.4.1 - Fixed mood correlation analysis',
      'v2.4.0 - Added emotion tagging system',
      'v2.3.0 - New mood visualization charts'
    ]
  }
]

export const mockCategories: Record<PluginCategory, { name: string; description: string; icon: string }> = {
  sync: { name: 'Sync & Import', description: 'Connect external services and sync data', icon: '🔄' },
  health: { name: 'Health & Fitness', description: 'Track health metrics and wellness', icon: '🏥' },
  productivity: { name: 'Productivity', description: 'Boost your efficiency and organization', icon: '⚡' },
  entertainment: { name: 'Entertainment', description: 'Track media consumption and hobbies', icon: '🎮' },
  social: { name: 'Social', description: 'Connect with friends and social platforms', icon: '👥' },
  finance: { name: 'Finance', description: 'Track spending and financial goals', icon: '💰' },
  education: { name: 'Education', description: 'Learning progress and skill development', icon: '📚' },
  other: { name: 'Other', description: 'Miscellaneous plugins and tools', icon: '🔧' }
}

export const mockStats: MarketplaceStats = {
  totalPlugins: mockPlugins.length,
  totalDownloads: mockPlugins.reduce((sum, p) => sum + p.downloads, 0),
  totalReviews: mockPlugins.reduce((sum, p) => sum + p.reviewCount, 0),
  categories: {
    sync: mockPlugins.filter(p => p.category === 'sync').length,
    health: mockPlugins.filter(p => p.category === 'health').length,
    productivity: mockPlugins.filter(p => p.category === 'productivity').length,
    entertainment: mockPlugins.filter(p => p.category === 'entertainment').length,
    social: mockPlugins.filter(p => p.category === 'social').length,
    finance: mockPlugins.filter(p => p.category === 'finance').length,
    education: mockPlugins.filter(p => p.category === 'education').length,
    other: mockPlugins.filter(p => p.category === 'other').length
  },
  topRated: [...mockPlugins].sort((a, b) => b.rating - a.rating).slice(0, 5),
  mostDownloaded: [...mockPlugins].sort((a, b) => b.downloads - a.downloads).slice(0, 5),
  recentlyUpdated: [...mockPlugins].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()).slice(0, 5)
}
