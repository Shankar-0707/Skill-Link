import { useCallback } from 'react';

interface RazorpayOptions {
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: unknown) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export const useRazorpay = () => {
  const loadScript = useCallback((src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const openRazorpay = useCallback(async (options: Omit<RazorpayOptions, 'key'>) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const rzpOptions = {
      ...options,
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      theme: {
        color: options.theme?.color || '#3399cc', // Razorpay Blue by default
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.open();
  }, [loadScript]);

  return { openRazorpay };
};
