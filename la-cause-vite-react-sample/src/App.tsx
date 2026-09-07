import React, { useState, useEffect } from "react";
import {
  AmplifyProvider,
  useAuth,
  useProcessingOrchestrator,
  useIoT,
  IOT_TOPIC_PREFIX,
} from "@01ive-co-jp/la-cause-core";

/**
 * La Cause Core Library Demo
 *
 * This demo page demonstrates the core features of the La Cause library:
 * 1. Authentication with credentials
 * 2. IoT connectivity for publishing data streams
 * 3. Camera device selection and management
 * 4. Display success/failed status for data dispatch (data delivery must be confirmed via API).
 *
 */
export default function App() {
  // Authentication state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Step tracking
  const [currentStep, setCurrentStep] = useState<"auth" | "camera">("auth");

  // Video display toggle
  const [showVideo, setShowVideo] = useState<boolean>(true);

  // Use the authentication hook
  const {
    actions: authActions,
    isAuthenticated,
    user,
    error: authError,
  } = useAuth({
    fallbackCompanyId: "internal",
  });

  // Video source configuration
  const videoSource = React.useMemo(
    () => ({
      type: "camera" as const,
    }),
    []
  );

  // Use the processing orchestrator hook
  const {
    state: processingState,
    actions: processingActions,
    refs: { videoRef, canvasRef, webcamCanvasRef },
  } = useProcessingOrchestrator({
    userInfo: user || undefined,
    isAuthenticated: isAuthenticated,
    videoSource: videoSource,
    pipConfig: {
      enabled: true,
      autoEnableOnHidden: false,
    },
  });

  // Use the IoT hook (handles data transmission automatically in background)
  useIoT({
    topicPrefix: IOT_TOPIC_PREFIX,
    isAuthenticated: isAuthenticated,
    userInfo: user || undefined,
  });

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authActions.login({ username, password });
      setCurrentStep("camera");
    } catch (err: unknown) {
      console.error("Login error:", err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authActions.logout();
      setCurrentStep("auth");
    } catch (err: unknown) {
      console.error("Logout error:", err);
    }
  };

  // Camera enumeration
  const handleEnumerateCameras = async () => {
    try {
      await processingActions.enumerateCameras();
    } catch (error) {
      console.error("Failed to enumerate cameras:", error);
    }
  };

  // Camera switching
  const handleCameraSwitch = async (deviceId: string) => {
    try {
      await processingActions.switchCamera(deviceId);
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  };

  // --- PiP recording-status wiring ---
  // Track connectivity so the PiP icon warns while offline
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // The app decides what "recording" means; the library only displays it.
  // navigator.onLine alone is unreliable (it reflects interface state, not
  // internet reachability; a VPN or virtual interface keeps it true), so the
  // actual send outcome also drives the icon: iotPublishResult turns 0
  // within one cycle when sending really fails, with the cause in iotError.
  // Note this only reports that data was sent, not that it arrived; arrival
  // needs to be confirmed through the provided API.
  const publishOk = processingState.iotPublishResult !== 0;
  const recordingStatus = isOnline && publishOk;
  useEffect(() => {
    processingActions.setRecordingStatus(recordingStatus);
  }, [
    recordingStatus,
    processingState.orchestratorInitialized,
    processingActions.setRecordingStatus,
  ]);

  // Auto-advance to next step after successful actions
  useEffect(() => {
    if (isAuthenticated && currentStep === "auth") {
      setCurrentStep("camera");
    }
  }, [isAuthenticated, currentStep]);

  const displayError = authError || processingState.error;

  // Helper function to get status display
  const getTransmissionStatus = () => {
    if (processingState.iotPublishResult === null) {
      return { text: "Waiting...", color: "text-gray-500", bg: "bg-gray-100" };
    }
    if (processingState.iotPublishResult === 1) {
      return { text: "Success", color: "text-green-700", bg: "bg-green-100" };
    }
    return { text: "Failed", color: "text-red-700", bg: "bg-red-100" };
  };

  const status = getTransmissionStatus();

  return (
    <>
      <AmplifyProvider />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  La Cause Core Library Demo
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Data transmission only - no emotion data retrieval
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-center space-x-4">
                {/* Step 1: Authentication */}
                <li className="flex items-center">
                  <div
                    className={`flex items-center ${
                      currentStep === "auth" || !isAuthenticated
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStep === "auth" || !isAuthenticated
                          ? "border-blue-600 bg-blue-50"
                          : "border-green-600 bg-green-50"
                      }`}
                    >
                      {isAuthenticated ? "✓" : "1"}
                    </span>
                    <span className="ml-2 text-sm font-medium">Login</span>
                  </div>
                </li>

                <div className="h-0.5 w-16 bg-gray-300"></div>

                {/* Step 2: Camera */}
                <li className="flex items-center">
                  <div
                    className={`flex items-center ${
                      currentStep === "camera" && isAuthenticated
                        ? "text-blue-600"
                        : processingState.availableCameras.length > 0
                        ? "text-green-600"
                        : isAuthenticated
                        ? "text-gray-400"
                        : "text-gray-300"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStep === "camera" && isAuthenticated
                          ? "border-blue-600 bg-blue-50"
                          : processingState.availableCameras.length > 0
                          ? "border-green-600 bg-green-50"
                          : isAuthenticated
                          ? "border-gray-400 bg-gray-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      {processingState.availableCameras.length > 0 ? "✓" : "2"}
                    </span>
                    <span className="ml-2 text-sm font-medium">
                      Camera & Processing
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Instructions & Controls */}
            <div className="space-y-6">
              {/* Step 1: Authentication */}
              {!isAuthenticated && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-blue-600 font-semibold">1</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Step 1: Authentication
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter your Cognito username and password to get started
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        autoComplete="username"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        autoComplete="current-password"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Sign In
                    </button>

                    {displayError && (
                      <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {displayError}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Step 2: Camera Selection */}
              {isAuthenticated && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-blue-600 font-semibold">2</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Step 2: Camera & Processing
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Select your camera and start analysis
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Camera Selection */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Camera Selection
                      </h3>
                      <button
                        onClick={handleEnumerateCameras}
                        className="w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        Detect Cameras
                      </button>

                      {processingState.availableCameras.length > 0 && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Camera
                          </label>
                          <select
                            value={processingState.currentCameraId || ""}
                            onChange={(e) => handleCameraSwitch(e.target.value)}
                            className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {processingState.availableCameras.map(
                              (camera: { deviceId: string; label: string }) => (
                                <option
                                  key={camera.deviceId}
                                  value={camera.deviceId}
                                >
                                  {camera.label}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Processing Controls */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Processing Controls
                      </h3>

                      {processingState.modelStatus === "idle" && (
                        <button
                          className="w-full py-3 px-4 font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                          onClick={processingActions.startProcessing}
                          disabled={!processingState.orchestratorInitialized}
                        >
                          {!processingState.orchestratorInitialized
                            ? "Initializing..."
                            : "Start Processing"}
                        </button>
                      )}

                      {processingState.modelStatus === "loading" && (
                        <div className="p-4 text-center text-blue-600 bg-blue-50 rounded-lg">
                          <div className="font-semibold">Loading models...</div>
                          <div className="text-sm mt-1">
                            This may take a few seconds
                          </div>
                        </div>
                      )}

                      {processingState.modelStatus === "loaded" && (
                        <>
                          <div className="p-3 text-center text-green-600 bg-white rounded-lg font-semibold mb-3">
                            Processing Active!
                          </div>

                          {processingState.processing && (
                            <button
                              className="w-full py-3 px-4 font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition-colors"
                              onClick={processingActions.stopProcessing}
                            >
                              Stop Processing
                            </button>
                          )}
                        </>
                      )}

                      {processingState.modelStatus === "error" && (
                        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg text-sm">
                          {displayError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Video Preview & Status */}
            <div className="space-y-6">
              {/* Video Preview */}
              {isAuthenticated && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Video Preview
                    </h3>
                    <button
                      onClick={() => setShowVideo(!showVideo)}
                      className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {showVideo ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div
                    className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video"
                    style={{ display: showVideo ? "block" : "none" }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!processingState.processing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <div className="text-center text-white">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-2 text-sm">
                            Camera feed will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {!showVideo && processingState.processing && (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <p className="text-gray-600 text-sm">
                        Video feed is hidden but processing continues
                      </p>
                    </div>
                  )}
                  <canvas ref={webcamCanvasRef} style={{ display: "none" }} />
                </div>
              )}

              {/* Face Detection Status */}
              {isAuthenticated && processingState.faceTrackingStatus && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Face Detection
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        processingState.faceTrackingStatus.isValid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {processingState.faceTrackingStatus.isValid
                        ? "Detected"
                        : "Not Detected"}
                    </span>
                  </div>
                </div>
              )}

              {/* Data Dispatch Status */}
              {isAuthenticated && processingState.modelStatus !== "idle" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Data Dispatch Status
                  </h3>
                  <div className="space-y-4">
                    {/* Main Status Display */}
                    <div
                      className={`${
                        status.bg
                      } rounded-lg p-6 text-center border-2 ${
                        processingState.iotPublishResult === 1
                          ? "border-green-300"
                          : processingState.iotPublishResult === 0
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="text-sm text-gray-600 mt-2">
                        {processingState.iotPublishResult === null
                          ? "Data will be sent every 10 seconds during processing"
                          : processingState.iotPublishResult === 1
                          ? "Data dispatched. Please verify delivery through your API."
                          : "Unable to send data. Please check your internet connection and device date and time settings."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </>
  );
}
