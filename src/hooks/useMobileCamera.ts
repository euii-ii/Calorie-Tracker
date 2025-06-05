import { useState, useCallback, useRef } from 'react';

interface MobileDevice {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  supportsCamera: boolean;
  requiresHTTPS: boolean;
}

interface CameraConstraints {
  video: {
    facingMode: string;
    width: { ideal: number; min: number; max?: number };
    height: { ideal: number; min: number; max?: number };
    aspectRatio?: { ideal: number };
    frameRate?: { ideal: number; min: number };
    focusMode?: string;
    exposureMode?: string;
    whiteBalanceMode?: string;
  };
  audio: boolean;
}

export const useMobileCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Enhanced mobile device detection with better accuracy
  const detectDevice = useCallback((): MobileDevice => {
    const ua = navigator.userAgent.toLowerCase();

    // Enhanced mobile detection patterns
    const mobilePatterns = [
      /android/i,
      /webos/i,
      /iphone/i,
      /ipad/i,
      /ipod/i,
      /blackberry/i,
      /iemobile/i,
      /opera mini/i,
      /mobile/i,
      /tablet/i,
      /touch/i,
      /phone/i
    ];

    // Check multiple indicators for mobile
    const isMobileUA = mobilePatterns.some(pattern => pattern.test(ua));
    const isMobileScreen = window.screen.width <= 768 || window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = isMobileUA || (isMobileScreen && isTouchDevice);

    // More specific OS detection
    const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(ua);

    // Better browser detection
    const isSafari = /safari/.test(ua) && !/chrome/.test(ua) && !/chromium/.test(ua);
    const isChrome = /chrome/.test(ua) && !/edge/.test(ua);
    const isFirefox = /firefox/.test(ua);
    const isSamsung = /samsungbrowser/.test(ua);

    // Enhanced camera support detection
    const hasMediaDevices = !!(navigator.mediaDevices);
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasLegacyGetUserMedia = !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);
    const supportsCamera = hasGetUserMedia || hasLegacyGetUserMedia;

    // HTTPS requirement check
    const isSecure = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const requiresHTTPS = isMobile && !isSecure && !isLocalhost;

    console.log('🔍 Enhanced device detection:', {
      userAgent: ua,
      isMobileUA,
      isMobileScreen,
      isTouchDevice,
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      isSamsung,
      hasMediaDevices,
      hasGetUserMedia,
      hasLegacyGetUserMedia,
      supportsCamera,
      isSecure,
      isLocalhost,
      requiresHTTPS,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      touchPoints: navigator.maxTouchPoints
    });

    return {
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      supportsCamera,
      requiresHTTPS
    };
  }, []);

  // Get optimal camera constraints for mobile
  const getMobileConstraints = useCallback((device: MobileDevice): CameraConstraints => {
    const baseConstraints: CameraConstraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };

    // Mobile-specific optimizations
    if (device.isMobile) {
      baseConstraints.video.width = { ideal: 1920, min: 640, max: 4096 };
      baseConstraints.video.height = { ideal: 1080, min: 480, max: 2160 };
      
      // Add mobile-specific camera features
      baseConstraints.video.frameRate = { ideal: 30, min: 15 };
      baseConstraints.video.focusMode = 'continuous';
      baseConstraints.video.exposureMode = 'continuous';
      baseConstraints.video.whiteBalanceMode = 'continuous';
    }

    // iOS Safari specific adjustments
    if (device.isIOS && device.isSafari) {
      // iOS Safari has stricter constraints
      baseConstraints.video.width = { ideal: 1280, min: 640 };
      baseConstraints.video.height = { ideal: 720, min: 480 };
    }

    return baseConstraints;
  }, []);

  // Enhanced permission checking
  const checkPermissions = useCallback(async () => {
    try {
      // Check if Permissions API is available
      if ('permissions' in navigator) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('📋 Camera permission status:', cameraPermission.state);
        return cameraPermission.state;
      }
      return 'unknown';
    } catch (error) {
      console.log('📋 Permissions API not available:', error);
      return 'unknown';
    }
  }, []);

  // Start camera with enhanced mobile optimizations
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const device = detectDevice();

      console.log('📱 Mobile camera - Device info:', device);

      // Check for HTTPS requirement
      if (device.requiresHTTPS) {
        throw new Error('HTTPS_REQUIRED');
      }

      // Check camera support
      if (!device.supportsCamera) {
        throw new Error('CAMERA_NOT_SUPPORTED');
      }

      // Check permissions first
      const permissionStatus = await checkPermissions();
      console.log('🔐 Permission status:', permissionStatus);

      if (permissionStatus === 'denied') {
        throw new Error('PERMISSION_DENIED');
      }

      // Get mobile-optimized constraints
      const constraints = getMobileConstraints(device);
      console.log('📹 Mobile camera - Constraints:', constraints);

      // Request camera access with enhanced error handling
      let mediaStream: MediaStream;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError: any) {
        console.warn('⚠️ Initial constraints failed, trying fallback...', constraintError);

        // Try with simpler constraints
        const fallbackConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        };

        mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        console.log('✅ Fallback constraints worked');
      }
      
      console.log('✅ Mobile camera - Stream obtained:', {
        active: mediaStream.active,
        videoTracks: mediaStream.getVideoTracks().length,
        settings: mediaStream.getVideoTracks()[0]?.getSettings()
      });

      setStream(mediaStream);

      // Auto-setup video element if ref is available
      if (videoRef.current && mediaStream) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Mobile-specific video setup
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('playsinline', 'true');
        
        // Enhanced play handling for mobile
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((playError) => {
            console.warn('Video play failed, retrying...', playError);
            // Retry after short delay (common mobile issue)
            setTimeout(() => {
              video.play().catch(console.error);
            }, 100);
          });
        }
      }

      return mediaStream;

    } catch (err: any) {
      console.error('❌ Mobile camera error:', err);

      let errorMessage = 'Camera access failed';
      let userInstructions = '';

      if (err.message === 'HTTPS_REQUIRED') {
        errorMessage = 'HTTPS required for camera access on mobile devices';
        userInstructions = 'Please access this site using HTTPS (https://) instead of HTTP.';
      } else if (err.message === 'CAMERA_NOT_SUPPORTED') {
        errorMessage = 'Camera not supported on this device or browser';
        userInstructions = 'Try using a different browser like Chrome or Safari.';
      } else if (err.message === 'PERMISSION_DENIED') {
        errorMessage = 'Camera permission was previously denied';
        userInstructions = 'Please reset camera permissions in your browser settings and try again.';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
        userInstructions = 'Please tap "Allow" when prompted for camera access, or check your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device';
        userInstructions = 'Make sure your device has a camera and it\'s not being used by another app.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application';
        userInstructions = 'Please close other camera apps and try again.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported on this device';
        userInstructions = 'Your camera doesn\'t support the requested settings. Trying basic settings...';

        // Try with minimal constraints as last resort
        try {
          console.log('🔄 Trying minimal camera constraints...');
          const minimalStream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          setStream(minimalStream);
          setIsLoading(false);
          return minimalStream;
        } catch (fallbackError) {
          console.error('❌ Even minimal constraints failed:', fallbackError);
          errorMessage += ' Even basic camera settings failed.';
        }
      } else if (err.name === 'AbortError') {
        errorMessage = 'Camera access was interrupted';
        userInstructions = 'Please try again.';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Camera access blocked for security reasons';
        userInstructions = 'This may be due to browser security settings or HTTPS requirements.';
      }

      const fullErrorMessage = userInstructions ? `${errorMessage}\n\n${userInstructions}` : errorMessage;
      setError(fullErrorMessage);
      throw new Error(fullErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [detectDevice, getMobileConstraints, checkPermissions]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Camera track stopped:', track.kind);
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setError(null);
  }, [stream]);

  // Capture photo from video stream
  const capturePhoto = useCallback((quality: number = 0.9): string | null => {
    if (!stream || !videoRef.current) {
      setError('Camera not ready for capture');
      return null;
    }

    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState < 2) {
      setError('Video not ready for capture');
      return null;
    }

    // Validate video dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Invalid video dimensions');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Failed to get canvas context');
        return null;
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to JPEG with specified quality
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      console.log('📸 Photo captured:', {
        dimensions: `${canvas.width}x${canvas.height}`,
        size: `${Math.round(dataUrl.length * 0.75 / 1024)}KB`,
        quality
      });

      return dataUrl;
    } catch (err) {
      console.error('❌ Photo capture failed:', err);
      setError('Failed to capture photo');
      return null;
    }
  }, [stream]);

  // Check if device supports camera
  const checkCameraSupport = useCallback(() => {
    const device = detectDevice();
    return {
      supported: device.supportsCamera,
      requiresHTTPS: device.requiresHTTPS,
      device
    };
  }, [detectDevice]);

  // Test camera permissions without starting full camera
  const testPermissions = useCallback(async () => {
    try {
      console.log('🧪 Testing camera permissions...');

      const device = detectDevice();

      if (device.requiresHTTPS) {
        return { success: false, error: 'HTTPS required for camera access on mobile devices' };
      }

      if (!device.supportsCamera) {
        return { success: false, error: 'Camera not supported on this device' };
      }

      // Try to get camera access briefly
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Immediately stop the stream
      testStream.getTracks().forEach(track => track.stop());

      console.log('✅ Camera permission test successful');
      return { success: true, error: null };

    } catch (error: any) {
      console.error('❌ Camera permission test failed:', error);

      let errorMessage = 'Permission test failed';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera in use by another app';
      } else {
        errorMessage = error.message || 'Unknown permission error';
      }

      return { success: false, error: errorMessage };
    }
  }, [detectDevice]);

  return {
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
  };
};

export default useMobileCamera;
