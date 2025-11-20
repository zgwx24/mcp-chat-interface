import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 生产环境建议设置最大连接数，防止撑爆数据库
  max: 20, 
  idleTimeoutMillis: 30000,
});

// Initialize Drizzle with the connection pool and schema
export const db = drizzle(pool, { schema }); 