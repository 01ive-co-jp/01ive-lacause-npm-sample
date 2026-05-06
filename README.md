# La Cause Library Sample

## [日本語](#ja) / [English](#en)

&nbsp;

<a id="ja"></a>

# 🚀 はじめに

### 前提条件

以下の認証情報が必要です。管理者から提供されるか、Olive担当者までお問い合わせください

- La Cause のユーザー名とパスワード
- La Cause npm アクセストークン

### デモの実行方法

1. `.npmrc` ファイルに La Cause npm アクセストークンを設定します

**`.npmrc`に直接アクセストークンを記載せず、.envなど環境変数などから取得する方式としてください**

`.npmrc` ファイルの内容：

```
@01ive-co-jp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken={YOUR_LA_CAUSE_NPM_ACCESS_TOKEN}
```

2. 依存関係をインストールしてアプリを実行します

```
npm install
npm run dev
```

3. ブラウザで http://localhost:xxxxx を開きます。\*ポート番号は各自の環境により決定される

4. La Cause の認証情報でログインし、測定を開始します。

&nbsp;

# ✍️ 開発での La Cause の使用方法

1. アプリのルートディレクトリに、アクセストークンを含む `.npmrc` ファイルを作成します。

2. `package.json` に以下の依存関係を追加します：

```
    "@01ive-co-jp/la-cause-core": "^0.0.20",
    "@aws-amplify/auth": "^6.13.3",
    "@aws-amplify/core": "^6.12.3",
    "@aws-amplify/pubsub": "^6.1.59",
    "@aws-sdk/credential-provider-cognito-identity": "^3.840.0",
    "@aws-sdk/signature-v4": "^3.370.0",
    "@aws-sdk/types": "^3.840.0",
    "@aws-sdk/util-utf8-browser": "^3.259.0",
    "aws-amplify": "^6.15.3",
    "mqtt": "^5.13.2",
```

3. Vite プロジェクトの場合、`vite.config.ts` に Vite プラグインを追加します：

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lacauseVitePlugin } from "@01ive-co-jp/la-cause-core/vite-plugin";

export default defineConfig({
  plugins: [react(), lacauseVitePlugin()],
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
});
```

このプラグインは、開発時とビルド時に ML モデルファイルを `node_modules/@01ive-co-jp/la-cause-core/models` から `public/models` ディレクトリに自動的にコピーします。

**⚠️ 注意**:

`npm install` 実行後、`public/models` フォルダがプロジェクトルートにコピーされるのは、`npm run dev` を実行時となります。

4. `GlobalErrorHandler.tsx` を作成します：

```
"use client";

import { useGlobalErrorHandler } from "@01ive-co-jp/la-cause-core/hooks";

