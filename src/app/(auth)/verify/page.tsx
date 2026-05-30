"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getServices } from "@/services";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyFallback() {
  return (
    <Card className="text-center">
      <CardContent className="py-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [status, setStatus] = React.useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const uid = userId;
    const sec = secret;
    if (!uid || !sec) {
      setStatus("error");
      setMessage("Invalid verification link. Missing required parameters.");
      return;
    }
    verifyEmail(uid, sec);
  }, [userId, secret]);

  async function verifyEmail(uid: string, sec: string) {
    try {
      const services = getServices();
      await services.auth.verifyEmail(uid, sec);
      setStatus("success");
      setMessage("Your email has been verified successfully!");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Verification failed. The link may have expired.");
    }
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          {status === "verifying" && "Verifying your email address..."}
          {status === "success" && "Your email is now verified"}
          {status === "error" && "Verification failed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-6">
        {status === "verifying" && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
        {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-500" />}
        {status === "error" && <XCircle className="h-16 w-16 text-destructive" />}
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
      <CardFooter className="flex justify-center gap-3">
        {status === "success" && (
          <Button onClick={() => router.push("/")}>
            Go to Dashboard
          </Button>
        )}
        {status === "error" && (
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        )}
        {!userId || !secret ? (
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
