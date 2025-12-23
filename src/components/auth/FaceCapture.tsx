import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Camera, CheckCircle2, AlertCircle, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaceCaptureProps {
    onCapture: (imageSrc: string, descriptor: Float32Array) => void;
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Added 'straighten' state for post-verification capture prep
    const [detectionState, setDetectionState] = useState<'loading' | 'position' | 'blink' | 'straighten' | 'success' | 'failed'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentAngle, setCurrentAngle] = useState(0);

    // Timeout logic
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (detectionState === 'position' || detectionState === 'blink') {
            timeoutRef.current = setTimeout(() => {
                setDetectionState('failed');
            }, 30000); // 30 seconds timeout
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }
    }, [detectionState]);

    // Head Tilt & Straighten state
    const tiltStartTimeRef = useRef<number | null>(null);
    const straightenStartTimeRef = useRef<number | null>(null);
    const processingRef = useRef(false);
    const requiredTiltDuration = 500; // ms to hold tilt
    const requiredTiltAngle = 15; // degrees

    // Load models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                console.log('Loading face-api models...');
                // Reverting to TinyFaceDetector for speed (User reported SSD was too slow)
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                console.log('Models loaded successfully');
                setModelLoaded(true);
            } catch (err) {
                console.error('Failed to load models:', err);
                setErrorMessage('Failed to load face detection models. Please refresh.');
            }
        };
        loadModels();
    }, []);

    // Calculate Head Roll (Tilt)
    const getHeadRoll = (landmarks: faceapi.FaceLandmarks68) => {
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        // Use center of eyes
        const leftCenter = leftEye[0]; // approximated
        const rightCenter = rightEye[3];

        const dy = rightCenter.y - leftCenter.y;
        const dx = rightCenter.x - leftCenter.x;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return angle;
    };

    const startDetection = useCallback(() => {
        // Detection loop
        let intervalId: NodeJS.Timeout;

        const detect = async () => {
            if (!webcamRef.current || !webcamRef.current.video || !canvasRef.current || processingRef.current) return;
            if (detectionState === 'success' || detectionState === 'failed') return;

            const video = webcamRef.current.video;

            // Ensure video is ready
            if (video.readyState !== 4) return;

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            try {
                // Revert to TinyFaceDetectorOptions for speed
                const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

                const detection = await faceapi.detectSingleFace(video, options)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                // Clear canvas
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (detection) {
                    // Update state to position if properly detected for the first time
                    if (detectionState === 'loading') {
                        setDetectionState('position');
                    }

                    const resizedDetection = faceapi.resizeResults(detection, displaySize);

                    const face = resizedDetection;
                    const landmarks = face.landmarks;
                    const leftEye = landmarks.getLeftEye();
                    const rightEye = landmarks.getRightEye();

                    // Head Tilt Logic
                    const rollAngle = getHeadRoll(landmarks);
                    setCurrentAngle(rollAngle); // Update visual state

                    if (detectionState === 'position') {
                        // Once face is detected stably, ask to tilt
                        // Delay slightly to ensure user reads instruction
                        if (!tiltStartTimeRef.current) tiltStartTimeRef.current = Date.now();
                        if (Date.now() - tiltStartTimeRef.current > 1000) {
                            setDetectionState('blink'); // Reusing 'blink' state name for 'action' state logic
                            tiltStartTimeRef.current = null; // Reset for actual action timer
                        }
                    }

                    if (detectionState === 'blink') {
                        // Check if tilted Left or Right significantly (> 15 degrees)
                        const isTilted = Math.abs(rollAngle) > requiredTiltAngle;

                        if (isTilted) {
                            if (!tiltStartTimeRef.current) {
                                tiltStartTimeRef.current = Date.now();
                            } else {
                                const duration = Date.now() - tiltStartTimeRef.current;
                                if (duration > requiredTiltDuration) {
                                    // Move to next stage instead of capturing immediately
                                    setDetectionState('straighten');
                                    tiltStartTimeRef.current = null;
                                }
                            }
                        } else {
                            tiltStartTimeRef.current = null;
                        }
                    }

                    if (detectionState === 'straighten') {
                        // Check if head is back to straight (within 8 degrees)
                        const isStraight = Math.abs(rollAngle) < 8;

                        if (isStraight) {
                            if (!straightenStartTimeRef.current) {
                                straightenStartTimeRef.current = Date.now();
                            } else {
                                const duration = Date.now() - straightenStartTimeRef.current;
                                // Wait 800ms of straightness before snapping to ensure stability and user readiness
                                if (duration > 800) {
                                    handleCapture(face.descriptor);
                                }
                            }
                        } else {
                            straightenStartTimeRef.current = null;
                        }
                    }

                    // Visual feedback for face box
                    if (ctx) {
                        const box = resizedDetection.detection.box;
                        ctx.strokeStyle = detectionState === 'straighten' ? '#10B981' : '#0EA5E9'; // Green if verified
                        ctx.lineWidth = 2;
                        ctx.strokeRect(box.x, box.y, box.width, box.height);
                    }
                }

            } catch (err) {
                console.error('Detection error:', err);
            }
        };

        intervalId = setInterval(detect, 200); // 5fps check is enough and saves battery
        return () => clearInterval(intervalId);

    }, [detectionState]);

    useEffect(() => {
        // Start detection when model is loaded and camera is ready
        if (modelLoaded && cameraReady) {
            const cleanup = startDetection();
            return cleanup;
        }
    }, [modelLoaded, cameraReady, startDetection]);

    const handleCapture = (descriptor: Float32Array) => {
        if (!webcamRef.current) return;
        processingRef.current = true;

        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setDetectionState('success');
            // Delay slightly to show success state
            setTimeout(() => {
                onCapture(imageSrc, descriptor);
            }, 1000);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden border-2 border-primary/20 bg-card">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden m-4 mb-0">
                {!modelLoaded && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Loading AI Models...</p>
                    </div>
                )}

                {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-destructive z-30 p-4 text-center">
                        <VideoOff className="w-12 h-12 mb-2" />
                        <p className="font-bold mb-1">Camera Error</p>
                        <p className="text-sm">{cameraError}</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </Button>
                    </div>
                )}

                {detectionState === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-green-400 z-30 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 mb-2" />
                        <p className="text-xl font-bold">Capturing...</p>
                    </div>
                )}

                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className={cn("w-full h-full object-cover transform scale-x-[-1]", // Mirror effect
                        detectionState === 'success' ? 'opacity-50' : 'opacity-100'
                    )}
                    videoConstraints={{
                        facingMode: "user",
                        width: 640,
                        height: 480
                    }}
                    onUserMedia={() => {
                        console.log("Camera started successfully");
                        setCameraReady(true);
                    }}
                    onUserMediaError={(err) => {
                        console.error("Camera failed to start:", err);
                        setCameraError("Could not access camera. Please allow permissions.");
                    }}
                />

                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full transform scale-x-[-1] pointer-events-none"
                />

                {/* Failure Overlay */}
                {detectionState === 'failed' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-destructive z-30 animate-in fade-in zoom-in duration-300">
                        <AlertCircle className="w-16 h-16 mb-2" />
                        <p className="text-xl font-bold mb-4">Verification Failed</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setDetectionState('position'); // Retry
                                tiltStartTimeRef.current = null;
                            }}
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Overlay Instructions */}
                {detectionState !== 'loading' && detectionState !== 'success' && detectionState !== 'failed' && !cameraError && (
                    <div className="absolute bottom-4 left-0 right-0 text-center z-10 flex flex-col items-center">
                        <div className={cn(
                            "inline-block px-4 py-2 rounded-full text-white backdrop-blur-sm shadow-lg transition-all duration-300 mb-2",
                            detectionState === 'straighten' ? "bg-green-500/90" : "bg-black/60"
                        )}>
                            {detectionState === 'position' && "Center your face in the frame"}
                            {detectionState === 'blink' && (
                                <span className="flex items-center gap-2">
                                    Please <span className="font-bold text-primary-foreground">TILT HEAD</span> left or right
                                </span>
                            )}
                            {detectionState === 'straighten' && (
                                <span className="flex items-center gap-2 font-bold animate-pulse">
                                    <CheckCircle2 className="w-5 h-5" /> VERIFIED! Hold Straight 📸
                                </span>
                            )}
                        </div>

                        {/* Tilt Meter Visual (Only during tilt phase) */}
                        {detectionState === 'blink' && (
                            <div className="w-64 h-4 bg-gray-700/50 rounded-full mx-auto overflow-hidden relative border border-white/20">
                                {/* Center Marker */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 -translate-x-1/2 z-10"></div>

                                {/* Moving Indicator */}
                                <div
                                    className={cn(
                                        "absolute top-0 bottom-0 transition-all duration-100 ease-out w-1/2",
                                        Math.abs(currentAngle) > requiredTiltAngle ? "bg-green-500" : "bg-blue-500",
                                        currentAngle > 0 ? "left-1/2 origin-left" : "right-1/2 origin-right"
                                    )}
                                    style={{
                                        transform: `scaleX(${Math.min(Math.abs(currentAngle) / 45, 1)})`
                                    }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 bg-muted/30">
                <div className="flex items-start gap-4">
                    {detectionState === 'success' ? (
                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    ) : detectionState === 'failed' || cameraError ? (
                        <div className="p-2 rounded-full bg-red-100 text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    ) : (
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <Camera className="w-6 h-6" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-foreground">
                            {detectionState === 'success' ? 'Biometric Verified' : 'Live Verification'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {cameraError ? "Camera access issue." :
                                detectionState === 'loading' ? "Initializing secure camera..." :
                                    detectionState === 'position' ? "We need to verify you are a real person." :
                                        detectionState === 'blink' ? "Tilting head proves liveness (anti-spoofing)." :
                                            detectionState === 'straighten' ? "Great! Now look at the camera for your photo." :
                                                detectionState === 'success' ? "Your face biometric has been secured." :
                                                    "No face detected or no blink. Please retry."}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FaceCapture;
