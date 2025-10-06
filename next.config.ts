// next.config.ts
import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.100.18",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },

  // برای TypeORM + mysql2 روی سرور
  serverExternalPackages: ["typeorm", "mysql2"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // درایورهایی که استفاده نمی‌کنی رو external کن (mysql2 رو حذف کن چون لازمته)
      config.externals = [
        ...(config.externals || []),
        "react-native-sqlite-storage",
        "@sap/hana-client/extension/Stream",
        "oracledb",
        "pg-native",
        "better-sqlite3",
        "sqlite3",
        "mssql",
        "mysql",
      ];
    }

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // جلوگیری از resolve شدن درایور React Native
      "typeorm/driver/react-native/ReactNativeDriver": false,
    };

    // فقط درایورهای غیرلازم رو Ignore کن. ❌ mysql2 رو اینجا نذار
    config.plugins?.push(
      new webpack.IgnorePlugin({
        resourceRegExp:
          /(mssql|mysql|oracledb|pg-native|better-sqlite3|sqlite3|react-native-sqlite-storage|@sap\/hana-client\/extension\/Stream)/,
      })
    );

    return config;
  },
};

export default nextConfig;
