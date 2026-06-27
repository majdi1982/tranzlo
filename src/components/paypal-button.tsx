"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: number;
  applicationId: string;
  onSuccess: (captureId: string) => void;
  onError?: (err: any) => void;
}

export function PayPalButton({ amount, applicationId, onSuccess, onError }: PayPalButtonProps) {
  const [error, setError] = React.useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || "test";

  const createOrder = async () => {
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          referenceId: applicationId,
          description: `Tranzlo Escrow Funding`
        }),
      });

      const orderData = await res.json();

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})` : JSON.stringify(orderData);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      setError("Could not initiate PayPal checkout");
      if (onError) onError(error);
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: data.orderID
        })
      });

      const orderData = await res.json();
      
      const errorDetail = orderData?.details?.[0];

      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
        return actions.restart();
      } else if (errorDetail) {
        throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
      } else if (!orderData.captureId) {
        throw new Error(JSON.stringify(orderData));
      } else {
        onSuccess(orderData.captureId);
      }
    } catch (error) {
      console.error(error);
      setError("Payment capture failed. Please try again.");
      if (onError) onError(error);
    }
  };

  return (
    <div className="w-full min-h-[160px] flex flex-col items-center justify-center p-2 relative z-0">
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 w-full mb-3 text-center">
          {error}
        </div>
      )}
      <div className="w-full" style={{ zIndex: 10 }}>
        <PayPalScriptProvider options={{ clientId: clientId, currency: "USD", intent: "capture" }}>
          <PayPalButtons 
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              setError("An error occurred with PayPal.");
              if (onError) onError(err);
            }}
            style={{ layout: "vertical", shape: "rect" }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}
