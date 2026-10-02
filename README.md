# La Cause Library Sample

## [日本語](#ja) / [English](#en)

&nbsp;

<a id="ja"></a>

# 🚀 はじめに

### 0.0.23 の新機能・改善点

- **よりスムーズな測定：** 処理の負荷を減らし、測定中もアプリを操作しやすくしました。
- **処理速度の調整：** 端末に合わせて、1秒あたりに処理する画像の枚数を調整できます。
- **作業ラベル：** 作業内容や場所を、測定結果と一緒に保存できます。
- **測定時刻の保持：** 処理や送信に時間がかかっても、結果には実際に測定した時刻が記録されます。

以下の設定は、Next.js と Vite の両方で使えます。

| サンプル | 実行するフォルダ | 設定を変更するファイル |
| --- | --- | --- |
| Next.js | `la-cause-next-js-sample` | [app/page.tsx](la-cause-next-js-sample/app/page.tsx) |
| Vite / React | `la-cause-vite-react-sample` | [src/App.tsx](la-cause-vite-react-sample/src/App.tsx) |

### 前提条件

以下の認証情報を管理者から取得してください。

- La Cause のユーザー名とパスワード
- La Cause npm アクセストークン

### サンプルの実行方法

以下のコマンドは、使用するサンプルのフォルダで実行してください。両サンプルは GitHub Packages で公開済みの `@01ive-co-jp/la-cause-core@0.0.23` を使用します。

1. アプリのルートに、環境変数 `NPM_TOKEN` を参照する `.npmrc` ファイルを作成します。トークンの値は直接記載しないでください。

`.npmrc` ファイルの内容：

```
@01ive-co-jp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

`npm ci` の前に、シェルまたは CI の環境変数 `NPM_TOKEN` に提供されたトークンを設定してください。`.env` に記載するだけでは npm に自動で読み込まれないため、使用する場合は npm の実行環境に明示的に読み込んでください。トークンの実値を含むファイルは Git 管理から除外してください。上記のように環境変数を参照するだけの `.npmrc` は Git 管理できます（[npm の設定方法](https://docs.npmjs.com/cli/v8/configuring-npm/npmrc/)）。

2. 依存関係をインストールしてアプリを実行します

```
npm install
npm run dev
```

3. ターミナルに表示された URL を開きます（通常、Next.js は http://localhost:3000、Vite は http://localhost:5173）。

4. La Cause の認証情報でログインし、測定を開始します。

### ビルドとライブラリのバージョン確認

各サンプルのフォルダで、本番用ビルドを作成できます：

```sh
npm run build
```

ヘッダーには、インストール済みライブラリのパッケージバージョンを自動で表示します。ライブラリを更新したら、アプリを再ビルドし、開発サーバーも再起動してください。

&nbsp;

# ✍️ 開発での La Cause の使用方法

1. 上記「サンプルの実行方法」と同様に、アプリのルートに `${NPM_TOKEN}` を参照する `.npmrc` を作成し、npm の実行環境に `NPM_TOKEN` を設定します。

2. `package.json` に以下の依存関係を追加します：

```
    "@01ive-co-jp/la-cause-core": "0.0.23",
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

Vite プラグインはモデル参照先の解決を行います。モデルファイルのコピーはプラグインではなく、`npm install` 時にライブラリの `postinstall.js` が行います。Vite プロジェクトを検出すると、`node_modules/@01ive-co-jp/la-cause-core/models` からアプリの `public/models` にコピーします。

インストールスクリプトを無効にした場合（`--ignore-scripts` など）や Vite と判定されなかった場合は、自動コピーされません。コピーに失敗してもインストール自体は成功するため、モデルが見つからない場合はインストールログと `public/models` を確認してください。

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

const { isAuthenticated, user, actions } = useAuth();

// ログイン
await actions.login({ username, password });

// ログアウト
await actions.logout();
```

企業 ID は、ログインしたアカウントに設定された属性から取得されます。利用するアカウントに正しい企業 ID が設定されていることを管理者に確認してください。

### プロセッシング オーケストレーター フック

```typescript
import { useProcessingOrchestrator } from "@01ive-co-jp/la-cause-core";

