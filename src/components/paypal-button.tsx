"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

interface PayPalButtonProps {
  amount: number;
  applicationId: string;
  onSuccess: (captureId: string) => void;
  onError?: (err: any) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButton({ amount, applicationId, onSuccess, onError }: PayPalButtonProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const buttonRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let active = true;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || "AXPRlo7oi-GRgNxmCtjDMJwaKnz1Z2pdrTehZpO4xd_2GPV-m_AeTnacnuZieJatk0pD1R_TOjCMvfT5";
    const scriptId = "paypal-sdk-script-capture";

    const initButtons = () => {
      if (!window.paypal || !buttonRef.current) return;
      
      // Clear previous buttons
      buttonRef.current.innerHTML = "";

      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                reference_id: applicationId,
                amount: {
                  currency_code: "USD",
                  value: amount.toFixed(2),
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          setLoading(true);
          try {
            const details = await actions.order.capture();
            const captureId = details.purchase_units[0].payments.captures[0].id;
            if (active) onSuccess(captureId);
          } catch (err) {
            console.error("PayPal Capture Error:", err);
            if (active) {
              setError("Payment capture failed. Please try again.");
              if (onError) onError(err);
            }
          } finally {
            if (active) setLoading(false);
          }
        },
        onError: (err: any) => {
          console.error("PayPal Button Error:", err);
          if (active) {
            setError("PayPal loaded with error. Please try again.");
            if (onError) onError(err);
          }
        },
      }).render(buttonRef.current);
      
      setLoading(false);
    };

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      if (window.paypal) {
        initButtons();
      } else {
        existingScript.addEventListener("load", initButtons);
      }
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
      script.async = true;
      script.addEventListener("load", initButtons);
      document.body.appendChild(script);
    }

    return () => {
      active = false;
    };
  }, [amount, applicationId, onSuccess, onError]);

  return (
    <div className="w-full min-h-[100px] flex flex-col items-center justify-center">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground my-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading PayPal checkout...</span>
        </div>
      )}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 w-full mb-3 text-center">
          {error}
        </div>
      )}
      <div ref={buttonRef} className="w-full" style={{ zIndex: 10 }} />
    </div>
  );
}
