import { SectionPage } from "@/components/marketing/section-page";

export default function AboutPage() {
  return (
    <SectionPage
      title="About Tranzlo"
      description="A translation marketplace designed for production workflows, not demo screens."
    >
      <p>Tranzlo brings together translators, companies, and staff in one platform with clear roles, billing, and support.</p>
      <p>We are building the operational foundation first: secure auth, marketplace flows, subscriptions, and admin oversight.</p>
    </SectionPage>
  );
}

