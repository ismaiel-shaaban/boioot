'use client';

interface AgentInfoProps {
  agent: {
    id: number;
    name: string;
    image: string;
    rating: number;
    reviewsCount: number;
    phone: string;
    whatsapp?: string;
  };
  onCall?: () => void;
}

export default function AgentInfo({ agent, onCall }: AgentInfoProps) {
  if (!agent) return null;

  return (
    <div className="agent-info mb-4 card p-3">
      <h4>معلومات المالك/الوكيل</h4>
      <div className="d-flex align-items-center">
        <img
          src={agent.image || '/assets/images/blank-profile.png'}
          alt={agent.name}
          className="rounded-circle me-3"
          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
        />
        <div>
          <h5>{agent.name}</h5>
          <p className="text-muted mb-2">
            <i className="fa-solid fa-star text-warning"></i> {agent.rating} ({agent.reviewsCount} تقييم)
          </p>
          <div>
            <button
              type="button"
              className="btn btn-success btn-sm me-2"
              onClick={() => {
                if (onCall) {
                  onCall();
                } else {
                  window.location.href = `tel:${agent.phone}`;
                }
              }}
            >
              <i className="fa-solid fa-phone"></i> اتصل
            </button>
            <a
              href={`https://wa.me/${agent.whatsapp || agent.phone}`}
              className="btn btn-success btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-whatsapp"></i> واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

