'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, UploadCloud, X, RefreshCw, Check, AlertCircle,
  ShieldCheck, Loader2, FlipHorizontal, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TARGET_SIZE = 400; // 400x400 px passport ratio
const JPEG_QUALITY = 0.85;

export default function PatronPhotoCaptureModal({ isOpen, onClose, onSuccess }) {
  const { uploadPhoto } = useAuth();

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPreview, setCapturedPreview] = useState(null); // base64 preview
  const [compressedDataUrl, setCompressedDataUrl] = useState(null);
  const [fileSizeKb, setFileSizeKb] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) | 'environment' (back)

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream safely
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (_) {}
      });
      streamRef.current = null;
    }
    setStreamActive(false);
  }, []);

  // Start camera stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError('');
    setErrorMessage('');

    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported on this browser. Please use the file upload option.');
      setActiveTab('upload');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play caught:', e));
      }
      setStreamActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      let msg = 'Could not access device camera. Please check your browser permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings or use file upload.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system. Please use the file upload option.';
      }
      setCameraError(msg);
      setActiveTab('upload');
    }
  }, [facingMode, stopCameraStream]);

  // Handle tab switch
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'camera' && !capturedPreview) {
        startCameraStream();
      } else {
        stopCameraStream();
      }
    } else {
      stopCameraStream();
      resetForm();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab, capturedPreview, startCameraStream, stopCameraStream]);

  const resetForm = () => {
    setCapturedPreview(null);
    setCompressedDataUrl(null);
    setFileSizeKb(null);
    setErrorMessage('');
    setSuccessMessage('');
    setCameraError('');
  };

  // Flip camera between front and back
  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Process and compress image file or video frame onto canvas
  const processImageToCanvas = (sourceImageOrVideo, isVideo = false) => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;
    const ctx = canvas.getContext('2d');

    let sourceWidth, sourceHeight;
    if (isVideo) {
      sourceWidth = sourceImageOrVideo.videoWidth || 640;
      sourceHeight = sourceImageOrVideo.videoHeight || 480;
    } else {
      sourceWidth = sourceImageOrVideo.naturalWidth || sourceImageOrVideo.width;
      sourceHeight = sourceImageOrVideo.naturalHeight || sourceImageOrVideo.height;
    }

    // Determine square center crop
    const minDim = Math.min(sourceWidth, sourceHeight);
    const startX = (sourceWidth - minDim) / 2;
    const startY = (sourceHeight - minDim) / 2;

    // Fill clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

    // Draw centered square crop scaled to 400x400
    ctx.drawImage(
      sourceImageOrVideo,
      startX, startY, minDim, minDim,
      0, 0, TARGET_SIZE, TARGET_SIZE
    );

    const compressed = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    setCapturedPreview(compressed);
    setCompressedDataUrl(compressed);

    // Calculate approx file size in KB
    const head = 'data:image/jpeg;base64,';
    const base64Len = compressed.length - head.length;
    const bytes = Math.round((base64Len * 3) / 4);
    setFileSizeKb((bytes / 1024).toFixed(1));

    if (isVideo) {
      stopCameraStream();
    }
  };

  // Snap photo from live video
  const handleSnapPhoto = () => {
    if (!videoRef.current || !streamActive) return;
    processImageToCanvas(videoRef.current, true);
  };

  // Handle local file selection
  const handleFileSelect = (file) => {
    setErrorMessage('');
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Source image is too large (>8MB). Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        processImageToCanvas(img, false);
      };
      img.onerror = () => {
        setErrorMessage('Failed to decode the selected image.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Retake or pick another
  const handleRetake = () => {
    setCapturedPreview(null);
    setCompressedDataUrl(null);
    setFileSizeKb(null);
    setErrorMessage('');
    if (activeTab === 'camera') {
      startCameraStream();
    }
  };

  // Submit and upload photo
  const handleSubmitPhoto = async () => {
    if (!compressedDataUrl) {
      setErrorMessage('No photo captured. Please snap or upload a photo first.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const photoUrl = await uploadPhoto(compressedDataUrl);
      setSuccessMessage('✓ Photo successfully verified and linked to your Digital Library Card!');
      
      setTimeout(() => {
        if (onSuccess) onSuccess(photoUrl);
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004B87] dark:text-blue-400 flex items-center justify-center">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="font-serif-lib text-base font-bold text-slate-900 dark:text-white">
                Patron Card Photo Studio
              </h3>
              <p className="text-[11px] text-slate-500">
                Official Portrait Identity • 400×400 Passport Specification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── MODE TABS (When no preview captured) ────────────────── */}
        {!capturedPreview && (
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-5 pt-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                activeTab === 'camera'
                  ? 'border-[#004B87] text-[#004B87] dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Camera size={14} />
              <span>Live Webcam / Selfie</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#004B87] text-[#004B87] dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <UploadCloud size={14} />
              <span>Upload Passport File</span>
            </button>
          </div>
        )}

        {/* ── BODY CONTENT ────────────────────────────────────────── */}
        <div className="p-5 space-y-4 overflow-y-auto">

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check size={15} className="flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STATE 1: PREVIEW CAPTURED / CROPPED PHOTO */}
          {capturedPreview ? (
            <div className="space-y-4 text-center">
              <div className="relative mx-auto w-44 h-44 rounded-xl overflow-hidden border-2 border-[#004B87] shadow-md bg-slate-100 dark:bg-slate-800">
                <img
                  src={capturedPreview}
                  alt="Patron Passport Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                  <Check size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck size={12} />
                  <span>Verified 1:1 Portrait Ratio</span>
                </span>
                <p className="text-xs text-slate-500 font-mono">
                  {TARGET_SIZE}×{TARGET_SIZE}px • {fileSizeKb} KB (Compressed for Fast Cloudflare Edge Caching)
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
                >
                  Retake Photo
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitPhoto}
                  className="px-5 py-2 rounded-lg bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{submitting ? 'Attaching to Card...' : 'Confirm & Save to ID Card'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STATE 2A: LIVE CAMERA CAPTURE */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  <div className="relative mx-auto w-full aspect-square max-w-[320px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

                    {/* Passport Oval Guide Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                      <div className="w-48 h-56 rounded-[50%/60%] border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                      <span className="absolute bottom-3 text-[11px] font-medium text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        Center face inside oval
                      </span>
                    </div>

                    {/* Camera Switch button if multiple cameras */}
                    <button
                      type="button"
                      onClick={toggleCamera}
                      title="Switch Camera (Front/Back)"
                      className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 hover:bg-black/75 text-white backdrop-blur-xs transition cursor-pointer"
                    >
                      <FlipHorizontal size={14} />
                    </button>
                  </div>

                  {cameraError ? (
                    <p className="text-xs text-rose-600 dark:text-rose-400 text-center">
                      {cameraError}
                    </p>
                  ) : (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleSnapPhoto}
                        className="px-6 py-2.5 rounded-xl bg-[#004B87] hover:bg-[#003865] text-white text-xs font-semibold shadow-md transition cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
                      >
                        <Camera size={15} />
                        <span>Take Snapshot</span>
                      </button>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Ensure good indoor lighting with neutral background
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STATE 2B: FILE UPLOAD DROPZONE */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#004B87] dark:hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50/20"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#004B87] dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Click to choose or drag &amp; drop passport picture
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      JPEG, PNG, or WebP • Auto-cropped to 1:1 square
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Official ID Card Guidelines:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                      <li>Clear face view looking directly at the camera</li>
                      <li>No sunglasses or head coverings obscuring face</li>
                      <li>Solid or plain background preferred</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Hidden Canvas for High-Performance Compression */}
        <canvas ref={canvasRef} className="hidden" />

      </div>
    </div>
  );
}
