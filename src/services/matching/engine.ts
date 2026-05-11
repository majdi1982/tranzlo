import { Job, UserProfile, Application } from "@/types";

export interface RankedApplication extends Application {
  score: number;
  translator?: UserProfile;
}

export function rankApplications(job: Job, applications: Application[], translators: UserProfile[]): RankedApplication[] {
  return applications.map(app => {
    const translator = translators.find(t => t.$id === app.translatorId);
    let score = 0;

    if (translator) {
      // 1. Language Match (Highest Priority)
      const hasSource = translator.languages?.includes(job.sourceLanguage);
      const hasTarget = translator.languages?.includes(job.targetLanguage);
      if (hasSource && hasTarget) score += 50;

      // 2. Rating
      if (translator.rating) score += translator.rating * 5;

      // 3. Verification status
      if (translator.verified) score += 10;
    }

    // 4. Price competitiveness (lower price is better for company, but we don't want to encourage race to bottom)
    // For now, just a small weight
    if (app.price <= job.budget) score += 10;

    return {
      ...app,
      score,
      translator
    };
  }).sort((a, b) => b.score - a.score);
}
