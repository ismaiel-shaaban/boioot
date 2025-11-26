'use client';

interface PaymentOptionsProps {
  paymentOptions: any[];
}

export default function PaymentOptions({ paymentOptions }: PaymentOptionsProps) {
  if (!paymentOptions || paymentOptions.length === 0) {
    return null;
  }

  return (
    <div className="payment-options mb-4">
      <h4>خيارات الدفع</h4>
      <div className="row">
        {paymentOptions.map((option, index) => (
          <div key={index} className="col-md-6 mb-2">
            <div className="card p-2">
              <strong>{option.name || option.label}</strong>
              <p className="mb-0">{option.description || option.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

