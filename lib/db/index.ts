import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";
import * as schema from "./schema";
import * as fs from "fs";
import * as path from "path";

function getPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  const config: PoolConfig = {
    connectionString,
  };

  // certsフォルダから証明書を自動検出
  const certsDir = path.join(process.cwd(), "certs");
  if (fs.existsSync(certsDir)) {
    const certFiles = fs.readdirSync(certsDir).filter(file => file.endsWith(".pem"));
    if (certFiles.length > 0) {
      const certPath = path.join(certsDir, certFiles[0]);
      try {
        const caCert = fs.readFileSync(certPath, "utf8");
        config.ssl = {
          ca: caCert,
          rejectUnauthorized: true,
        };
      } catch (error) {
        // 証明書の読み込みに失敗しても接続は続行
      }
    }
  }

  // 環境変数で証明書が指定されている場合（優先）
  if (process.env.DB_SSL_CA) {
    const certPath = path.isAbsolute(process.env.DB_SSL_CA)
      ? process.env.DB_SSL_CA
      : path.resolve(process.cwd(), process.env.DB_SSL_CA);
    try {
      const caCert = fs.readFileSync(certPath, "utf8");
      config.ssl = {
        ca: caCert,
        rejectUnauthorized: true,
      };
    } catch (error) {
      // 証明書の読み込みに失敗しても接続は続行
    }
  } else if (process.env.DB_SSL_CA_CONTENT) {
    config.ssl = {
      ca: process.env.DB_SSL_CA_CONTENT,
      rejectUnauthorized: true,
    };
  }

  return config;
}

// Initialize the connection pool
const pool = new Pool(getPoolConfig());

// Initialize Drizzle with the connection pool and schema
export const db = drizzle(pool, { schema }); 