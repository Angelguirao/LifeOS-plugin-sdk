# LifeOS Plugin SDK

A unified, open-source plugin system for the LifeOS ecosystem that works seamlessly across **LifeOS Core** (local) and **LifeOS Premium** (cloud).

## 🎯 **What is the LifeOS Plugin SDK?**

The LifeOS Plugin SDK is a standardized way to extend and integrate with the LifeOS ecosystem. It provides:

- **Unified Interface**: Same plugin works in Core AND Premium
- **Cross-Platform**: Plugins automatically adapt to local vs cloud environments
- **Open Source**: MIT licensed, community-driven development
- **Extensible**: Easy to create new plugins and integrations

## 🚀 **Quick Start**

### **Installation**

```bash
npm install @lifeos/plugin-sdk
```

### **Basic Plugin Example**

```typescript
import { BaseLifeOSPlugin, PluginCapability } from '@lifeos/plugin-sdk'

export class MyPlugin extends BaseLifeOSPlugin {
  id = 'my-plugin'
  name = 'My Awesome Plugin'
  version = '1.0.0'
  description = 'A sample plugin for LifeOS'
  author = 'Your Name'
  
  capabilities: PluginCapability[] = [
    {
      type: 'import',
      description: 'Import data from external source',
      configurable: true
    }
  ]

  async initialize(): Promise<void> {
    // Your initialization logic here
    console.log('My plugin is ready!')
  }

  async onEventCreated(event: any): Promise<void> {
    // Handle new events
    console.log('New event:', event.title)
  }
}
```

### **Using in LifeOS Core (Local)**

```typescript
import { LifeOSPluginManager } from '@lifeos/plugin-sdk'
import { MyPlugin } from './my-plugin'

// Create plugin manager for Core
const pluginManager = new LifeOSPluginManager('core')

// Register and load your plugin
const myPlugin = new MyPlugin()
pluginManager.registry.register(myPlugin)
await pluginManager.loadPlugin('my-plugin')
```

### **Using in LifeOS Premium (Cloud)**

```typescript
import { LifeOSPluginManager } from '@lifeos/plugin-sdk'
import { MyPlugin } from './my-plugin'

// Create plugin manager for Premium
const pluginManager = new LifeOSPluginManager('premium')

// Same plugin, same code!
const myPlugin = new MyPlugin()
pluginManager.registry.register(myPlugin)
await pluginManager.loadPlugin('my-plugin')
```

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LifeOS Core   │    │  Plugin SDK     │    │ LifeOS Premium  │
│   (Local)       │◄──►│  (Shared)       │◄──►│  (Cloud)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Local Storage  │    │  Plugin Logic   │    │  Cloud Storage  │
│  (File System)  │    │  (Same Code)    │    │  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔌 **Built-in Plugins**

### **Obsidian Plugin**
```typescript
import { ObsidianPlugin } from '@lifeos/plugin-sdk'

const obsidianPlugin = new ObsidianPlugin()
// Automatically works in both Core and Premium
```

**Features:**
- Bidirectional sync with Obsidian vaults
- Import notes as LifeOS events
- Export LifeOS data to Obsidian
- Automatic file watching

### **Calendar Plugin** (Coming Soon)
```typescript
import { CalendarPlugin } from '@lifeos/plugin-sdk'

const calendarPlugin = new CalendarPlugin({
  provider: 'google', // or 'outlook', 'apple'
  credentials: { /* your OAuth tokens */ }
})
```

## 🛠️ **Creating Custom Plugins**

### **1. Extend BaseLifeOSPlugin**

```typescript
import { BaseLifeOSPlugin, PluginCapability } from '@lifeos/plugin-sdk'

export class CustomPlugin extends BaseLifeOSPlugin {
  id = 'custom-plugin'
  name = 'Custom Integration'
  version = '1.0.0'
  description = 'Integrates with your favorite service'
  author = 'Your Name'
  
  capabilities: PluginCapability[] = [
    {
      type: 'api',
      description: 'Connects to external API',
      configurable: true
    }
  ]

  async initialize(): Promise<void> {
    // Set up API connections, file watchers, etc.
    await this.setupConnections()
  }

  async onEventCreated(event: any): Promise<void> {
    // Send event to external service
    await this.sendToExternalService(event)
  }

  private async setupConnections() {
    // Your connection logic
  }

  private async sendToExternalService(event: any) {
    // Your API call logic
  }
}
```

### **2. Implement Required Methods**

All plugins must implement:
- `id`, `name`, `version`, `description`, `author`
- `capabilities` array
- `initialize()` method
- `destroy()` method

Optional methods:
- `onEventCreated()`, `onEventUpdated()`, `onEventDeleted()`
- `sync()` for data synchronization

### **3. Platform Detection**

```typescript
export class SmartPlugin extends BaseLifeOSPlugin {
  // ... other properties ...

  async initialize(): Promise<void> {
    if (this.isCompatibleWith('core')) {
      // Use file system APIs
      await this.setupFileWatchers()
    }
    
    if (this.isCompatibleWith('premium')) {
      // Use database APIs
      await this.setupDatabaseConnections()
    }
  }
}
```

## ⚙️ **Configuration & Settings**

### **Plugin Settings**

