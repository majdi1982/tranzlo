"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: number;
  onSuccess: (captureId: string) => Promise<void>;
  onError?: (err: Error) => void;
  description?: string;
}

export function PayPalButton({ amount, onSuccess, onError, description }: PayPalButtonProps) {
  const { toast } = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || "test";

  const createOrder = async () => {
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          referenceId: `INV-${Date.now()}`,
          description: description || `Tranzlo Invoice Payment`
        }),
      });

      const orderData = await res.json();

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description}` : JSON.stringify(orderData);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
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
        throw new Error(errorDetail.description);
      } else if (!orderData.captureId) {
        throw new Error(JSON.stringify(orderData));
      } else {
        await onSuccess(orderData.captureId);
        toast({ title: "Payment Successful", description: "Your transaction was completed via PayPal.", variant: "success" });
      }
    } catch (error: any) {
      console.error(error);
      setError("Payment capture failed. Please try again.");
      toast({ title: "Payment Failed", description: error.message || "An error occurred during payment.", variant: "destructive" });
      if (onError) onError(error);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 w-full mb-3 text-center">
          {error}
        </div>
      )}
      <div className="w-full relative z-10 min-h-[50px]">
        <PayPalScriptProvider options={{ clientId: clientId, currency: "USD", intent: "capture" }}>
          <PayPalButtons 
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err: any) => {
              setError("An error occurred with PayPal.");
              if (onError) onError(err);
            }}
            style={{ layout: "vertical", shape: "rect", height: 48 }}
          />
        </PayPalScriptProvider>
      </div>
      {description && <p className="text-xs text-center text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}
