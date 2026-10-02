import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Read the installed package so the header follows every library update.
const corePackage = JSON.parse(readFileSync(
  join(process.cwd(), "node_modules/@01ive-co-jp/la-cause-core/package.json"),
  "utf8",
)) as { version: string };

const nextConfig: NextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_CORE_VERSION: corePackage.version,
  },
};

export default nextConfig;