```typescript
// Get current settings
const settings = await plugin.getSettings()

// Update settings
await plugin.updateSettings({
  enabled: true,
  autoSync: true,
  syncInterval: 15,
  customSettings: {
    apiKey: 'your-api-key',
    endpoint: 'https://api.example.com'
  }
})
```

### **Platform-Specific Settings**

```typescript
// Settings that work on both platforms
{
  enabled: true,
  platform: 'both'
}

// Settings only for Core
{
  enabled: true,
  platform: 'core',
  customSettings: {
    localPath: '/path/to/local/files'
  }
}

// Settings only for Premium
{
  enabled: true,
  platform: 'premium',
  customSettings: {
    cloudEndpoint: 'https://cloud.example.com'
  }
}
```

## 🔄 **Event Handling**

### **Event Lifecycle**

```typescript
export class EventAwarePlugin extends BaseLifeOSPlugin {
  // ... other properties ...

  async onEventCreated(event: any): Promise<void> {
    // Called when a new event is created
    console.log('New event:', event.title)
  }

  async onEventUpdated(event: any): Promise<void> {
    // Called when an event is updated
    console.log('Updated event:', event.title)
  }

  async onEventDeleted(eventId: string): Promise<void> {
    // Called when an event is deleted
    console.log('Deleted event:', eventId)
  }
}
```

### **Event Routing**

```typescript
// The plugin manager automatically routes events to all enabled plugins
await pluginManager.routeEvent(newEvent)

// Your plugin's event handlers will be called automatically
```

## 📊 **Plugin Management**

### **System Status**

```typescript
const status = await pluginManager.getSystemStatus()

console.log(`Total plugins: ${status.totalPlugins}`)
console.log(`Active plugins: ${status.activePlugins}`)
console.log(`System health: ${status.systemHealth}`)
console.log(`Platform: ${status.platform}`)
```

### **Plugin Discovery**

```typescript
// Get all plugins
const allPlugins = pluginManager.registry.getAllPlugins()

// Get plugins by capability
const importPlugins = pluginManager.getPluginsByCapability('import')

// Get plugins compatible with current platform
const compatiblePlugins = pluginManager.getCompatiblePlugins()
```

## 🧪 **Testing Your Plugin**

### **Unit Testing**

```typescript
import { BaseLifeOSPlugin } from '@lifeos/plugin-sdk'

class TestPlugin extends BaseLifeOSPlugin {
  id = 'test-plugin'
  name = 'Test Plugin'
  version = '1.0.0'
  description = 'For testing purposes'
  author = 'Tester'
  capabilities = []
}

describe('TestPlugin', () => {
  let plugin: TestPlugin

  beforeEach(() => {
    plugin = new TestPlugin()
  })

  it('should initialize correctly', async () => {
    await expect(plugin.initialize()).resolves.not.toThrow()
  })
})
```

### **Integration Testing**

```typescript
import { LifeOSPluginManager } from '@lifeos/plugin-sdk'

describe('Plugin Integration', () => {
  let pluginManager: LifeOSPluginManager

  beforeEach(() => {
    pluginManager = new LifeOSPluginManager('core')
  })

  it('should register and load plugins', async () => {
    const plugin = new TestPlugin()
    pluginManager.registry.register(plugin)
    
    await pluginManager.loadPlugin('test-plugin')
    
    expect(pluginManager.registry.hasPlugin('test-plugin')).toBe(true)
  })
})
```

## 🚀 **Deployment**

### **Publishing to npm**

```bash
# Build the SDK
npm run build

# Publish to npm
npm publish
```

### **Using in Your Projects**

```bash
# In LifeOS Core
npm install @lifeos/plugin-sdk

# In LifeOS Premium  
npm install @lifeos/plugin-sdk

# In third-party plugins
npm install @lifeos/plugin-sdk
```

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests**
5. **Submit a pull request**

### **Development Setup**

```bash
git clone https://github.com/lifeos/plugin-sdk.git
cd plugin-sdk
npm install
npm run dev
```

## 📚 **API Reference**

### **Core Classes**

- `BaseLifeOSPlugin` - Abstract base class for all plugins
- `LifeOSPluginManager` - Manages plugin lifecycle and operations
- `LifeOSPluginRegistry` - Handles plugin registration and discovery

### **Interfaces**

- `LifeOSPlugin` - Core plugin interface
- `PluginCapability` - Defines plugin capabilities
- `PluginSettings` - Plugin configuration
- `SyncResult` - Synchronization results
- `SystemStatus` - Overall system health

### **Types**

- `PluginStatus` - Individual plugin status
- `PluginRegistry` - Registry interface
- `PluginManager` - Manager interface

## 🔗 **Related Projects**

- **[LifeOS Protocol](https://github.com/lifeos/protocol)** - Core protocol definitions
- **[LifeOS Core](https://github.com/lifeos/core)** - Local implementation
- **[LifeOS Premium](https://github.com/lifeos/premium)** - Cloud implementation

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [docs.lifeos.dev](https://docs.lifeos.dev)
- **Issues**: [GitHub Issues](https://github.com/lifeos/plugin-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lifeos/plugin-sdk/discussions)
- **Discord**: [LifeOS Community](https://discord.gg/lifeos)

---

**Built with ❤️ by the LifeOS Community** 