export default function GlobalErrorHandler() {
  useGlobalErrorHandler();

  return null;
}
```

5. レイアウトファイルに追加します（例）：

```
import GlobalErrorHandler from "./GlobalErrorHandler";
...
  return (
    <html lang="en">
      <body>
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
```

&nbsp;

## 🔧 主要なライブラリコンポーネント

### AmplifyProvider コンポーネント

```typescript
import { AmplifyProvider } from "@01ive-co-jp/la-cause-core";

// アプリのルートに配置
<AmplifyProvider />;
```

### 認証フック

```typescript
import { useAuth } from "@01ive-co-jp/la-cause-core";

const { isAuthenticated, user, actions } = useAuth({
  fallbackCompanyId: "internal",
});

// ログイン
await actions.login({ username, password });

// ログアウト
await actions.logout();
```

### プロセッシング オーケストレーター フック

```typescript
import { useProcessingOrchestrator } from "@01ive-co-jp/la-cause-core";

const { state, actions, refs } = useProcessingOrchestrator({
  userInfo: user,
  isAuthenticated,
  videoSource: { type: "camera" },
  pipConfig: { enabled: true },
});

// 処理を開始
await actions.startProcessing();

// 処理を停止
await actions.stopProcessing();

// カメラを列挙
await actions.enumerateCameras();

// カメラを切り替え
await actions.switchCamera(deviceId);
```

### IoT フック

```typescript
import {
  useIoT,
  buildTopicWithCompanyId,
  IOT_TOPIC_PREFIX,
} from "@01ive-co-jp/la-cause-core";

// IoT 接続はバックグラウンドで自動的に実行されます
const { actions: iotActions } = useIoT({
  topicPrefix: IOT_TOPIC_PREFIX,
  isAuthenticated,
  userInfo: user,
});

// 企業IDを含むトピックで発行
const topicWithCompanyId = buildTopicWithCompanyId(
  IOT_TOPIC_PREFIX,
  user.companyId,
);
```

&nbsp;

---

<a id="en"></a>

# 🚀 Getting Started ([back to top](#la-cause-library-demo))

### Prerequisites

The following credentials provided by your administrator, or please contact the Olive representative.

- La Cause username and password
- La Cause npm access token

### How To Run The Demo

1. Put your La Cause npm access token inside the `.npmrc` file
   **Please do not store access tokens directly in `.npmrc`; instead, retrieve them from environment variables such as `.env`.**

Contents of `.npmrc` file:

```
@01ive-co-jp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken={YOUR_LA_CAUSE_NPM_ACCESS_TOKEN}
```

2. Install dependencies and run the app

```
npm install
npm run dev
```

3. Open http://localhost:3000 (or http://localhost:YOUR-PORT) in your browser.

4. Login with your La Cause credentials and start measurement.

&nbsp;

# ✍️ Using La Cause In Your Development

1. Create the `.npmrc` file with your access token in your app root.

2. Add the following dependencies to your `package.json`:

```
    "@01ive-co-jp/la-cause-core": "^0.0.20",
    "@aws-amplify/auth": "^6.13.3",
    "@aws-amplify/core": "^6.12.3",
    "@aws-amplify/pubsub": "^6.1.59",
    "@aws-sdk/credential-provider-cognito-identity": "^3.840.0",
    "@aws-sdk/signature-v4": "^3.370.0",
    "@aws-sdk/types": "^3.840.0",
    "@aws-sdk/util-utf8-browser": "^3.259.0",
    "aws-amplify": "^6.15.3",
    "mqtt": "^5.13.2",
```

3. For Vite projects, add the Vite plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lacauseVitePlugin } from "@01ive-co-jp/la-cause-core/vite-plugin";

export default defineConfig({
  plugins: [react(), lacauseVitePlugin()],
});
```

The plugin automatically copies ML model files from `node_modules/@01ive-co-jp/la-cause-core/models` to your `public/models` directory during development and build.

**⚠️ Important**:

After running `npm install`, the `public/models` folder is copied to the project root when `npm run dev` is executed.

4. Create `GlobalErrorHandler.tsx`:

```
"use client";

import { useGlobalErrorHandler } from "@01ive-co-jp/la-cause-core/hooks";

export default function GlobalErrorHandler() {
  useGlobalErrorHandler();

  return null;
}
```

5. Add to your layout file, for example:

```
import GlobalErrorHandler from "./GlobalErrorHandler";
...
  return (
    <html lang="en">
      <body>
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
```

&nbsp;

## 🔧 Key Library Components Used

### AmplifyProvider Component

```typescript
import { AmplifyProvider } from "@01ive-co-jp/la-cause-core";

// Place at the root of your app
<AmplifyProvider />;
```

### Authentication Hook

```typescript
import { useAuth } from "@01ive-co-jp/la-cause-core";

const { isAuthenticated, user, actions } = useAuth({
  fallbackCompanyId: "internal",
});

// Login
await actions.login({ username, password });

// Logout
await actions.logout();
```

### Processing Orchestrator Hook

```typescript
import { useProcessingOrchestrator } from "@01ive-co-jp/la-cause-core";

const { state, actions, refs } = useProcessingOrchestrator({
  userInfo: user,
  isAuthenticated,
  videoSource: { type: "camera" },
  pipConfig: { enabled: true },
});

// Start processing
await actions.startProcessing();

// Stop processing
await actions.stopProcessing();

// Enumerate cameras
await actions.enumerateCameras();

// Switch camera
await actions.switchCamera(deviceId);
```

### IoT Hook

```typescript
import {
  useIoT,
  buildTopicWithCompanyId,
  IOT_TOPIC_PREFIX,
} from "@01ive-co-jp/la-cause-core";

// IoT connection runs automatically in the background
const { actions: iotActions } = useIoT({
  topicPrefix: IOT_TOPIC_PREFIX,
  isAuthenticated,
  userInfo: user,
});

// Publish to topic with company ID
const topicWithCompanyId = buildTopicWithCompanyId(
  IOT_TOPIC_PREFIX,
  user.companyId,
);
```
