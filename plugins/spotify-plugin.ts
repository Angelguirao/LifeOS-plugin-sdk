/**
 * LifeOS Plugin SDK - Spotify Integration Plugin
 * 
 * Real Spotify integration with OAuth authentication and API calls
 */

import { LifeOSPlugin, PluginCapability, PluginSettings } from '../interfaces'
import { LifeOSEvent } from '@angelguirao/lifeos-protocol'

export interface SpotifyCredentials {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scope: string[]
}

export interface SpotifyTrack {
  id: string
  name: string
  artist: string
  album: string
  duration: number
  playedAt: Date
  popularity: number
  genres: string[]
}

export interface SpotifyListeningSession {
  startTime: Date
  endTime: Date
  tracks: SpotifyTrack[]
  totalDuration: number
  mood?: 'energetic' | 'calm' | 'focused' | 'relaxed' | 'unknown'
}

export class SpotifyPlugin implements LifeOSPlugin {
  id = 'spotify-integration'
  name = 'Spotify Music Tracker'
  version = '2.1.0'
  description = 'Track your listening habits, favorite artists, and music mood patterns in LifeOS.'
  author = 'LifeOS Team'
  
  capabilities: PluginCapability[] = [
    {
      type: 'oauth',
      description: 'OAuth authentication with Spotify',
      configurable: true,
      metadata: {
        oauthUrl: 'https://accounts.spotify.com/authorize',
        scopes: ['user-read-recently-played', 'user-top-read', 'user-read-playback-state']
      }
    },
    {
      type: 'sync',
      description: 'Sync listening history and preferences',
      configurable: true
    },
    {
      type: 'custom',
      description: 'Music mood analysis and insights',
      configurable: true
    }
  ]

  private settings: PluginSettings = {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    credentials: {},
    customSettings: {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      autoAnalyzeMood: true,
      syncHistoryDays: 30,
      includePlaylists: true
    },
    platform: 'premium'
  }

  // Ensure customSettings is always defined
  private get customSettings() {
    return this.settings.customSettings || {}
  }

  // Validate required OAuth settings
  private validateOAuthSettings(): boolean {
    const { clientId, clientSecret, redirectUri } = this.customSettings
    if (!clientId || !clientSecret || !redirectUri) {
      console.warn('Missing required OAuth settings:', { clientId: !!clientId, clientSecret: !!clientSecret, redirectUri: !!redirectUri })
      return false
    }
    return true
  }

  private credentials: SpotifyCredentials | null = null
  private isAuthenticated = false

  constructor() {
    // Load saved credentials if available
    this.loadCredentials()
  }

  async initialize(): Promise<void> {
    console.log('Initializing Spotify plugin...')
    
    try {
      // Check if we have valid credentials
      if (this.credentials && this.isTokenValid()) {
        this.isAuthenticated = true
        console.log('Spotify plugin authenticated with existing credentials')
      } else if (this.credentials?.refreshToken) {
        // Try to refresh the token
        await this.refreshAccessToken()
      }
      
      this.settings.enabled = true
      console.log('Spotify plugin initialized')
    } catch (error) {
      console.error('Failed to initialize Spotify plugin:', error)
      throw error
    }
  }

  async destroy(): Promise<void> {
    console.log('Destroying Spotify plugin...')
    this.settings.enabled = false
    this.isAuthenticated = false
    console.log('Spotify plugin destroyed')
  }

  async getSettings(): Promise<PluginSettings> {
    return { ...this.settings }
  }

  async updateSettings(newSettings: Partial<PluginSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings }
    
