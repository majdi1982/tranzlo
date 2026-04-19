import { Card, CardContent } from "@/components/ui/card";
import { Globe, ShieldCheck, Heart, Users } from "lucide-react";

export default function AboutPage() {
  const values = [
    { title: "Global Connection", desc: "Breaking down barriers through accurate, culturally-aware translation.", icon: Globe },
    { title: "Absolute Trust", desc: "Rigorous vetting and transparent processes for every project.", icon: ShieldCheck },
    { title: "Human Centric", desc: "Empowering professional linguists with modern tools, never replacing them.", icon: Heart },
    { title: "Community Driven", desc: "A thriving ecosystem where both companies and translators grow together.", icon: Users },
  ];

  return (
    <div className="container mx-auto px-4 py-24 space-y-24">
      {/* Vision Section */}
      <section className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold md:text-6xl">Our Mission</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          At Tranzlo, we believe that language should be a bridge, not a barrier. 
          We are building the world's most trusted marketplace for professional translation services, 
          leveraging the power of human expertise and modern technology to connect the world.
        </p>
      </section>

      {/* Values Grid */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <Card key={v.title} className="text-center p-6 border-none bg-muted/30">
            <CardContent className="space-y-4 pt-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-24 text-center">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-4xl md:text-6xl font-bold">100+</div>
            <div className="text-primary-foreground/80">Language Pairs</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-6xl font-bold">5,000+</div>
            <div className="text-primary-foreground/80">Vetted Translators</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-6xl font-bold">1.2M+</div>
            <div className="text-primary-foreground/80">Words Translated</div>
          </div>
        </div>
      </section>
    </div>
  );
}
