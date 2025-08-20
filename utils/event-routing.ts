/**
 * LifeOS Plugin SDK - Event Routing Utilities
 * 
 * Utilities for routing events between plugins and the LifeOS system.
 */

import { LifeOSPlugin, PluginCapability, PluginSettings } from '../interfaces';

/**
 * Route an event to plugins with specific capabilities
 */
export function routeEventToCapability(
  event: any,
  plugins: LifeOSPlugin[],
  capability: PluginCapability
): Promise<any[]> {
  const capablePlugins = plugins.filter(plugin => 
    plugin.capabilities.some(cap => cap.type === capability.type)
  );
  
  return Promise.all(
    capablePlugins.map(async plugin => {
      try {
        // Check if plugin has event handlers
        if (plugin.onEventCreated || plugin.onEventUpdated || plugin.onEventDeleted) {
          // Route based on event type (you can extend this logic)
          if (event.type === 'created' && plugin.onEventCreated) {
            return await plugin.onEventCreated(event);
          } else if (event.type === 'updated' && plugin.onEventUpdated) {
            return await plugin.onEventUpdated(event);
          } else if (event.type === 'deleted' && plugin.onEventDeleted) {
            return await plugin.onEventDeleted(event.id);
          }
        }
        return { pluginId: plugin.id, status: 'no-handler' };
      } catch (error) {
        return {
          pluginId: plugin.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );
}

/**
 * Route an event to all plugins
 */
export function routeEventToAll(
  event: any,
  plugins: LifeOSPlugin[]
): Promise<any[]> {
  return Promise.all(
    plugins.map(async plugin => {
      try {
        // Check if plugin has event handlers
        if (plugin.onEventCreated || plugin.onEventUpdated || plugin.onEventDeleted) {
          // Route based on event type
          if (event.type === 'created' && plugin.onEventCreated) {
            return await plugin.onEventCreated(event);
          } else if (event.type === 'updated' && plugin.onEventUpdated) {
            return await plugin.onEventUpdated(event);
          } else if (event.type === 'deleted' && plugin.onEventDeleted) {
            return await plugin.onEventDeleted(event.id);
          }
        }
        return { pluginId: plugin.id, status: 'no-handler' };
      } catch (error) {
        return {
          pluginId: plugin.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );
}

/**
 * Route an event to a specific plugin
 */
export async function routeEventToPlugin(
  event: any,
  plugin: LifeOSPlugin
): Promise<any> {
  // Check if plugin has event handlers
  if (!plugin.onEventCreated && !plugin.onEventUpdated && !plugin.onEventDeleted) {
    throw new Error(`Plugin ${plugin.id} does not support event handling`);
  }
  
  try {
    // Route based on event type
    if (event.type === 'created' && plugin.onEventCreated) {
      return await plugin.onEventCreated(event);
    } else if (event.type === 'updated' && plugin.onEventUpdated) {
      return await plugin.onEventUpdated(event);
    } else if (event.type === 'deleted' && plugin.onEventDeleted) {
      return await plugin.onEventDeleted(event.id);
    } else {
      throw new Error(`Event type '${event.type}' not supported by plugin ${plugin.id}`);
    }
  } catch (error) {
    throw new Error(`Plugin ${plugin.id} failed to handle event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Broadcast an event to multiple plugins
 */
export function broadcastEvent(
  event: any,
  plugins: LifeOSPlugin[],
  filter?: (plugin: LifeOSPlugin) => boolean
): Promise<any[]> {
  const targetPlugins = filter ? plugins.filter(filter) : plugins;
  
  return Promise.all(
    targetPlugins.map(async plugin => {
      try {
        // Check if plugin has event handlers
        if (plugin.onEventCreated || plugin.onEventUpdated || plugin.onEventDeleted) {
          // Route based on event type
          if (event.type === 'created' && plugin.onEventCreated) {
            return await plugin.onEventCreated(event);
          } else if (event.type === 'updated' && plugin.onEventUpdated) {
            return await plugin.onEventUpdated(event);
          } else if (event.type === 'deleted' && plugin.onEventDeleted) {
            return await plugin.onEventDeleted(event.id);
          }
        }
        return { pluginId: plugin.id, status: 'no-handler' };
      } catch (error) {
        return {
          pluginId: plugin.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );
}

/**
 * Get plugins that support a specific capability
 */
export function getPluginsByCapability(
  plugins: LifeOSPlugin[],
  capabilityType: string
): LifeOSPlugin[] {
  return plugins.filter(plugin => 
    plugin.capabilities.some(cap => cap.type === capabilityType)
  );
}

/**
 * Check if a plugin supports a specific capability
 */
export function hasCapability(
  plugin: LifeOSPlugin,
  capabilityType: string
): boolean {
  return plugin.capabilities.some(cap => cap.type === capabilityType);
}
