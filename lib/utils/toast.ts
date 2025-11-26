import toast from 'react-hot-toast';

export const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
  const options = {
    duration: 3000,
    position: 'top-left' as const,
  };

  switch (type) {
    case 'success':
      toast.success(message, {
        ...options,
        className: 'toast-success',
      });
      break;
    case 'error':
      toast.error(message, {
        ...options,
        className: 'toast-error',
      });
      break;
    case 'warning':
      toast(message, {
        ...options,
        icon: '⚠️',
        className: 'toast-warning',
      });
      break;
    default:
      toast(message, options);
  }
};

