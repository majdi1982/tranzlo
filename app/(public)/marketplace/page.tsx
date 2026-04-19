import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // I'll create this primitive next
import { Search, MapPin, Star, Globe } from "lucide-react";

export default function MarketplacePage() {
  const featuredTranslators = [
    { name: "Elena R.", languages: "English ↔ Spanish", rating: 4.9, jobs: 142, expertise: "Legal, Medical" },
    { name: "Hiroshi T.", languages: "Japanese ↔ English", rating: 5.0, jobs: 89, expertise: "Technical, Gaming" },
    { name: "Sarah M.", languages: "French ↔ Arabic", rating: 4.8, jobs: 215, expertise: "Literary, Marketing" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Translator Marketplace</h1>
          <p className="text-muted-foreground">Find the perfect expert for your language needs.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by language or expertise..." 
            className="w-full h-11 pl-10 pr-4 rounded-full border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredTranslators.map((t) => (
          <Card key={t.name} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {t.name[0]}
              </div>
              <div>
                <CardTitle className="text-lg">{t.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Remote
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4 text-primary" />
                {t.languages}
              </div>
              <div className="flex flex-wrap gap-2">
                {t.expertise.split(", ").map((exp) => (
                  <span key={exp} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-semibold uppercase">
                    {exp}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold">{t.rating}</span>
                  <span className="text-xs text-muted-foreground">({t.jobs} jobs)</span>
                </div>
                <Button size="sm">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
