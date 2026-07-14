'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

interface EditableMediaProps {
  mediaKey: string;
  type?: 'image' | 'video' | 'both';
  defaultComponent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  alt?: string;
  initialUrl?: string | null;
}

export default function EditableMedia({ mediaKey, type = 'image', defaultComponent, className = '', style, priority = false, objectFit = 'cover', alt, initialUrl }: EditableMediaProps) {
  const { user, refreshMedia: globalRefreshMedia, mediaRefreshKey, mediaCache, updateMediaCache } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [url, setUrl] = useState<string | null>(initialUrl || mediaCache[mediaKey] || null);
  // Start with loading false if we have cached media or initialUrl
  const [loading, setLoading] = useState(!initialUrl && !mediaCache[mediaKey]);
  const [uploading, setUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMedia = useCallback(async () => {
    // Check cache first
    if (mediaCache[mediaKey]) {
      setUrl(mediaCache[mediaKey]);
      setLoading(false);
      return;
    }

    // Fallback to API if not in cache
    try {
      const res = await fetch(`/api/media/${mediaKey}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data && data.url) setUrl(data.url);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setLoading(false);
    }
  }, [mediaKey, mediaCache]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, refreshKey]);

  // Update when cache changes
  useEffect(() => {
    if (mediaCache[mediaKey]) {
      setUrl(mediaCache[mediaKey]);
      setLoading(false);
    }
  }, [mediaCache, mediaKey]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if ((type === 'video' || (type === 'both' && file.type.startsWith('video/'))) && ext && ['avi', 'wmv', 'mkv', 'flv'].includes(ext)) {
      alert(`The .${ext} format is not natively supported by web browsers. Please upload an .mp4, .webm, or .ogg video file instead.`);
      e.target.value = '';
      return;
    }

    // INSTANT UPDATE: Create object URL immediately for instant preview
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', mediaKey);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        // Replace object URL with actual uploaded URL
        URL.revokeObjectURL(objectUrl); // Clean up memory
        setUrl(data.url);
        // Update cache immediately for instant availability
        updateMediaCache(mediaKey, data.url);
        // Trigger refresh for other components that might be showing this media
        setRefreshKey(prev => prev + 1);
        // Also trigger global refresh for all media components
        if (globalRefreshMedia) globalRefreshMedia();
      } else {
        // Upload failed - revert to previous state
        URL.revokeObjectURL(objectUrl);
        setUrl(null);
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      // Upload failed - revert to previous state
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
      alert('Upload failed');
    } finally {
      setUploading(false);
      // clear input
      e.target.value = '';
    }
  };

  const wrapWithEdit = (content: React.ReactNode) => {
    if (!isAdmin) return <div className={`editable-media-wrapper ${className}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>{content}</div>;

    return (
      <div className={`editable-media-wrapper editable-admin ${className}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
        {content}
        <div className="edit-overlay" style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0,
          transition: 'opacity 0.2s', cursor: 'pointer', zIndex: 10, fontWeight: 600
        }}>
          {uploading ? 'Uploading...' : `Upload ${type === 'video' ? 'Video' : type === 'image' ? 'Image' : 'Media'}`}
          <input type="file" accept={type === 'both' ? 'image/*,video/mp4,video/webm,video/ogg' : type === 'video' ? 'video/mp4,video/webm,video/ogg' : 'image/*'}
            onChange={handleUpload}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            disabled={uploading} />
        </div>
      </div>
    );
  };

  if (loading && !url) {
    return wrapWithEdit(defaultComponent || <div className={`img-placeholder ${className}`} style={{ width: '100%', height: '100%' }} />);
  }

  const isVideoFile = (fileUrl: string) => /\.(mp4|webm|ogg|mov)$/i.test(fileUrl.split('?')[0]);

  if (url) {
    const isVid = type === 'video' || (type === 'both' && isVideoFile(url));
    if (isVid) {
      return wrapWithEdit(
        // Use a key to force reload if url changes
        <video key={url} src={url} autoPlay muted loop playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      );
    }
    
    const imgClass = type === 'both' ? 'ken-burns-effect' : '';

    if (url.startsWith('blob:')) {
      return wrapWithEdit(
        <img src={url} alt={alt || mediaKey} className={imgClass} style={{ width: '100%', height: '100%', objectFit }} loading="lazy" />
      );
    }
    return wrapWithEdit(
      <Image src={url} alt={alt || mediaKey} fill className={imgClass} style={{ objectFit }} priority={priority} sizes="(max-width: 1024px) 100vw, 50vw" quality={priority ? 85 : 60} />
    );
  }

  return wrapWithEdit(defaultComponent || <div className={`img-placeholder ${className}`} style={{ width: '100%', height: '100%' }} />);
}