    // If OAuth settings changed, reset authentication
    if (newSettings.customSettings?.clientId || newSettings.customSettings?.clientSecret) {
      this.isAuthenticated = false
      this.credentials = null
    }
  }

  // OAuth Authentication Methods
  async authenticate(clientId: string, clientSecret: string, redirectUri: string): Promise<string> {
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing required OAuth parameters')
    }

    const scopes = this.capabilities
      .find(cap => cap.type === 'oauth')
      ?.metadata?.scopes || []
    
    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scopes.join(' '))
    authUrl.searchParams.set('state', this.generateState())
    
    return authUrl.toString()
  }

  async handleOAuthCallback(code: string, state: string): Promise<boolean> {
    try {
      // Verify state parameter
      if (state !== this.getStoredState()) {
        throw new Error('Invalid OAuth state parameter')
      }

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code)
      
      // Store credentials
      this.credentials = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
        scope: tokens.scope.split(' ')
      }
      
      this.isAuthenticated = true
      this.saveCredentials()
      
      console.log('Spotify OAuth authentication successful')
      return true
    } catch (error) {
      console.error('Spotify OAuth authentication failed:', error)
      return false
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available')
    }

    if (!this.validateOAuthSettings()) {
      throw new Error('Missing OAuth settings for token refresh')
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.customSettings.clientId}:${this.customSettings.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.credentials.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const tokens = await response.json()
      
      this.credentials.accessToken = tokens.access_token
      this.credentials.expiresAt = Date.now() + (tokens.expires_in * 1000)
      
      if (tokens.refresh_token) {
        this.credentials.refreshToken = tokens.refresh_token
      }
      
      this.saveCredentials()
      this.isAuthenticated = true
      
      console.log('Spotify access token refreshed')
      return true
    } catch (error) {
      console.error('Failed to refresh Spotify access token:', error)
      this.isAuthenticated = false
      return false
    }
  }

  // Data Synchronization
  async sync(): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('Spotify plugin not authenticated')
    }

    console.log('Starting Spotify sync...')
    
    try {
      const startTime = Date.now()
      
      // Sync recent listening history
      const recentTracks = await this.getRecentlyPlayed()
      
      // Sync top artists and tracks
      const topArtists = await this.getTopArtists()
      const topTracks = await this.getTopTracks()
      
      // Analyze mood patterns
      const moodAnalysis = this.analyzeMood(recentTracks)
      
      // Create LifeOS events for significant listening sessions
      const events = await this.createListeningEvents(recentTracks)
      
      const syncDuration = Date.now() - startTime
      
      const result = {
        success: true,
        eventsImported: events.length,
        eventsExported: 0,
        errors: [],
        lastSync: new Date(),
        events: events, // Include the actual events in the result
        metadata: {
          tracksProcessed: recentTracks.length,
          artistsAnalyzed: topArtists.length,
          moodAnalysis: moodAnalysis,
          syncDuration: `${(syncDuration / 1000).toFixed(1)}s`
        }
      }
      
      console.log('Spotify sync completed:', result)
      return result
    } catch (error) {
      console.error('Spotify sync failed:', error)
      throw error
    }
  }

  // Spotify API Methods
  private async makeSpotifyRequest(endpoint: string): Promise<any> {
    if (!this.credentials?.accessToken) {
      throw new Error('No access token available')
    }

    // Check if token needs refresh
    if (this.isTokenExpired()) {
      await this.refreshAccessToken()
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken()
        // Retry the request
        const retryResponse = await fetch(`https://api.spotify.com/v1${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`
          }
        })
        
        if (!retryResponse.ok) {
          throw new Error(`Spotify API request failed: ${retryResponse.statusText}`)
        }
        
        return retryResponse.json()
      }
      
      throw new Error(`Spotify API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getRecentlyPlayed(limit: number = 50): Promise<SpotifyTrack[]> {
    console.log('Fetching recently played tracks from Spotify...')
    const data = await this.makeSpotifyRequest(`/me/player/recently-played?limit=${limit}`)
    
    console.log('Spotify API response:', data)
    console.log('Items count:', data.items?.length || 0)
    
    if (!data.items || data.items.length === 0) {
      console.warn('No recently played tracks found')
      return []
    }
    
    const tracks = data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      duration: item.track.duration_ms,
      playedAt: new Date(item.played_at),
      popularity: item.track.popularity,
      genres: [] // Would need additional API call to get genres
    }))
    
    console.log('Processed tracks:', tracks)
    return tracks
  }

  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<any[]> {
    const data = await this.makeSpotifyRequest(`/me/top/artists?time_range=${timeRange}&limit=20`)
    return data.items
  }

  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<any[]> {
    const data = await this.makeSpotifyRequest(`/me/top/tracks?time_range=${timeRange}&limit=20`)
    return data.items
  }

  // Mood Analysis
  private analyzeMood(tracks: SpotifyTrack[]): any {
    if (!this.customSettings.autoAnalyzeMood) {
      return { enabled: false }
    }

    // Simple mood analysis based on track characteristics
    // In a real implementation, you'd use music analysis APIs or ML models
    const analysis = {
      totalTracks: tracks.length,
      averagePopularity: 0,
      mood: 'unknown' as SpotifyListeningSession['mood'],
      topGenres: [] as string[],
      listeningPatterns: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      }
    }

    if (tracks.length === 0) return analysis

    // Calculate average popularity
    const totalPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0)
    analysis.averagePopularity = totalPopularity / tracks.length

    // Analyze listening patterns by time of day
    tracks.forEach(track => {
      const hour = track.playedAt.getHours()
      if (hour >= 6 && hour < 12) analysis.listeningPatterns.morning++
      else if (hour >= 12 && hour < 17) analysis.listeningPatterns.afternoon++
      else if (hour >= 17 && hour < 22) analysis.listeningPatterns.evening++
      else analysis.listeningPatterns.night++
    })

    // Determine mood based on patterns
    if (analysis.listeningPatterns.morning > analysis.listeningPatterns.night) {
      analysis.mood = 'energetic'
    } else if (analysis.listeningPatterns.night > analysis.listeningPatterns.morning) {
      analysis.mood = 'calm'
    } else {
      analysis.mood = 'focused'
    }

    return analysis
  }

  // Event Creation
  private async createListeningEvents(tracks: SpotifyTrack[]): Promise<LifeOSEvent[]> {
    console.log('Creating LifeOS events from tracks:', tracks.length)
    
    if (tracks.length === 0) {
      console.warn('No tracks provided, returning empty events array')
      return []
    }
    
    const events: LifeOSEvent[] = []
    
    // Group tracks by day for daily listening sessions
    const dailySessions = new Map<string, SpotifyTrack[]>()
    
    tracks.forEach(track => {
      const dateKey = track.playedAt.toISOString().split('T')[0]
      if (!dailySessions.has(dateKey)) {
        dailySessions.set(dateKey, [])
      }
      dailySessions.get(dateKey)!.push(track)
    })

    console.log('Daily sessions created:', dailySessions.size)

    // Create events for each day
    for (const [date, dayTracks] of dailySessions) {
      if (dayTracks.length === 0) continue

      const totalDuration = dayTracks.reduce((sum, track) => sum + track.duration, 0)
      const uniqueArtists = new Set(dayTracks.map(track => track.artist))
      
      const event: LifeOSEvent = {
        id: `spotify-${date}`,
        uri: `lifeos://${date}/spotify/music-session-${date}`,
        protocol_version: '1.0.0',
        source: 'spotify',
        type: 'entertainment',
        title: `Music Listening Session - ${date}`,
        metadata: {
          tracksCount: dayTracks.length,
          totalDuration: totalDuration,
          uniqueArtists: uniqueArtists.size,
          topTrack: dayTracks[0].name,
          topArtist: dayTracks[0].artist,
          description: `Listened to ${dayTracks.length} tracks from ${uniqueArtists.size} artists for ${Math.round(totalDuration / 60000)} minutes`,
          category: 'music',
          startTime: new Date(date).toISOString(),
          endTime: new Date(date).toISOString(),
          location: 'Spotify'
        },
        tags: ['spotify', 'music', 'listening'],
        timestamp: new Date(date).toISOString(),
        duration_minutes: Math.round(totalDuration / 60000),
        location: 'Spotify',
        user_id: 'current-user', // Would come from auth context
        related_events: [] // No related events for now
      }

      console.log('Created event:', event.title, 'with', dayTracks.length, 'tracks')
      events.push(event)
    }

    console.log('Total events created:', events.length)
    return events
  }

  // Utility Methods
  private isTokenValid(): boolean {
    return this.credentials !== null && !this.isTokenExpired()
  }

  private isTokenExpired(): boolean {
    return this.credentials === null || Date.now() >= this.credentials.expiresAt
  }

  private generateState(): string {
    const state = Math.random().toString(36).substring(2, 15)
    localStorage.setItem('spotify-oauth-state', state)
    return state
  }

  private getStoredState(): string {
    return localStorage.getItem('spotify-oauth-state') || ''
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    if (!this.validateOAuthSettings()) {
      throw new Error('Missing OAuth settings for token exchange')
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.customSettings.clientId}:${this.customSettings.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.customSettings.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  private saveCredentials(): void {
    if (this.credentials) {
      localStorage.setItem('spotify-credentials', JSON.stringify(this.credentials))
    }
  }

  private loadCredentials(): void {
    try {
      const stored = localStorage.getItem('spotify-credentials')
      if (stored) {
        this.credentials = JSON.parse(stored)
        this.isAuthenticated = this.isTokenValid()
      }
    } catch (error) {
      console.warn('Failed to load Spotify credentials:', error)
    }
  }

  // Event Handlers
  async onEventCreated?(event: LifeOSEvent): Promise<void> {
    console.log(`Spotify plugin received event: ${event.title}`)
  }

  async onEventUpdated?(event: LifeOSEvent): Promise<void> {
    console.log(`Spotify plugin updated event: ${event.title}`)
  }

  async onEventDeleted?(eventId: string): Promise<void> {
    console.log(`Spotify plugin deleted event: ${eventId}`)
  }
}
