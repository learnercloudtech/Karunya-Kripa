import React, { useState, useEffect } from 'react';

interface VideoThumbnailProps {
  src: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ src }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src || thumbnailUrl) return;

    const video = document.createElement('video');
    video.src = src;
    video.crossOrigin = 'anonymous'; // Necessary for canvas security if domains differ
    video.muted = true;
    
    // Seeking to a specific time is more reliable than waiting for the very first frame
    video.currentTime = 1;

    const onSeeked = () => {
      // Don't generate if component has unmounted or if already generated
      if (video.currentTime === 0) return; 

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnailUrl(canvas.toDataURL());
      }
      
      // Clean up event listeners to prevent memory leaks
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    
    const onError = () => {
        console.error("Failed to load video for thumbnail generation on URL:", src);
        setError(true);
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
    }

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);

    // Cleanup function in case the component unmounts before loading finishes
    return () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
    };

  }, [src, thumbnailUrl]);

  if (error) {
    // Fallback if the video fails to load for any reason
    return (
        <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center text-center text-xs p-1">
            Preview unavailable
        </div>
    );
  }

  if (thumbnailUrl) {
    return <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover" />;
  }

  // Placeholder shown while the thumbnail is being generated
  return (
    <div className="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106a.5.5 0 00-.814-.424l-3.236 1.942a.5.5 0 000 .848l3.236 1.942a.5.5 0 00.814-.424V7.106zM4 8a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1H4z" />
        </svg>
    </div>
  );
};

export default VideoThumbnail;