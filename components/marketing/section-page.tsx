import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

export function SectionPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Tranzlo</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
        </div>
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-4 p-6 md:p-8">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

