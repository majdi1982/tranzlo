'use client';

import * as React from 'react';
import { activatePayPalSubscription } from '@/app/actions/payments';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  planId: string;
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export default function PayPalButton({ planId, onSuccess, onError }: PayPalButtonProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const containerId = React.useId().replace(/:/g, '');
  const buttonContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let isMounted = true;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AXPRlo7oi-GRgNxmCtjDMJwaKnz1Z2pdrTehZpO4xd_2GPV-m_AeTnacnuZieJatk0pD1R_TOjCMvfT5';

    const loadScript = () => {
      if (window.paypal) {
        renderButton();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
      script.async = true;
      script.onload = () => {
        if (isMounted) renderButton();
      };
      script.onerror = () => {
        if (isMounted) {
          setError('Failed to load PayPal SDK');
          setLoading(false);
        }
      };
      document.body.appendChild(script);
    };

    const renderButton = () => {
      if (!window.paypal || !buttonContainerRef.current) return;

      // Clear previous buttons if re-rendering
      buttonContainerRef.current.innerHTML = '';

      window.paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: (data: any, actions: any) => {
          return actions.subscription.create({
            plan_id: planId
          });
        },
        onApprove: async (data: any, actions: any) => {
          setLoading(true);
          try {
            const result = await activatePayPalSubscription(data.subscriptionID);
            if (result.success) {
              if (onSuccess) onSuccess();
            } else {
              setError(result.error || 'Activation failed');
              if (onError) onError(result.error || 'Activation failed');
            }
          } catch (err: any) {
            setError('System error during activation');
          } finally {
            setLoading(false);
          }
        },
        onCancel: () => {
          console.log('User cancelled');
        },
        onError: (err: any) => {
          console.error('PayPal SDK Button Error:', err);
          const errorMsg = 'PayPal Button Error - Check console';
          setError(errorMsg);
          if (onError) onError(errorMsg);
        }
      }).render(buttonContainerRef.current);
      
      setLoading(false);
    };

    loadScript();

    return () => {
      isMounted = false;
    };
  }, [planId]);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
        </div>
      )}
      {error && (
        <div className="mb-4 text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
          {error}
        </div>
      )}
      <div ref={buttonContainerRef} id={containerId} className="w-full" />
    </div>
  );
}

// Extend global Window interface
declare global {
  interface Window {
    paypal: any;
  }
}
