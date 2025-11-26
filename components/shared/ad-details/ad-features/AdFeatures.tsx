'use client';

interface AdFeaturesProps {
  features: any[];
}

export default function AdFeatures({ features }: AdFeaturesProps) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="ad-features mb-4">
      <h4>المميزات</h4>
      <div className="row">
        {features.map((feature, index) => (
          <div key={index} className="col-6 col-md-4 mb-2">
            <i className="fa-solid fa-check text-success me-2"></i>
            {typeof feature === 'string' ? feature : feature.Name || feature.name}
          </div>
        ))}
      </div>
    </div>
  );
}

