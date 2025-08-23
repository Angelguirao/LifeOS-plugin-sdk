/**
 * LifeOS Plugin SDK - OAuth Service
 * 
 * Centralized OAuth authentication service for plugins
 */

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  scope: string
  tokenType: string
}

export interface OAuthState {
  pluginId: string
  timestamp: number
  nonce: string
}

export class OAuthService {
  private static instance: OAuthService
  private activeFlows: Map<string, OAuthState> = new Map()
  private tokenStorage: Map<string, OAuthTokens> = new Map()

  private constructor() {
    // Initialize OAuth service
    this.setupMessageListener()
  }

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService()
    }
    return OAuthService.instance
  }

  /**
   * Start OAuth flow for a plugin
   */
  async startOAuthFlow(
    pluginId: string,
    config: OAuthConfig,
    additionalParams?: Record<string, string>
  ): Promise<string> {
    try {
      // Generate OAuth state
      const state = this.generateOAuthState(pluginId)
      
      // Build authorization URL
      const authUrl = new URL(config.authUrl)
      authUrl.searchParams.set('client_id', config.clientId)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('redirect_uri', config.redirectUri)
      authUrl.searchParams.set('scope', config.scopes.join(' '))
      authUrl.searchParams.set('state', state.nonce)
      
      // Add additional parameters
      if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
          authUrl.searchParams.set(key, value)
        })
      }

      // Store active flow
      this.activeFlows.set(pluginId, state)
      
      console.log(`OAuth flow started for plugin ${pluginId}`)
      return authUrl.toString()
    } catch (error) {
      console.error(`Failed to start OAuth flow for plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    pluginId: string,
    code: string,
    state: string,
    config: OAuthConfig
  ): Promise<OAuthTokens> {
    try {
      // Verify state
      const activeState = this.activeFlows.get(pluginId)
      if (!activeState || activeState.nonce !== state) {
        throw new Error('Invalid OAuth state parameter')
      }

      // Check if flow is not expired (5 minutes)
      if (Date.now() - activeState.timestamp > 5 * 60 * 1000) {
        this.activeFlows.delete(pluginId)
        throw new Error('OAuth flow expired')
      }

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code, config)
      
      // Store tokens
      this.tokenStorage.set(pluginId, tokens)
      
      // Clean up active flow
      this.activeFlows.delete(pluginId)
      
      console.log(`OAuth flow completed for plugin ${pluginId}`)
      return tokens
    } catch (error) {
      console.error(`OAuth callback failed for plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    pluginId: string,
    config: OAuthConfig
  ): Promise<OAuthTokens> {
    try {
      const currentTokens = this.tokenStorage.get(pluginId)
      if (!currentTokens?.refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: currentTokens.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const newTokens = await response.json()
      
      // Update stored tokens
      const updatedTokens: OAuthTokens = {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || currentTokens.refreshToken,
        expiresIn: newTokens.expires_in,
        scope: newTokens.scope,
        tokenType: newTokens.token_type
      }
      
      this.tokenStorage.set(pluginId, updatedTokens)
      
      console.log(`Access token refreshed for plugin ${pluginId}`)
      return updatedTokens
    } catch (error) {
      console.error(`Failed to refresh access token for plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Get stored tokens for a plugin
   */
  getTokens(pluginId: string): OAuthTokens | undefined {
    return this.tokenStorage.get(pluginId)
  }

  /**
   * Check if tokens are valid for a plugin
   */
  isTokenValid(pluginId: string): boolean {
    const tokens = this.tokenStorage.get(pluginId)
    if (!tokens) return false
    
    // Check if token is expired (with 5 minute buffer)
    const expiresAt = Date.now() + (tokens.expiresIn * 1000) - (5 * 60 * 1000)
    return Date.now() < expiresAt
  }

  /**
   * Revoke access for a plugin
   */
  async revokeAccess(pluginId: string, config: OAuthConfig): Promise<boolean> {
    try {
      const tokens = this.tokenStorage.get(pluginId)
      if (!tokens?.accessToken) {
        return true // Already revoked
      }

      // Revoke access token
      if (config.tokenUrl.includes('spotify')) {
        // Spotify-specific revocation
        await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokens.refreshToken || ''
          })
        })
      }

      // Remove stored tokens
      this.tokenStorage.delete(pluginId)
      
      console.log(`Access revoked for plugin ${pluginId}`)
      return true
    } catch (error) {
      console.error(`Failed to revoke access for plugin ${pluginId}:`, error)
      return false
    }
  }

  /**
   * Get OAuth configuration for common services
   */
  static getOAuthConfig(service: 'spotify' | 'google' | 'apple'): OAuthConfig {
    const configs = {
      spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID || '',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
        redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/oauth/callback/spotify',
        scopes: ['user-read-recently-played', 'user-top-read', 'user-read-playback-state'],
        authUrl: 'https://accounts.spotify.com/authorize',
        tokenUrl: 'https://accounts.spotify.com/api/token'
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback/google',
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token'
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID || '',
        clientSecret: process.env.APPLE_CLIENT_SECRET || '',
        redirectUri: process.env.APPLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback/apple',
        scopes: ['health.read'],
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token'
      }
    }

    return configs[service]
  }

  // Private methods
  private generateOAuthState(pluginId: string): OAuthState {
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    const state: OAuthState = {
      pluginId,
      timestamp: Date.now(),
      nonce
    }

    return state
  }

  private async exchangeCodeForTokens(code: string, config: OAuthConfig): Promise<OAuthTokens> {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      tokenType: data.token_type
    }
  }

  private setupMessageListener(): void {
    // Listen for OAuth callback messages from popup windows
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'oauth-callback') {
          this.handleOAuthCallback(
            event.data.pluginId,
            event.data.code,
            event.data.state,
            event.data.config
          ).catch(console.error)
        }
      })
    }
  }
}
