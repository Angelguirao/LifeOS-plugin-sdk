# 🚀 LifeOS Plugin SDK v2.0.0

A comprehensive, enterprise-grade plugin system for LifeOS with stable contracts, version compatibility, and capability-based architecture.

## ✨ Features

### 🎯 **Stable Plugin Contracts**
- **Never-breaking interfaces** - Core plugin contract remains stable between major versions
- **Backward compatibility** - Plugins written for v1.0.0 work with v2.0.0+
- **Lifecycle management** - Consistent plugin initialization, operation, and cleanup

### 🔒 **Version Compatibility System**
- **Semantic version checking** - Supports ranges like `>=1.0.0`, `^1.2.3`, `~1.2.3`
- **Automatic validation** - Plugins are checked for compatibility before registration
- **Upgrade recommendations** - Clear guidance when compatibility issues arise
- **Dependency management** - Ensures all required capabilities are available

### ⚡ **Capability-Based Architecture**
- **Declarative capabilities** - Plugins declare what they can do
- **Automatic discovery** - System automatically finds plugins for specific needs
- **Dependency validation** - Ensures capability dependencies are met
- **Performance monitoring** - Track capability usage and health

### 🚀 **Performance & Monitoring**
- **Auto-sync** - Configurable synchronization intervals
- **Memory tracking** - Monitor plugin resource usage
- **API latency** - Track external service performance
- **Error tracking** - Comprehensive error monitoring and reporting
- **Health metrics** - Real-time system health status

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LifeOS Core                              │
├─────────────────────────────────────────────────────────────┤
│                 Plugin Manager                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Registry  │  │   Router    │  │   Monitor          │ │
│  │             │  │             │  │                     │ │
│  │ • Register  │  │ • Events    │  │ • Performance      │ │
│  │ • Discover  │  │ • Capabilities│  │ • Health          │ │
│  │ • Validate  │  │ • Routing   │  │ • Metrics          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Plugin Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Spotify   │  │   Obsidian  │  │   Custom           │ │
│  │   Plugin    │  │   Plugin    │  │   Plugin           │ │
│  │             │  │             │  │                     │ │
│  │ • Music     │  │ • Notes     │  │ • Your Domain      │ │
│  │ • Mood      │  │ • Knowledge │  │ • Your Logic       │ │
│  │ • Timeline  │  │ • Sync      │  │ • Your Integration │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎵 Built-in Plugins

### Spotify LifeOS Plugin
The ultimate music-life integration plugin that demonstrates the full power of the SDK:

- **🎵 Music Tracking** - Real-time listening habit monitoring
- **🧠 Mood Analysis** - AI-powered music-mood correlation
- **📝 Playlist Creation** - Context-aware playlist generation
- **⚡ Real-time Sync** - Live synchronization with Spotify
- **🎧 Audio Analysis** - Deep audio feature analysis
- **🤖 Smart Recommendations** - Life-context-aware suggestions
- **📅 Timeline Integration** - Seamless LifeOS timeline integration
- **🔗 Event Correlation** - Correlate music with life events

## 🚀 Quick Start

### 1. Install the SDK

```bash
npm install @lifeos/plugin-sdk
```

### 2. Create a Plugin

```typescript
import { LifeOSPlugin, PluginCapability } from '@lifeos/plugin-sdk'

export class MyAwesomePlugin implements LifeOSPlugin {
  // Plugin identification
  id = 'my-awesome-plugin'
  name = 'My Awesome Plugin'
  version = '1.0.0'
  description = 'A fantastic plugin that does amazing things'
  author = 'Your Name'
  
  // Version compatibility
  requiredLifeOSVersion = '>=1.0.0'
  requiredCapabilities = ['import', 'sync']
  
  // Plugin capabilities
  capabilities: PluginCapability[] = [
    {
      type: 'import',
      description: 'Import data from external sources',
      configurable: true
    },
    {
      type: 'sync',
      description: 'Synchronize data with external services',
      configurable: true
    }
  ]

  // Core methods
  async initialize(): Promise<void> {
    console.log('My plugin is initializing...')
  }

  async destroy(): Promise<void> {
    console.log('My plugin is cleaning up...')
  }

  async sync(): Promise<SyncResult> {
    return {
      success: true,
      eventsImported: 10,
      eventsExported: 0,
      lastSync: new Date()
    }
  }

  async getStatus(): Promise<PluginStatus> {
    return {
      pluginId: this.id,
      name: this.name,
      version: this.version,
      status: 'active',
      errorCount: 0,
      capabilities: this.capabilities.map(c => c.type),
      health: { uptime: Date.now() }
    }
  }

  async getSettings(): Promise<PluginSettings> {
    return {
      enabled: true,
      autoSync: true,
      syncInterval: 5,
      platform: 'premium'
    }
  }

  async updateSettings(settings: Partial<PluginSettings>): Promise<void> {
    // Update settings logic
  }
}
```

