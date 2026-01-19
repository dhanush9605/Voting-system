import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Camera, CheckCircle2, AlertCircle, VideoOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaceCaptureProps {
    onCapture: (imageSrc: string, descriptor: Float32Array) => void;
}

type ChallengeType = 'turnLeft' | 'turnRight';

interface ChallengeConfig {
    type: ChallengeType;
    instruction: string;
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // State Machine
    const [detectionState, setDetectionState] = useState<'loading' | 'position' | 'challenge' | 'straighten' | 'success' | 'failed'>('loading');
    const [currentChallenge, setCurrentChallenge] = useState<ChallengeConfig | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Refs for timing and logic
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const challengeStartTimeRef = useRef<number | null>(null);
    const processingRef = useRef(false);
    const straightenStartTimeRef = useRef<number | null>(null);

    // Strict State Tracking for Sequence Checks (e.g. Blink: Open -> Closed -> Open)
    const challengeStateRef = useRef<{
        blinkStage: 'waiting_for_close' | 'closed' | 'waiting_for_open' | 'done';
        lastYaw: number;
        stableCount: number;
    }>({
        blinkStage: 'waiting_for_close',
        lastYaw: 0,
        stableCount: 0
    });

    // Timeout logic - 15 seconds to complete the challenge
    useEffect(() => {
        if (detectionState === 'challenge') {
            timeoutRef.current = setTimeout(() => {
                setErrorMessage("Timed out. Please act faster.");
                setDetectionState('failed');
            }, 15000);
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }
    }, [detectionState]);

