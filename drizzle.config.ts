import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });

function getSSLConfig() {
  // 環境変数で証明書が指定されている場合（優先）
  if (process.env.DB_SSL_CA) {
    const certPath = path.isAbsolute(process.env.DB_SSL_CA)
      ? process.env.DB_SSL_CA
      : path.resolve(process.cwd(), process.env.DB_SSL_CA);
    try {
      const caCert = fs.readFileSync(certPath, "utf8");
      return {
        ca: caCert,
        rejectUnauthorized: true,
      };
    } catch {
      return undefined;
    }
  } else if (process.env.DB_SSL_CA_CONTENT) {
    return {
      ca: process.env.DB_SSL_CA_CONTENT,
      rejectUnauthorized: true,
    };
  }

  // certsフォルダから証明書を自動検出
  const certsDir = path.join(process.cwd(), "certs");
  if (fs.existsSync(certsDir)) {
    const certFiles = fs.readdirSync(certsDir).filter(file => file.endsWith(".pem"));
    if (certFiles.length > 0) {
      const certPath = path.join(certsDir, certFiles[0]);
      try {
        const caCert = fs.readFileSync(certPath, "utf8");
        return {
          ca: caCert,
          rejectUnauthorized: true,
        };
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

function parseConnectionString(url: string) {
  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 5432,
      database: dbUrl.pathname.slice(1),
      user: dbUrl.username,
      password: dbUrl.password,
    };
  } catch {
    return null;
  }
}

const sslConfig = getSSLConfig();
const databaseUrl = process.env.DATABASE_URL!;
const connectionParams = parseConnectionString(databaseUrl);

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: connectionParams && sslConfig
    ? {
        ...connectionParams,
        ssl: sslConfig,
      }
    : {
        url: databaseUrl, //aws　rdsならsslが必要　neonなら不要かも
      },
} satisfies Config; 