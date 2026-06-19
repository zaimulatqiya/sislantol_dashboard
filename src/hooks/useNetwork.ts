import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useNetwork() {
  // Initialize state with true, since navigator might not be defined during SSR
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const currentStatus = navigator.onLine;
      setIsOnline(currentStatus);

      // Jika saat pertama kali dimuat (setelah refresh) ternyata offline, langsung munculkan toast
      if (!currentStatus) {
        toast.error('Koneksi internet terputus!', {
          id: 'network-status',
          duration: 5000,
        });
      }

      const handleOnline = () => {
        setIsOnline(true);
        toast.success('Koneksi internet kembali pulih.', {
          id: 'network-status',
          duration: 3000,
        });
      };

      const handleOffline = () => {
        setIsOnline(false);
        toast.error('Koneksi internet terputus!', {
          id: 'network-status',
          duration: 5000,
        });
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return { isOnline };
}
