import { Card, CardContent } from "@/components/ui/card";
import { SectionPage } from "@/components/marketing/section-page";
import { pricingCards } from "@/lib/site-content";

export default function PricingPage() {
  return (
    <SectionPage title="Pricing" description="Role-based plans for translators and companies, ready for PayPal subscription mapping.">
      <div className="grid gap-4 md:grid-cols-3">
        {pricingCards.map((plan) => (
          <Card key={plan.title}>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-muted-foreground">{plan.title}</p>
              <p className="text-3xl font-semibold">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionPage>
  );
}