    // Load models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                console.log('Loading face-api models...');
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
                setDetectionState('failed');
            }
        };
        loadModels();
    }, []);

    // --- Geometric Helpers ---

    const getFaceYaw = (landmarks: faceapi.FaceLandmarks68) => {
        const nose = landmarks.getNose()[0];
        const leftJaw = landmarks.getJawOutline()[0];
        const rightJaw = landmarks.getJawOutline()[16];
        const leftDist = nose.x - leftJaw.x;
        const rightDist = rightJaw.x - nose.x;
        // Ratio: > 1.5 means looking Right, < 0.6 means looking Left
        return leftDist / (rightDist + 0.1);
    };

    const getEyeRatio = (eyePoints: faceapi.Point[]) => {
        // EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
        const a = eyePoints[1].y - eyePoints[5].y;
        const b = eyePoints[2].y - eyePoints[4].y;
        const c = eyePoints[0].x - eyePoints[3].x;
        return (Math.abs(a) + Math.abs(b)) / (2 * Math.abs(c));
    };



    const generateChallenge = useCallback((): ChallengeConfig => {
        const challenges: ChallengeConfig[] = [
            { type: 'turnLeft', instruction: "Turn head to your LEFT" },
            { type: 'turnRight', instruction: "Turn head to your RIGHT" }
        ];
        // Weighted random? No, simple random for now.
        return challenges[Math.floor(Math.random() * challenges.length)];
    }, []);

    const checkChallenge = (type: ChallengeType, landmarks: faceapi.FaceLandmarks68): boolean => {
        const yaw = getFaceYaw(landmarks);

        // Debug
        // console.log(`Type: ${type}, Yaw: ${yaw.toFixed(2)}`);

        if (type === 'turnLeft') {
            // Logic: Looking Left -> Nose moves to Subject's Left (High X) -> DistToLeftJaw (rightDist) decreases, DistToRightJaw (leftDist) increases
            // Ratio = DistToRight / DistToLeft -> LARGE
            const passed = yaw > 1.5;
            return passed;
        }

        if (type === 'turnRight') {
            // Logic: Looking Right -> Nose moves to Subject's Right (Low X) -> DistToRightJaw (leftDist) decreases
            // Ratio = DistToRight / DistToLeft -> SMALL
            const passed = yaw < 0.6;
            return passed;
        }

        return false;
    };


    const startDetection = useCallback(() => {
        let isCancelled = false;
        let timeoutId: NodeJS.Timeout;

        const detect = async () => {
            if (isCancelled) return;

            // Check if we should process this frame
            const video = webcamRef.current?.video;
            const isReady = video && video.readyState === 4 && canvasRef.current && !processingRef.current;

            if (detectionState === 'success' || detectionState === 'failed') return;

            if (isReady && video && canvasRef.current) {
                processingRef.current = true;
                try {
                    const displaySize = { width: video.videoWidth, height: video.videoHeight };
                    faceapi.matchDimensions(canvasRef.current, displaySize);

                    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
                    const detection = await faceapi.detectSingleFace(video, options)
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!canvasRef.current) return;
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                    if (detection) {
                        const resizedDetection = faceapi.resizeResults(detection, displaySize);

                        if (detectionState === 'loading') {
                            setDetectionState('position');
                        }

                        if (detectionState === 'position') {
                            const box = resizedDetection.detection.box;
                            const centerX = box.x + box.width / 2;
                            const isCentered = centerX > displaySize.width * 0.3 && centerX < displaySize.width * 0.7;

                            if (isCentered) {
                                if (!challengeStartTimeRef.current) challengeStartTimeRef.current = Date.now();
                                if (Date.now() - challengeStartTimeRef.current > 2000) {
                                    const challenge = generateChallenge();
                                    setCurrentChallenge(challenge);
                                    setDetectionState('challenge');
                                    challengeStartTimeRef.current = null;
                                }
                            } else {
                                challengeStartTimeRef.current = null;
                            }
                        }

                        if (detectionState === 'challenge' && currentChallenge) {
                            const passed = checkChallenge(currentChallenge.type, resizedDetection.landmarks);

                            if (passed) {
                                if (!challengeStartTimeRef.current) {
                                    challengeStartTimeRef.current = Date.now();
                                }

                                if (challengeStartTimeRef.current && Date.now() - challengeStartTimeRef.current > 500) {
                                    setDetectionState('straighten');
                                    challengeStartTimeRef.current = null;
                                }
                            } else {
                                challengeStartTimeRef.current = null;
                            }
                        }

                        if (detectionState === 'straighten') {
                            const yaw = getFaceYaw(resizedDetection.landmarks);
                            const isStraight = yaw > 0.85 && yaw < 1.15;

                            if (isStraight) {
                                if (!straightenStartTimeRef.current) straightenStartTimeRef.current = Date.now();
                                if (Date.now() - straightenStartTimeRef.current > 800) {
                                    handleCapture(detection.descriptor);
                                    return; // Stop loop on capture
                                }
                            } else {
                                straightenStartTimeRef.current = null;
                            }
                        }

                        if (ctx) {
                            const box = resizedDetection.detection.box;
                            ctx.strokeStyle = detectionState === 'straighten' ? '#10B981' : '#0EA5E9';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(box.x, box.y, box.width, box.height);
                        }
                    }
                } catch (err) {
                    console.error("Detection Error", err);
                } finally {
                    processingRef.current = false;
                }
            }

            // Always reschedule loop if not cancelled/finished
            if (!isCancelled) {
                timeoutId = setTimeout(detect, 200);
            }
        };

        detect();

        return () => {
            isCancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [detectionState, currentChallenge, generateChallenge]);

    // Attach listener
    useEffect(() => {
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
            setTimeout(() => onCapture(imageSrc, descriptor), 1500);
        }
    };

    const retry = () => {
        setDetectionState('position');
        setErrorMessage(null);
        setCurrentChallenge(null);
        processingRef.current = false;
        challengeStartTimeRef.current = null;
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
                        <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </div>
                )}

                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className={cn("w-full h-full object-cover transform scale-x-[-1]",
                        detectionState === 'success' ? 'opacity-50' : 'opacity-100'
                    )}
                    videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
                    onUserMedia={() => setCameraReady(true)}
                    onUserMediaError={() => setCameraError("Could not access camera.")}
                />

                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scale-x-[-1] pointer-events-none" />

                {/* State Overlays */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    {detectionState === 'position' && (
                        <div className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm animate-in fade-in slide-in-from-bottom-5">
                            Center your face to start
                        </div>
                    )}

                    {detectionState === 'challenge' && currentChallenge && (
                        <div className="bg-blue-600/90 text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg animate-pulse flex items-center gap-2">
                            {currentChallenge.type === 'turnLeft' && <span className="text-4xl">⬅️</span>}
                            {currentChallenge.type === 'turnRight' && <span className="text-4xl">➡️</span>}
                            {currentChallenge.instruction}
                        </div>
                    )}

                    {detectionState === 'straighten' && (
                        <div className="bg-green-500/90 text-white px-4 py-2 rounded-full font-bold animate-in zoom-in">
                            Great! Look straight... 📸
                        </div>
                    )}

                    {detectionState === 'success' && (
                        <div className="bg-green-600 text-white px-6 py-2 rounded-full flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Verified
                        </div>
                    )}
                </div>

                {/* Failure Screen */}
                {detectionState === 'failed' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 animate-in fade-in">
                        <AlertCircle className="w-12 h-12 text-destructive mb-2" />
                        <h3 className="text-xl font-bold text-white mb-1">Verification Failed</h3>
                        <p className="text-gray-300 text-sm mb-4">{errorMessage || "Liveness check failed."}</p>
                        <Button onClick={retry} variant="secondary" size="sm" className="gap-2">
                            <RefreshCw className="w-4 h-4" /> Try Again
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-4 bg-muted/30">
                <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-full",
                        detectionState === 'success' ? "bg-green-100 text-green-600" :
                            detectionState === 'failed' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                    )}>
                        <Camera className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Live Verification</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Follow the instructions (Turn Head Left/Right) to prove liveness.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FaceCapture;