### 3. Use the Plugin Manager

```typescript
import { PluginManager } from '@lifeos/plugin-sdk'
import { MyAwesomePlugin } from './my-awesome-plugin'

// Create plugin manager
const manager = new PluginManager('premium')

// Create and register plugin
const plugin = new MyAwesomePlugin()
manager.registry.register(plugin)

// Load and enable plugin
await manager.loadPlugin(plugin.id)
await manager.enablePlugin(plugin.id)

// Get system status
const status = await manager.getSystemStatus()
console.log('System health:', status.systemHealth)

// Perform system sync
const results = await manager.performSystemSync()
console.log('Sync results:', results)
```

## 🔧 Advanced Usage

### Capability Management

```typescript
// Get plugins by capability
const musicPlugins = manager.registry.getPluginsByCapability('music-tracking')
const syncPlugins = manager.registry.getPluginsByCapability('sync')

// Get capability status
const capabilityStatus = await manager.getCapabilityStatus('music-tracking')
console.log(`${capabilityStatus.activeProviders} active music tracking providers`)

// Enable/disable specific capabilities
await manager.enableCapability(pluginId, 'mood-analysis')
await manager.disableCapability(pluginId, 'real-time-sync')
```

### Version Compatibility

```typescript
import { VersionChecker } from '@lifeos/plugin-sdk'

// Check plugin compatibility
const compatibility = VersionChecker.checkCompatibility(plugin, '1.5.0')

if (compatibility.compatible) {
  console.log('Plugin is compatible!')
} else {
  console.log('Compatibility issues:', compatibility.warnings)
  console.log('Recommendations:', compatibility.recommendations)
}
```

### Event Handling

```typescript
// Your plugin can handle LifeOS events
async onEventCreated(event: LifeOSEvent): Promise<void> {
  if (event.type === 'mood-change') {
    // React to mood changes
    await this.correlateWithMusic(event)
  }
}

async onEventUpdated(event: LifeOSEvent): Promise<void> {
  // Handle event updates
}

async onEventDeleted(eventId: string): Promise<void> {
  // Handle event deletions
}
```

## 📊 Available Capabilities

### Core Capabilities
- **`import`** - Import data from external sources
- **`export`** - Export data to external destinations
- **`sync`** - Synchronize data with external services
- **`oauth`** - OAuth authentication flows
- **`webhook`** - Webhook-based integrations
- **`api`** - API-based integrations
- **`custom`** - Custom plugin-specific capabilities

### Music Capabilities
- **`music-tracking`** - Track listening habits and preferences
- **`mood-analysis`** - Analyze music mood and emotions
- **`playlist-creation`** - Create intelligent playlists
- **`real-time-sync`** - Real-time synchronization
- **`offline-caching`** - Offline data access
- **`audio-analysis`** - Deep audio feature analysis
- **`recommendations`** - AI-powered recommendations

### LifeOS Capabilities
- **`life-timeline`** - Integrate with life timeline
- **`event-correlation`** - Correlate events across sources
- **`mood-tracking`** - Track and analyze mood patterns
- **`focus-tracking`** - Monitor focus and productivity
- **`social-integration`** - Social media integration
- **`data-visualization`** - Create charts and insights

## ⚙️ Configuration

### Plugin System Configuration

```typescript
import { PLUGIN_SYSTEM_CONFIG } from '@lifeos/plugin-sdk'

console.log('Auto-sync interval:', PLUGIN_SYSTEM_CONFIG.autoSyncInterval)
console.log('Max concurrent syncs:', PLUGIN_SYSTEM_CONFIG.maxConcurrentSyncs)
console.log('Retry attempts:', PLUGIN_SYSTEM_CONFIG.retryAttempts)
```

### Default Plugin Settings

```typescript
import { DEFAULT_PLUGIN_SETTINGS } from '@lifeos/plugin-sdk'

const settings = {
  ...DEFAULT_PLUGIN_SETTINGS,
  customSettings: {
    myCustomOption: true
  }
}
```

## 🔍 Monitoring & Debugging

### System Status

```typescript
const status = await manager.getSystemStatus()

console.log('System health:', status.systemHealth)
console.log('Active plugins:', status.activePlugins)
console.log('Total plugins:', status.totalPlugins)
console.log('Last sync:', status.lastSync)

// Plugin-specific status
status.pluginStatuses.forEach(plugin => {
  console.log(`${plugin.name}: ${plugin.status}`)
  console.log('  Uptime:', plugin.health.uptime)
  console.log('  Memory:', plugin.health.memoryUsage)
  console.log('  Latency:', plugin.health.apiLatency)
})
```

