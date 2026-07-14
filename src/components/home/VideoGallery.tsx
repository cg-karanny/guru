import React from 'react';
import styles from './VideoGallery.module.css';
import EditableMedia from '@/components/EditableMedia/EditableMedia';
import { prisma } from '@/lib/prisma';

export default async function VideoGallery() {
  const mediaItems = await prisma.media.findMany({
    where: { key: { startsWith: 'home_video_' } },
  });
  const videoUrls: Record<string, string> = {};
  mediaItems.forEach(item => {
    videoUrls[item.key] = item.url;
  });

  return (
    <section className={`section-padding ${styles.section}`} aria-labelledby="vg-title">
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">See It In Action</span>
          <h2 id="vg-title">Why Cushion Guru? Your Vision, Protected.</h2>
          <div className="divider" />
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map(n => (
            <EditableMedia
              key={n}
              mediaKey={`home_video_${n}`}
              type="video"
              className="video-placeholder"
              initialUrl={videoUrls[`home_video_${n}`]}
              defaultComponent={
                <div className="video-placeholder-inner">
                  <div className="video-placeholder-play">
                    <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                  <span style={{ fontSize: '.85rem', fontWeight: 600 }}>Watch Video {n}</span>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