const { state, actions, refs } = useProcessingOrchestrator({
  userInfo: user,
  isAuthenticated,
  videoSource: { type: "camera" },
  workCondition: "Desk work",   // 作業内容
  workSpace: "Office",         // 作業場所
  processingFps: 30,           // 処理 FPS の上限（設定範囲: 13〜30）
  emotionResultInterval: 10000, // 10秒ごとに測定をリクエスト（初期設定）
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

両サンプルは、ライブラリの初期設定である **30 FPS・10秒間隔** を使用します。作業ラベルは任意の設定例です。用途に合わせて変更してください。

- **処理速度：** `processingFps` は **13〜30**、ライブラリの初期設定は **30** です。まず 0.0.23 で初期設定の30を測定し、応答性や CPU 負荷に問題がある場合は **16 または 24** を試してください。設定値は上限であり、実際の速度は端末の状況によって変わります。低くしすぎると、測定に必要な画像が不足する場合があります。
- **不正な FPS 設定：** 範囲外の値や `NaN` / `Infinity` を指定すると、内部の検証で `RangeError` が発生します。これは開始処理内で捕捉され、計測は開始されず、フックの `state.error` にエラーが設定されます。通常、この `RangeError` は `actions.startProcessing()` の呼び出し元には伝播しません。入力値を検証し、`state.error` を確認してください。
- **測定間隔：** `emotionResultInterval` はミリ秒単位です。`10000` は10秒を表し、両サンプルとライブラリの初期設定です。モデルは10秒分のデータを使う前提で学習されており、間隔を短くしても各測定の対象区間は10秒のままです。5秒間隔では重複する区間をより頻繁に処理するため、負荷が増える可能性があります。必要な結果の更新頻度に合わせて設定してください。処理が終わっていない周期はスキップされ、端末や通信が忙しい場合は結果が届く間隔が長くなることがあります。
- **作業ラベル：** `workCondition` と `workSpace` は、測定データの `work_condition` と `work_space` に保存されます。未設定の場合は空文字になります。

**処理速度や測定間隔の変更後は、測定を停止して再開してください。** 作業ラベルは再開せずに次の測定区間から反映されます。処理中の区間には元のラベルが使われます。

主な `state` フィールド:

- `faceDetected`: 顔検出状態（boolean）
- `iotPublishResult`: 直近サイクルの送信処理の結果（`1` = 送信した / `0` = 送信できなかった / `null` = 未実行）。`1` は「送信したこと」を示すもので、到達・保存の保証ではありません。データの到達は提供済みの API での確認が必要です
- `iotError`: 送信に失敗したときにアプリが受け取るオブジェクトです（送信できている間は `null`）。ライブラリ自身は画面に何も表示しません。アプリ側で `iotError.reason`（固定コード: `offline` / `not-connected` / `no-user-info` / `no-data` / `publish-failed` / `unknown`）を読み取り、それに応じた自前の文言を表示してください。値は原因が変わったときに更新され、次の送信が成功すると `null` に戻ります


### PiP（Picture-in-Picture）と送信ステータスアイコン

- PiP はデスクトップ専用です（測定開始と同時に PiP ウィンドウが自動で開きます）
- バックグラウンド計測の対応ブラウザ: デスクトップ版 Chrome / Edge / Firefox 153以降（ライブラリが使用する標準の video PiP API に対応。[Firefox の対応情報](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/153)）。
- **PiP を表示できることと、バックグラウンドで安定して計測できることは別です。** Safari でも PiP のステータスウィンドウを表示できますが、メインウィンドウを最小化したりバックグラウンドに移したりすると、処理 FPS が大幅に低下する場合があります。PiP に絵文字が表示されていても、正常に計測が続いているとは限りません。Safari では計測ページをフォアグラウンドに表示した状態で使用してください。
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

注意: `navigator.onLine` はネットワークインターフェースの状態しか反映しないため（VPN や仮想 NIC があると Wi-Fi を切っても `true` のまま）、実際の送信結果（`iotPublishResult` / `iotError`）も併用してください。送信失敗が分かるまでの時間は、測定間隔や処理・通信の状況によって変わります。ライブラリが報告できるのは「送信したこと」までで、「到達したこと」は確認できません。データの到達は提供済みの API での確認が必要です。

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

# 🚀 Getting Started ([back to top](#la-cause-library-sample))


### What's new in 0.0.23

- **Smoother measurement:** reduces processing load to help the app stay responsive.
- **Adjustable speed:** choose how many images to process each second to suit your device.
- **Work labels:** save the activity and location alongside each measurement.
- **Measurement timestamps:** results keep the time they were measured, even when processing or sending takes longer.

These settings work in both Next.js and Vite.

| Sample | Folder to run commands in | File to edit settings |
| --- | --- | --- |
| Next.js | `la-cause-next-js-sample` | [app/page.tsx](la-cause-next-js-sample/app/page.tsx) |
| Vite / React | `la-cause-vite-react-sample` | [src/App.tsx](la-cause-vite-react-sample/src/App.tsx) |

### Prerequisites

Obtain the following credentials from your administrator:

- La Cause username and password
- La Cause npm access token

### How To Run The Samples

Run these commands in your chosen sample folder. Both samples use the published `@01ive-co-jp/la-cause-core@0.0.23` package from GitHub Packages.

1. Create a `.npmrc` file in your app root that references the `NPM_TOKEN` environment variable. Do not put the token value directly in the file.

Contents of `.npmrc` file:

```
@01ive-co-jp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Before running `npm install`, set `NPM_TOKEN` to the provided token in your shell or CI environment. npm does not automatically load a project `.env` file; if you use one, explicitly load its variables into the environment running npm. Keep files containing actual token values out of Git. A `.npmrc` containing only the environment-variable reference above can be committed. See the [npm configuration documentation](https://docs.npmjs.com/cli/v8/configuring-npm/npmrc/).

2. Install dependencies and run the app

```
npm install
npm run dev
```

3. Open the URL printed in the terminal (usually http://localhost:3000 for Next.js or http://localhost:5173 for Vite).

4. Login with your La Cause credentials and start measurement.

### Building and checking the library version

Create a production build from each sample folder:

```sh
npm run build
```

&nbsp;

# ✍️ Using La Cause In Your Development

1. Create a `.npmrc` in your app root using `${NPM_TOKEN}` and set `NPM_TOKEN` in the environment running npm, as shown in “How To Run The Samples” above.

2. Add the following dependencies to your `package.json`:

```
    "@01ive-co-jp/la-cause-core": "0.0.23",
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
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
});
```

The Vite plugin handles model-path resolution. Model files are copied by the library’s `postinstall.js` during `npm install`, when it detects a Vite project, from `node_modules/@01ive-co-jp/la-cause-core/models` to the app’s `public/models`.

Automatic copying is skipped if install scripts are disabled (for example, with `--ignore-scripts`) or the project is not detected as Vite. Copy failures do not fail the installation, so check the install logs and `public/models` if models are missing.

For Next.js projects, no plugin and no `public/models` copy are needed; webpack resolves the library's model references and bundles them automatically at build time.

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

const { isAuthenticated, user, actions } = useAuth();

// Login
await actions.login({ username, password });

// Logout
await actions.logout();
```

