import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle, XCircle, AlertTriangle, Smartphone } from 'lucide-react';
import useMobileCamera from '@/hooks/useMobileCamera';

const MobileCameraTest: React.FC = () => {
  const {
    stream,
    isLoading,
    error,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    checkCameraSupport,
    checkPermissions,
    testPermissions,
    detectDevice
  } = useMobileCamera();

  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [supportInfo, setSupportInfo] = useState<any>(null);
  const [permissionInfo, setPermissionInfo] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingPermissions, setIsTestingPermissions] = useState(false);

  useEffect(() => {
    // Get device and support info on mount
    const device = detectDevice();
    const support = checkCameraSupport();
    
    setDeviceInfo(device);
    setSupportInfo(support);
    
    addTestResult(`Device detected: ${device.isMobile ? 'Mobile' : 'Desktop'}`);
    addTestResult(`OS: ${device.isIOS ? 'iOS' : device.isAndroid ? 'Android' : 'Other'}`);
    addTestResult(`Browser: ${device.isChrome ? 'Chrome' : device.isSafari ? 'Safari' : 'Other'}`);
    addTestResult(`Camera support: ${support.supported ? 'Yes' : 'No'}`);
    addTestResult(`HTTPS required: ${support.requiresHTTPS ? 'Yes' : 'No'}`);
  }, [detectDevice, checkCameraSupport]);

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleStartCamera = async () => {
    try {
      addTestResult('Starting camera...');
      await startCamera();
      addTestResult('✅ Camera started successfully');
    } catch (err: any) {
      addTestResult(`❌ Camera failed: ${err.message}`);
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    addTestResult('🛑 Camera stopped');
    setCapturedImage(null);
  };

  const handleTestPermissions = async () => {
    setIsTestingPermissions(true);
    try {
      addTestResult('🔐 Testing camera permissions...');
      const result = await testPermissions();

      setPermissionInfo(result);

      if (result.success) {
        addTestResult('✅ Camera permissions granted');
      } else {
        addTestResult(`❌ Permission test failed: ${result.error}`);
      }
    } catch (err: any) {
      addTestResult(`❌ Permission test error: ${err.message}`);
      setPermissionInfo({ success: false, error: err.message });
    } finally {
      setIsTestingPermissions(false);
    }
  };

  const handleCapturePhoto = () => {
    try {
      addTestResult('Capturing photo...');
      const imageData = capturePhoto(0.9);
      if (imageData) {
        setCapturedImage(imageData);
        addTestResult('📸 Photo captured successfully');
      } else {
        addTestResult('❌ Photo capture failed');
      }
    } catch (err: any) {
      addTestResult(`❌ Capture error: ${err.message}`);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Mobile Camera Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Test camera functionality for mobile deployment. This will verify that your camera works properly on mobile devices.
          </p>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          {deviceInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Mobile Device:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deviceInfo.isMobile)}
                    <span className={getStatusColor(deviceInfo.isMobile)}>
                      {deviceInfo.isMobile ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>iOS Device:</span>
                  <span className={getStatusColor(deviceInfo.isIOS)}>
                    {deviceInfo.isIOS ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Android Device:</span>
                  <span className={getStatusColor(deviceInfo.isAndroid)}>
                    {deviceInfo.isAndroid ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Safari Browser:</span>
                  <span className={getStatusColor(deviceInfo.isSafari)}>
                    {deviceInfo.isSafari ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chrome Browser:</span>
                  <span className={getStatusColor(deviceInfo.isChrome)}>
                    {deviceInfo.isChrome ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Screen Size:</span>
                  <span className="text-gray-600">
                    {screen.width}x{screen.height}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Support */}
      <Card>
        <CardHeader>
          <CardTitle>📹 Camera Support</CardTitle>
        </CardHeader>
        <CardContent>
          {supportInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Camera API Support:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(supportInfo.supported)}
                  <span className={getStatusColor(supportInfo.supported)}>
                    {supportInfo.supported ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>HTTPS Requirement:</span>
                <div className="flex items-center gap-2">
                  {supportInfo.requiresHTTPS ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className={supportInfo.requiresHTTPS ? 'text-amber-600' : 'text-green-600'}>
                    {supportInfo.requiresHTTPS ? 'HTTPS Required' : 'OK'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Current Protocol:</span>
                <span className={location.protocol === 'https:' ? 'text-green-600' : 'text-red-600'}>
                  {location.protocol}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Camera Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleTestPermissions}
              disabled={isTestingPermissions}
              className="w-full"
            >
              {isTestingPermissions ? 'Testing Permissions...' : 'Test Camera Permissions'}
            </Button>

            {permissionInfo && (
              <div className={`p-3 rounded-lg ${permissionInfo.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(permissionInfo.success)}
                  <span className={`font-medium ${permissionInfo.success ? 'text-green-700' : 'text-red-700'}`}>
                    {permissionInfo.success ? 'Permissions Granted' : 'Permission Issue'}
                  </span>
                </div>
                {permissionInfo.error && (
                  <p className={`text-sm ${permissionInfo.success ? 'text-green-600' : 'text-red-600'}`}>
                    {permissionInfo.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera Controls */}
      <Card>
        <CardHeader>
          <CardTitle>🎮 Camera Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={handleStartCamera}
              disabled={isLoading || !!stream}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {isLoading ? 'Starting...' : 'Start Camera'}
            </Button>
            <Button
              onClick={handleStopCamera}
              disabled={!stream}
              variant="outline"
            >
              Stop Camera
            </Button>
            <Button
              onClick={handleCapturePhoto}
              disabled={!stream}
              variant="secondary"
            >
              📸 Capture Photo
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Camera Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Preview */}
      {stream && (
        <Card>
          <CardHeader>
            <CardTitle>📹 Camera Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                LIVE
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Captured Photo */}
      {capturedImage && (
        <Card>
          <CardHeader>
            <CardTitle>📸 Captured Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full max-w-md mx-auto rounded-lg border"
              />
              <div className="text-sm text-gray-600 text-center">
                Photo captured successfully! Size: {Math.round(capturedImage.length * 0.75 / 1024)}KB
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {testResults.join('\n')}
            </pre>
          </div>
          <Button
            onClick={() => setTestResults([])}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Clear Results
          </Button>
        </CardContent>
      </Card>

      {/* Deployment Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Mobile Deployment Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(location.protocol === 'https:' || location.hostname === 'localhost')}
              <span>HTTPS or localhost</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(deviceInfo?.isMobile)}
              <span>Mobile browser detected</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(supportInfo?.supported)}
              <span>Camera API supported</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(permissionInfo?.success)}
              <span>Camera permissions granted</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!stream)}
              <span>Camera stream active</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!capturedImage)}
              <span>Photo capture working</span>
            </div>
          </div>

          {/* Overall Status */}
          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-1">Overall Status:</div>
            <div className={`text-sm ${
              deviceInfo?.isMobile && supportInfo?.supported && permissionInfo?.success
                ? 'text-green-600'
                : 'text-amber-600'
            }`}>
              {deviceInfo?.isMobile && supportInfo?.supported && permissionInfo?.success
                ? '✅ Ready for mobile deployment!'
                : '⚠️ Some issues need to be resolved before deployment'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileCameraTest;
