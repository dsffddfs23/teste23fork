import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import html2canvas from 'html2canvas';

interface StreamMomentButtonProps {
  onCapture: (imageData: string) => Promise<void>;
  streamRef: React.RefObject<HTMLDivElement>;
}

const StreamMomentButton: React.FC<StreamMomentButtonProps> = ({ onCapture, streamRef }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!streamRef.current || isCapturing) return;
    
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(streamRef.current);
      const imageData = canvas.toDataURL('image/png');
      await onCapture(imageData);
    } catch (error) {
      console.error('Failed to capture moment:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <button
      onClick={handleCapture}
      disabled={isCapturing}
      className="absolute top-4 right-4 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50"
    >
      {isCapturing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Capturing...
        </>
      ) : (
        <>
          <Camera className="w-4 h-4" />
          Capture Moment
        </>
      )}
    </button>
  );
};

export default StreamMomentButton;