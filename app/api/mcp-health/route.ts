import { NextRequest, NextResponse } from 'next/server';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export async function POST(req: NextRequest) {
  try {
    const { url, headers } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Normalize URL: prepare protocol variants (https first, then http)
    let baseUrl = String(url).trim();
    const urlVariants = baseUrl.match(/^https?:\/\//i)
      ? [baseUrl]  // Already has protocol, use as-is
      : [`https://${baseUrl}`, `http://${baseUrl}`];  // Try https first, then http

    // Convert headers array to object
    const headersObj = headers?.reduce((acc: Record<string, string>, header: { key: string; value: string }) => {
      if (header.key) {
        acc[header.key] = header.value || '';
      }
      return acc;
    }, {}) || {};

    let client: Client | undefined = undefined;
    let lastError: any = null;

    // Try each URL variant
    for (const urlVariant of urlVariants) {
      try {
        const baseUrl = new URL(urlVariant);

        try {
          // First try Streamable HTTP transport
          client = new Client({
            name: 'streamable-http-client',
            version: '1.0.0'
          });

          const transport = new StreamableHTTPClientTransport(baseUrl, {
            requestInit: {
              headers: headersObj,
            },
          });
          await client.connect(transport);
          console.log(`Connected using Streamable HTTP transport to ${urlVariant}`);
        } catch (error) {
          // If that fails, try the older SSE transport
          console.log(`Streamable HTTP connection failed for ${urlVariant}, falling back to SSE transport`);
          client = new Client({
            name: 'sse-client',
            version: '1.0.0'
          });
          const sseTransport = new SSEClientTransport(baseUrl);
          await client.connect(sseTransport);
          console.log(`Connected using SSE transport to ${urlVariant}`);
        }

        // If we got here, we connected successfully
        // Get tools from the connected client
        const tools = await client.listTools();
        console.log('Tools response:', tools);

        // Disconnect after getting tools
        await client.close();

        if (tools && tools.tools) {
          return NextResponse.json({
            ready: true,
            tools: tools.tools.map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema
            }))
          });
        } else {
          return NextResponse.json({ ready: false, error: 'No tools available' }, { status: 503 });
        }
      } catch (err) {
        lastError = err;
        console.warn(`Failed to connect to ${urlVariant}:`, err);
        // Try next variant
        client = undefined;
      }
    }

    // If we got here, all variants failed
    console.error('MCP health check failed (all variants):', lastError);
    const errorMessage = lastError instanceof Error ? lastError.message : 'Unable to connect to MCP server';
    return NextResponse.json({
      ready: false,
      error: errorMessage
    }, { status: 503 });
  } catch (error) {
    console.error('MCP health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      ready: false,
      error: errorMessage
    }, { status: 503 });
  }
} 