import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  // Next.js 15.5+ تغییر کرده
  serverExternalPackages: [
    "typeorm",
    "mysql2", // یا "pg" اگر Postgres استفاده می‌کنی
  ],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // درایورهای غیرضروری رو external کن
      config.externals = [
        ...(config.externals || []),
        "react-native-sqlite-storage",
        "@sap/hana-client/extension/Stream",
        "oracledb",
        "pg-native",
        "better-sqlite3",
        "sqlite3",
        "mssql",
        "mysql", // TypeORM با mysql2 کار می‌کنه
      ];
    }

    // alias برای React Native Driver
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "typeorm/driver/react-native/ReactNativeDriver": false,
    };

    // IgnorePlugin برای requireهای داینامیک
    config.plugins?.push(
      new webpack.IgnorePlugin({
        resourceRegExp:
          /(mssql|mysql|mysql2|oracledb|pg-native|better-sqlite3|sqlite3|react-native-sqlite-storage|@sap\/hana-client\/extension\/Stream)/,
      })
    );

    return config;
  },
};

export default nextConfig;