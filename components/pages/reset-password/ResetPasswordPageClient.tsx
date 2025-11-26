'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';

export default function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const emailParam = searchParams?.get('email');
    const tokenParam = searchParams?.get('token');

    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setToken(tokenParam);
      setShowModal(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setShowModal(false);
    router.push('/');
  };

  const handleOpenLogin = () => {
    setShowModal(false);
    router.push('/');
  };

  if (!showModal) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <p>الرابط غير صحيح أو منتهي الصلاحية</p>
        </div>
      </div>
    );
  }

  return (
    <ResetPasswordModal
      onClose={handleClose}
      onOpenLogin={handleOpenLogin}
      email={email}
      token={token}
    />
  );
}

