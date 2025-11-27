import { experimental_createMCPClient as createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface MCPServerConfig {
  url: string;
  type: 'sse' | 'http';
  headers?: KeyValuePair[];
}

export interface MCPClientManager {
  tools: Record<string, any>;
  clients: any[];
  cleanup: () => Promise<void>;
}

/**
 * Initialize MCP clients for API calls
 * This uses the already running persistent HTTP or SSE servers
 */
export async function initializeMCPClients(
  mcpServers: MCPServerConfig[] = [],
  abortSignal?: AbortSignal
): Promise<MCPClientManager> {
  // Initialize tools
  let tools = {};
  const mcpClients: any[] = [];

  // Process each MCP server configuration
  for (const mcpServer of mcpServers) {
    try {
      // Normalize URL: prepare protocol variants
      let baseUrl = mcpServer.url.trim();
      const urlVariants = baseUrl.match(/^https?:\/\//i) 
        ? [baseUrl]  // Already has protocol, use as-is
        : [`http://${baseUrl}`, `https://${baseUrl}`];  // Try http first, then https

      const headers = mcpServer.headers?.reduce((acc, header) => {
        if (header.key) acc[header.key] = header.value || '';
        return acc;
      }, {} as Record<string, string>);

      let connected = false;
      let lastError: any = null;

      // Try each URL variant
      for (const urlVariant of urlVariants) {
        try {
          const transport = mcpServer.type === 'sse'
            ? {
              type: 'sse' as const,
              url: urlVariant,
              headers,
            }
            : new StreamableHTTPClientTransport(new URL(urlVariant), {
              requestInit: {
                headers,
              },
            });

          const mcpClient = await createMCPClient({ transport });
          mcpClients.push(mcpClient);

          const mcptools = await mcpClient.tools();

          console.log(`MCP tools from ${urlVariant}:`, Object.keys(mcptools));

          // Add MCP tools to tools object
          tools = { ...tools, ...mcptools };
          connected = true;
          break;  // Success, stop trying other variants
        } catch (err) {
          lastError = err;
          console.warn(`Failed to connect to ${urlVariant}:`, err);
          // Continue to next variant
        }
      }

      if (!connected && lastError) {
        throw lastError;
      }
    } catch (error) {
      console.error("Failed to initialize MCP client:", error);
      // Continue with other servers instead of failing the entire request
    }
  }

  // Register cleanup for all clients if an abort signal is provided
  if (abortSignal && mcpClients.length > 0) {
    abortSignal.addEventListener('abort', async () => {
      await cleanupMCPClients(mcpClients);
    });
  }

  return {
    tools,
    clients: mcpClients,
    cleanup: async () => await cleanupMCPClients(mcpClients)
  };
}

/**
 * Clean up MCP clients
 */
async function cleanupMCPClients(clients: any[]): Promise<void> {
  await Promise.all(
    clients.map(async (client) => {
      try {
        await client.disconnect?.();
      } catch (error) {
        console.error("Error during MCP client cleanup:", error);
      }
    })
  );
} 