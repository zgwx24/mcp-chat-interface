import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";
import fs from "fs";
import path from "path";
import "server-only"; // Safety: if this file is imported by a Client component the build will fail

// 1. 确保环境变量存在
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// 2. 手动解析 URL (使用 Node.js 原生 URL 对象)
const dbUrl = new URL(process.env.DATABASE_URL);

// 3. 构建配置对象
const poolConfig: PoolConfig = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 5432, // 默认端口保护
  database: dbUrl.pathname.slice(1), // 去掉路径前面的 "/"
  
  // 生产环境连接池设置
  max: 20,
  idleTimeoutMillis: 30000,

  // 4. SSL 在后面动态设置（基于相对 certs 文件夹或环境变量）
};

// Dynamically detect certificate file (prefer any .pem inside the local `certs` directory)
const certsDir = path.resolve(process.cwd(), "certs");
let certPath: string | null = null;
let sslConfig: PoolConfig["ssl"] | undefined = undefined;

if (fs.existsSync(certsDir) && fs.statSync(certsDir).isDirectory()) {
  try {
    const pemFiles = fs.readdirSync(certsDir).filter((f) => f.toLowerCase().endsWith(".pem"));
    if (pemFiles.length > 0) {
      certPath = path.join(certsDir, pemFiles[0]); // pick the first .pem file
    }
  } catch (err) {
    console.warn(`DB: Failed to read certs directory ${certsDir}:`, err);
  }
}

if (certPath && fs.existsSync(certPath)) {
  try {
    const ca = fs.readFileSync(certPath, "utf-8");
    sslConfig = { rejectUnauthorized: true, ca } as any;
    console.log(`DB: Using CA cert from ${certPath}`);
  } catch (err) {
    console.warn(`DB: Failed to read CA cert at ${certPath}:`, err);
  }
} else if (process.env.PG_SSL === "true") {
  // No CA cert found but SSL was requested via PG_SSL; enable SSL without verifying the CA.
  // This is acceptable for development, but in production provide a real CA bundle.
  sslConfig = { rejectUnauthorized: false } as any;
  console.warn("DB: PG_SSL=true but no CA cert found; using insecure SSL (rejectUnauthorized=false)");
} else {
  console.log("DB: No CA cert found and PG_SSL not enabled; connecting without SSL");
}

if (sslConfig) {
  // assign ssl configuration to poolConfig (cast to any to avoid strict typing issues)
  (poolConfig as any).ssl = sslConfig;
}

// 调试日志 (切记不要打印密码!)
console.log(`DB Connecting to: ${poolConfig.host}:${poolConfig.port}, SSL: ${sslConfig ? 'Enabled' : 'Disabled'}`);

// Initialize the connection pool
const pool = new Pool(poolConfig);

// Initialize Drizzle
export const db = drizzle(pool, { schema });