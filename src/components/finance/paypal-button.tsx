"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PayPalButtonProps {
  amount: number;
  onSuccess: (captureId: string) => Promise<void>;
  onError?: (err: Error) => void;
  description?: string;
}

/**
 * Note: This is a placeholder for the actual PayPal integration.
 * In production, you should use @paypal/react-paypal-js
 * and the <PayPalButtons /> component.
 */
export function PayPalButton({ amount, onSuccess, onError, description }: PayPalButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSimulatedPayment = async () => {
    setLoading(true);
    try {
      // Simulate network request and PayPal processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock capture ID
      const mockCaptureId = `PAYID-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      
      await onSuccess(mockCaptureId);
      toast({ title: "Payment Successful", description: "Your transaction was completed via PayPal." });
    } catch (err: any) {
      if (onError) onError(err);
      else toast({ title: "Payment Failed", description: err.message || "An error occurred during payment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button 
        onClick={handleSimulatedPayment} 
        disabled={loading} 
        className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold h-12 text-lg relative"
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            Pay <span className="font-black italic">PayPal</span> ${amount.toFixed(2)}
          </span>
        )}
      </Button>
      {description && <p className="text-xs text-center text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}