### Performance Metrics

```typescript
const results = await manager.performSystemSync()

results.forEach(result => {
  if (result.performance) {
    console.log('Sync duration:', result.performance.duration)
    console.log('Memory usage:', result.performance.memoryUsage)
    console.log('API calls:', result.performance.apiCalls)
  }
})
```

## 🧪 Testing

### Unit Testing

```typescript
import { PluginManager } from '@lifeos/plugin-sdk'

describe('My Plugin', () => {
  let manager: PluginManager
  let plugin: MyAwesomePlugin

  beforeEach(() => {
    manager = new PluginManager('test')
    plugin = new MyAwesomePlugin()
  })

  it('should register successfully', () => {
    expect(() => manager.registry.register(plugin)).not.toThrow()
  })

  it('should initialize without errors', async () => {
    await expect(plugin.initialize()).resolves.not.toThrow()
  })

  it('should sync successfully', async () => {
    const result = await plugin.sync()
    expect(result.success).toBe(true)
  })
})
```

### Integration Testing

```typescript
describe('Plugin Integration', () => {
  it('should handle events correctly', async () => {
    const event: LifeOSEvent = {
      id: 'test-event',
      type: 'test',
      timestamp: new Date().toISOString(),
      metadata: {},
      tags: [],
      source: 'test'
    }

    await plugin.onEventCreated?.(event)
    // Assert expected behavior
  })
})
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**
   ```bash
   LIFEOS_VERSION=1.5.0
   PLUGIN_AUTO_SYNC=true
   PLUGIN_SYNC_INTERVAL=5
   ```

2. **Health Checks**
   ```typescript
   // Monitor plugin health
   setInterval(async () => {
     const status = await manager.getSystemStatus()
     if (status.systemHealth === 'error') {
       // Alert operations team
       notifyOperations(status)
     }
   }, 60000) // Check every minute
   ```

3. **Error Handling**
   ```typescript
   try {
     await manager.performSystemSync()
   } catch (error) {
     console.error('Sync failed:', error)
     // Implement retry logic
     await retryWithBackoff(() => manager.performSystemSync())
   }
   ```

## 🤝 Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/lifeos-plugin-sdk.git

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run linting
npm run lint
```

### Plugin Development Guidelines

1. **Follow the Interface** - Always implement the `LifeOSPlugin` interface completely
2. **Version Compatibility** - Use semantic versioning and test compatibility
3. **Capability Declaration** - Declare all capabilities your plugin provides
4. **Error Handling** - Implement robust error handling and recovery
5. **Performance** - Monitor resource usage and optimize performance
6. **Testing** - Write comprehensive tests for all functionality
7. **Documentation** - Document your plugin's capabilities and usage

### Creating a Pull Request

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## 📚 API Reference

### Core Interfaces

- [`LifeOSPlugin`](./interfaces/index.ts#L15) - Main plugin interface
- [`PluginCapability`](./interfaces/index.ts#L45) - Plugin capability definition
- [`PluginSettings`](./interfaces/index.ts#L55) - Plugin configuration
- [`SyncResult`](./interfaces/index.ts#L65) - Synchronization result
- [`PluginStatus`](./interfaces/index.ts#L75) - Plugin status information

### Core Classes

- [`PluginManager`](./core/plugin-manager.ts) - Plugin lifecycle management
- [`PluginRegistry`](./core/plugin-registry.ts) - Plugin registration and discovery
- [`VersionChecker`](./utils/version-checker.ts) - Version compatibility validation

### Utilities

- [`EventRouter`](./utils/event-routing.ts) - Event routing utilities
- [`PluginHelpers`](./utils/plugin-helpers.ts) - Common plugin helper functions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.lifeos.dev](https://docs.lifeos.dev)
- **Issues**: [GitHub Issues](https://github.com/your-org/lifeos-plugin-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/lifeos-plugin-sdk/discussions)
- **Email**: support@lifeos.dev

## 🎯 Roadmap

### v2.1.0 (Q2 2024)
- [ ] Plugin marketplace integration
- [ ] Advanced analytics and insights
- [ ] Machine learning capabilities
- [ ] Multi-tenant support

### v2.2.0 (Q3 2024)
- [ ] Plugin dependency resolution
- [ ] Advanced security features
- [ ] Performance optimization
- [ ] Developer tools

### v3.0.0 (Q4 2024)
- [ ] Plugin ecosystem
- [ ] Advanced AI integration
- [ ] Enterprise features
- [ ] Cloud deployment

---

**Built with ❤️ by the LifeOS Team**

*Empowering developers to build the future of personal data management* 