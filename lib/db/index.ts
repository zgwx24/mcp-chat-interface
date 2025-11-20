import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";
import fs from "fs";
import "server-only"; // 🔥 保护措施：只要这段代码被 Client 组件引用，构建就会报错，确保绝对安全

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

  // 4. 显式配置 SSL
  ssl: {
    rejectUnauthorized: true,
    // 这里必须使用 readFileSync，因为建立数据库连接是同步初始化过程
    ca: fs.readFileSync("C:/mcp/mcp-chat-interface/certs/ap-northeast-1-bundle.pem", "utf-8"),
  },
};

// 调试日志 (切记不要打印密码!)
console.log(`DB Connecting to: ${poolConfig.host}:${poolConfig.port}, SSL: Enabled`);

// Initialize the connection pool
const pool = new Pool(poolConfig);

// Initialize Drizzle
export const db = drizzle(pool, { schema });