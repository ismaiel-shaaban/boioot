'use client';

interface AdGalleryProps {
  mediaUrls: any[];
  videoUrl?: string;
  title?: string;
}

export default function AdGallery({ mediaUrls, videoUrl, title }: AdGalleryProps) {
  return (
    <div className="ad-gallery mb-4">
      {mediaUrls && mediaUrls.length > 0 ? (
        <div className="row g-2">
          {mediaUrls.slice(0, 4).map((media, index) => (
            <div key={index} className={index === 0 ? 'col-12' : 'col-6'}>
              <img
                src={media.url || media}
                alt={title || 'صورة الإعلان'}
                className="img-fluid rounded"
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-light rounded">
          <p>لا توجد صور متاحة</p>
        </div>
      )}
    </div>
  );
}

