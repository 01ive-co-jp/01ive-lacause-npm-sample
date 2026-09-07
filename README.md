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
    "@01ive-co-jp/la-cause-core": "^0.0.22",
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

Next.js プロジェクトの場合、プラグインや `public/models` へのコピーは不要です。ライブラリ内部のモデル参照を webpack が解決し、ビルド時に自動的にバンドルされます。

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

主な `state` フィールド:

- `faceDetected`: 顔検出状態（boolean）
- `iotPublishResult`: 直近サイクルの送信処理の結果（`1` = 送信した / `0` = 送信できなかった / `null` = 未実行）。`1` は「送信したこと」を示すもので、到達・保存の保証ではありません。データの到達は提供済みの API での確認が必要です
- `iotError`: 送信に失敗したときにアプリが受け取るオブジェクトです（送信できている間は `null`）。ライブラリ自身は画面に何も表示しません。アプリ側で `iotError.reason`（固定コード: `offline` / `not-connected` / `no-user-info` / `no-data` / `publish-failed` / `unknown`）を読み取り、それに応じた自前の文言を表示してください。値は原因が変わったときに更新され、次の送信が成功すると `null` に戻ります


### PiP（Picture-in-Picture）と送信ステータスアイコン

- PiP はデスクトップ専用です（測定開始と同時に PiP ウィンドウが自動で開きます）
- 対応ブラウザ: Chrome / Edge / 新しい Firefox。Safari では PiP ウィンドウは利用できません（計測自体は動作しますが、ブラウザがバックグラウンドの場合は計測が停止します。）
- PiP アイコンは 3 状態: 😊 顔検出中 / 👤 顔なし / ⚠️ データ未送信（顔検出中でも優先表示）

**⚠️ の表示は必ずアプリ側で実装してください。** ライブラリ自身は送信状態を判定しません。`actions.setRecordingStatus(boolean)` で渡された値をそのまま表示するだけです。アプリが一度も呼び出さない場合、⚠️ は決して表示されず、常に 😊 / 👤 のままになります。実装例は各サンプル（`src/App.tsx` / `app/page.tsx`）にあります:

```typescript
// 例: オフライン検知 + 直近の送信結果でアイコンを制御
const publishOk = state.iotPublishResult !== 0;
const recordingStatus = isOnline && publishOk;
useEffect(() => {
  actions.setRecordingStatus(recordingStatus);
}, [recordingStatus]);
```

注意: `navigator.onLine` はネットワークインターフェースの状態しか反映しないため（VPN や仮想 NIC があると Wi-Fi を切っても `true` のまま）、実際の送信結果（`iotPublishResult` / `iotError`）も併用してください。送信失敗は 1〜2 サイクル（10〜20 秒）以内に検出されます。ライブラリが報告できるのは「送信したこと」までで、「到達したこと」は確認できません。データの到達は提供済みの API での確認が必要です。

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
    "@01ive-co-jp/la-cause-core": "^0.0.22",
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

For Next.js projects, no plugin and no `public/models` copy are needed; webpack resolves the library's internal model references and bundles them automatically at build time.

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

Key `state` fields:

- `faceDetected`: face detection status (boolean)
- `iotPublishResult`: last cycle's send attempt (`1` = sent / `0` = could not send / `null` = not yet). A `1` means the data was sent, not that it arrived or was stored; data arrival needs to be confirmed through the provided API
- `iotError`: an object your app receives when sending fails (`null` while sending works). The library displays nothing on screen by itself; your app reads `iotError.reason` (a fixed code: `offline` / `not-connected` / `no-user-info` / `no-data` / `publish-failed` / `unknown`) and shows its own message for it. The value updates when the cause changes and returns to `null` on the next successful send


### PiP (Picture-in-Picture) and the Recording-Status Icon

- PiP is desktop-only (the PiP window opens automatically when measurement starts)
- Supported browsers: Chrome / Edge / recent Firefox. The PiP window is not available in Safari (measurement itself still works but it stops when the browser is in the background.)
- The PiP icon has three states: 😊 face detected / 👤 no face / ⚠️ data not being sent (wins over face status)

**The ⚠️ state must be implemented in your app.** The library makes no judgment of its own; it simply passes through whatever value you provide via `actions.setRecordingStatus(boolean)`. If your app never calls it, the icon will never show ⚠️ and stays on 😊 / 👤. See the reference wiring in each sample (`src/App.tsx` / `app/page.tsx`):

```typescript
// Example: drive the icon from offline detection + the last publish result
const publishOk = state.iotPublishResult !== 0;
const recordingStatus = isOnline && publishOk;
useEffect(() => {
  actions.setRecordingStatus(recordingStatus);
}, [recordingStatus]);
```

Note: `navigator.onLine` only reflects network-interface state (a VPN or virtual NIC keeps it `true` with Wi-Fi off), so also use the actual send outcome (`iotPublishResult` / `iotError`); a real failure surfaces within 1-2 cycles (10-20 s). The library can only report that data was sent, not that it arrived. Data arrival needs to be confirmed through the provided API.

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
