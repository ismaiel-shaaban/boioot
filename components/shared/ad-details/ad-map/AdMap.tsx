'use client';

interface AdMapProps {
  coordinates: { lat: number; lng: number };
}

export default function AdMap({ coordinates }: AdMapProps) {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return null;
  }

  const mapUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;

  return (
    <div className="ad-map mb-4">
      <h4>الموقع على الخريطة</h4>
      <div style={{ width: '100%', height: '400px', overflow: 'hidden' }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAKdfvHs5YyEgwrRqWf2VSPnuJ_LohY404&q=${coordinates.lat},${coordinates.lng}`}
        ></iframe>
      </div>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary mt-2"
      >
        فتح في خرائط جوجل
      </a>
    </div>
  );
}

