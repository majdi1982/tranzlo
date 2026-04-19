import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SectionPage } from "@/components/marketing/section-page";
import { marketplaceCalls } from "@/lib/site-content";

export default function MarketplacePage() {
  return (
    <SectionPage title="Marketplace" description="Browse translators and jobs with role-specific workflows and subscription-aware access.">
      <div className="grid gap-4 md:grid-cols-2">
        {marketplaceCalls.map((call) => (
          <Card key={call}>
            <CardContent className="p-5">{call}</CardContent>
          </Card>
        ))}
      </div>
      <div className="pt-4">
        <Link href="/register" className="text-sm font-medium text-primary">Create an account to get started</Link>
      </div>
    </SectionPage>
  );
}

