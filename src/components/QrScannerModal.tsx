import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Camera,
  ScanLine,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';
import jsQR from 'jsqr';
import { AppraisalDossier } from '../types';

interface QrScannerModalProps {
  items: AppraisalDossier[];
  onFoundItem: (item: AppraisalDossier) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  items,
  onFoundItem,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanStatus, setScanStatus] = useState<string>('Point camera at physical asset tag QR code...');
  const animFrameId = useRef<number | null>(null);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    let active = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported on this browser or environment.');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          requestAnimationFrame(scanVideoFrame);
        }
      } catch (err: any) {
        console.warn('Camera failed:', err);
        if (active) {
          setHasCamera(false);
          setCameraError(err.message || 'Camera permission denied or camera not found.');
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const scanVideoFrame = () => {
    if (!isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDetectedCode(code.data);
          return;
        }
      }
    }

    animFrameId.current = requestAnimationFrame(scanVideoFrame);
  };

  const handleDetectedCode = (codeText: string) => {
    setIsScanning(false);
    setScanStatus(`Scanned payload: ${codeText}`);

    // Extract item ID from URL or raw text
    let targetId: string | null = null;
    try {
      const url = new URL(codeText);
      targetId = url.searchParams.get('asset') || url.searchParams.get('item') || url.searchParams.get('dossier');
    } catch {
      // not a full url, check for PHOENIX:ASSET:id or raw id
      if (codeText.startsWith('PHOENIX:ASSET:')) {
        targetId = codeText.replace('PHOENIX:ASSET:', '');
      } else {
        targetId = codeText.trim();
      }
    }

    const matchedItem = items.find(
      (i) => i.id === targetId || i.id.toLowerCase() === (targetId || '').toLowerCase()
    );

    if (matchedItem) {
      setScanStatus(`MATCH FOUND: ${matchedItem.assetName}`);
      setTimeout(() => {
        onFoundItem(matchedItem);
        onClose();
      }, 500);
    } else {
      alert(`Scanned QR Code: "${codeText}"\n\nNo matching asset found in current ledger. Ensure this item is logged in the ledger.`);
      setIsScanning(true);
      animFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDetectedCode(code.data);
        } else {
          alert('Could not find a valid QR code in this image. Please ensure the QR code is clearly visible and well-lit.');
        }
      };
      img.src = loadEvt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                Asset Tag QR Scanner
              </h3>
              <p className="text-[11px] text-slate-400">Instantly pulls up item forensic dossier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Camera Viewport */}
        {hasCamera ? (
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border-2 border-slate-700 shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg"></div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200">Camera Unavailable</h4>
              <p className="text-[11px] text-slate-400">{cameraError || 'No video camera detected.'}</p>
            </div>
          </div>
        )}

        {/* Status / Instructions */}
        <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono text-center text-slate-300">
          {scanStatus}
        </div>

        {/* File Upload Fallback */}
        <div className="border border-dashed border-slate-700 hover:border-amber-500/40 bg-slate-950/60 rounded-xl p-3 text-center transition-all relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Upload or drop photo of asset tag QR code</span>
          </div>
        </div>

        {/* Quick Item Picker for Testing */}
        <div className="space-y-1 pt-1 border-t border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">
            Or test direct lookup from current ledger:
          </span>
          <div className="flex flex-wrap gap-1">
            {items.slice(0, 3).map((itm) => (
              <button
                key={itm.id}
                onClick={() => {
                  onFoundItem(itm);
                  onClose();
                }}
                className="px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 truncate max-w-[130px] cursor-pointer"
              >
                {itm.assetName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