The company ID is read from the signed-in account's attributes. Ask your administrator to confirm that your account has the correct company ID.

### Processing Orchestrator Hook

```typescript
import { useProcessingOrchestrator } from "@01ive-co-jp/la-cause-core";

const { state, actions, refs } = useProcessingOrchestrator({
  userInfo: user || undefined,
  isAuthenticated,
  videoSource: { type: "camera" },
  workCondition: "Desk work",   // Activity
  workSpace: "Office",         // Location
  processingFps: 30,           // Processing FPS cap; valid range: 13–30.
  emotionResultInterval: 10000, // Request a measurement every 10 seconds (default).
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

Both samples use the library defaults of **30 FPS and a ten-second interval**. The work labels are optional examples; adjust them for your application.

- **Processing speed:** `processingFps` accepts **13–30**; the library default is **30**. First measure performance on 0.0.23 at the default 30 FPS. If responsiveness or CPU load is a problem, try **16 or 24**. This is a maximum; actual speed depends on the device's workload. Setting it too low may leave too few images for a measurement.
- **Invalid FPS settings:** Out-of-range values and `NaN` / `Infinity` trigger a `RangeError` during validation. Startup catches it, measurement does not start, and the hook reports the error through `state.error`. Normally, this `RangeError` does not propagate to the caller of `actions.startProcessing()`. Validate inputs and check `state.error`.
- **Measurement interval:** `emotionResultInterval` uses milliseconds. `10000` means ten seconds, the default used by both samples and the library. The models were trained on ten-second windows, and each measurement still uses a ten-second window when this interval is shortened. A five-second interval processes overlapping windows more frequently, which can increase workload. Choose the interval according to the required result-update frequency. A cycle is skipped while the previous batch is still running, and results may arrive less often when the device or connection is busy.
- **Work labels:** `workCondition` and `workSpace` are saved as `work_condition` and `work_space` in the measurement data. Omitted labels become empty strings.

**Stop and restart measurement after changing the speed or interval.** Work labels apply from the next measurement window without a restart. A window already being processed keeps its original labels.

Key `state` fields:

- `faceDetected`: face detection status (boolean)
- `iotPublishResult`: last cycle's send attempt (`1` = sent / `0` = could not send / `null` = not yet). A `1` means the data was sent, not that it arrived or was stored; data arrival needs to be confirmed through the provided API
- `iotError`: an object your app receives when sending fails (`null` while sending works). The library displays nothing on screen by itself; your app reads `iotError.reason` (a fixed code: `offline` / `not-connected` / `no-user-info` / `no-data` / `publish-failed` / `unknown`) and shows its own message for it. The value updates when the cause changes and returns to `null` on the next successful send


### PiP (Picture-in-Picture) and the Recording-Status Icon

- PiP is desktop-only (the PiP window opens automatically when measurement starts)
- Supported browsers for background measurement: desktop Chrome / Edge / Firefox 153 or later (which supports the standard video PiP API used by the library; see [Firefox support](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/153)).
- **Displaying PiP and supporting reliable background measurement are separate capabilities.** Safari can display the PiP status window, but processing FPS may drop substantially when the main window is minimized or backgrounded. A visible emoji in PiP does not guarantee that measurement is continuing normally. In Safari, keep the measurement page visible and in the foreground.
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

Note: `navigator.onLine` only reflects network-interface state (a VPN or virtual NIC keeps it `true` with Wi-Fi off), so also use the actual send outcome (`iotPublishResult` / `iotError`); the time to detect a failure depends on the measurement interval, processing and connection. The library can only report that data was sent, not that it arrived. Data arrival needs to be confirmed through the provided API.

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
