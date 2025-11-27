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

    let client: Client | undefined = undefined;
    //const baseUrl = new URL(url);
    let validUrlString = url;
    // 检查是否以 http:// 或 https:// 开头，如果没有则默认加上 http://
    if (!validUrlString.startsWith('http://') && !validUrlString.startsWith('https://')) {
      validUrlString = `http://${validUrlString}`;
      }

    const baseUrl = new URL(validUrlString);

    // Convert headers array to object
    const headersObj = headers?.reduce((acc: Record<string, string>, header: { key: string; value: string }) => {
      if (header.key) {
        acc[header.key] = header.value || '';
      }
      return acc;
    }, {}) || {};

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
      console.log("Connected using Streamable HTTP transport");
    } catch (error) {
      // If that fails with a 4xx error, try the older SSE transport
      // Note: SSE transport doesn't support custom headers in the same way
      console.log("Streamable HTTP connection failed, falling back to SSE transport");
      client = new Client({
        name: 'sse-client',
        version: '1.0.0'
      });
      const sseTransport = new SSEClientTransport(baseUrl);
      await client.connect(sseTransport);
      console.log("Connected using SSE transport");
    }

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
  } catch (error) {
    console.error('MCP health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      ready: false,
      error: errorMessage
    }, { status: 503 });
  }
} 