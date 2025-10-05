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
    ],
  },

  serverExternalPackages: ["typeorm", "mysql2"],

  webpack: (config, { isServer }) => {
    if (isServer) {
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
      "typeorm/driver/react-native/ReactNativeDriver": false,
    };

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
