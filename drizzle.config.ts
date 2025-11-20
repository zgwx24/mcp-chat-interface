// import type { Config } from "drizzle-kit";
// import dotenv from "dotenv";
// import fs from "fs";
// import * as path from "path"; // 1. 确保引入了 path
// // Load environment variables
// dotenv.config({ path: ".env.local" });


// // 调试：打印一下看是否读到了 URL，如果打印出 undefined，说明路径不对或者文件没保存
// // 运行成功后记得删掉这行


// const caLocation = fs.readFileSync(
//         path.join(process.cwd(), "certs", "ap-northeast-1-bundle.pem"), 
//         "utf8");
// console.log("what is ca:", caLocation);
// export default {
//   schema: "./lib/db/schema.ts",
//   out: "./drizzle",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//     // 2. SSL 配置部分
//     ssl: {
//       rejectUnauthorized: true, // 这就等同于“开启 SSL 验证”
//       ca: caLocation,
//     },

//   },
// } satisfies Config; 

// import type { Config } from "drizzle-kit";
// import dotenv from "dotenv";
// import * as fs from "fs";
// import * as path from "path";

// // Load environment variables
// dotenv.config({ path: ".env.local" });

// function getSSLConfig() {
//   // 環境変数で証明書が指定されている場合（優先）
//   if (process.env.DB_SSL_CA) {
//     const certPath = path.isAbsolute(process.env.DB_SSL_CA)
//       ? process.env.DB_SSL_CA
//       : path.resolve(process.cwd(), process.env.DB_SSL_CA);
//     try {
//       const caCert = fs.readFileSync(certPath, "utf8");
//       return {
//         ca: caCert,
//         rejectUnauthorized: true,
//       };
//     } catch {
//       return undefined;
//     }
//   } else if (process.env.DB_SSL_CA_CONTENT) {
//     return {
//       ca: process.env.DB_SSL_CA_CONTENT,
//       rejectUnauthorized: true,
//     };
//   }

//   // certsフォルダから証明書を自動検出
//   const certsDir = path.join(process.cwd(), "certs");
//   if (fs.existsSync(certsDir)) {
//     const certFiles = fs.readdirSync(certsDir).filter(file => file.endsWith(".pem"));
//     if (certFiles.length > 0) {
//       const certPath = path.join(certsDir, certFiles[0]);
//       try {
//         const caCert = fs.readFileSync(certPath, "utf8");
//         return {
//           ca: caCert,
//           rejectUnauthorized: true,
//         };
//       } catch {
//         return undefined;
//       }
//     }
//   }

//   return undefined;
// }

// function parseConnectionString(url: string) {
//   try {
//     const dbUrl = new URL(url);
//     return {
//       host: dbUrl.hostname,
//       port: parseInt(dbUrl.port) || 5432,
//       database: dbUrl.pathname.slice(1),
//       user: dbUrl.username,
//       password: dbUrl.password,
//     };
//   } catch {
//     return null;
//   }
// }

// const sslConfig = getSSLConfig();
// const databaseUrl = process.env.DATABASE_URL!;
// const connectionParams = parseConnectionString(databaseUrl);

// export default {
//   schema: "./lib/db/schema.ts",
//   out: "./drizzle",
//   dialect: "postgresql",
//   dbCredentials: connectionParams && sslConfig
//     ? {
//         ...connectionParams,
//         ssl: sslConfig,
//       }
//     : {
//         url: databaseUrl,
//       },
// } satisfies Config; 




import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 1. 加载环境变量
dotenv.config({ path: ".env.local" });

// 检查环境变量是否存在
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env.local");
}

// 2. 解析 URL 字符串
const connectionString = process.env.DATABASE_URL;
const urlObj = new URL(connectionString);

// 3. 读取证书文件
const caLocation = fs.readFileSync(
  path.join(process.cwd(), "certs", "ap-northeast-1-bundle.pem"),
  "utf8"
);

// // 调试打印 (确认解析正确，注意隐藏密码)
// console.log("Parsed DB Config:", {
//   host: urlObj.hostname,
//   port: urlObj.port || 5432,
//   database: urlObj.pathname.slice(1), // 去掉前面的斜杠
//   user: urlObj.username,
//   sslCA: "Loaded (Length: " + caLocation.length + ")",
// });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // 将解析出来的组件单独赋值
    host: urlObj.hostname,
    user: urlObj.username,
    password: urlObj.password,
    database: urlObj.pathname.slice(1), // URL的pathname是 "/neondb"，需要去掉 "/"
    port: Number(urlObj.port) || 5432, // 如果URL里没写端口，默认5432

    // SSL 配置
    ssl: {
      rejectUnauthorized: true, 
      ca: caLocation,
    },
  },
} satisfies Config;