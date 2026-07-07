import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { EXPERIENCES, FAQ } from "@/lib/content";

export type NewsletterContent = {
  label: string;
  title: string;
  subtitle: string;
  buttonText: string;
};

export type FaqItem = { q: string; a: string };
export type ExperienceItem = { title: string; desc: string; price: string; duration: string; image: string };

const DEFAULT_NEWSLETTER: NewsletterContent = {
  label: "Newsletter",
  title: "Inspirations & offres privées",
  subtitle: "Rejoignez notre cercle — offres exclusives, événements, guides voyage.",
  buttonText: "S'inscrire",
};

export async function fetchEditableNewsletter(): Promise<NewsletterContent> {
  const data = await getSiteSetting<Partial<NewsletterContent>>("site_newsletter", DEFAULT_NEWSLETTER);
  return { ...DEFAULT_NEWSLETTER, ...data };
}

export async function saveEditableNewsletter(value: NewsletterContent) {
  await setSiteSetting("site_newsletter", value);
}

export async function fetchEditableFaq(): Promise<FaqItem[]> {
  const data = await getSiteSetting<FaqItem[]>("site_faq", FAQ);
  return (data?.length ? data : FAQ) as FaqItem[];
}

export async function saveEditableFaq(items: FaqItem[]) {
  await setSiteSetting("site_faq", items);
}

export async function fetchEditableExperiences(): Promise<ExperienceItem[]> {
  const data = await getSiteSetting<ExperienceItem[]>("site_experiences", EXPERIENCES as ExperienceItem[]);
  return (data?.length ? data : (EXPERIENCES as ExperienceItem[]));
}

export async function saveEditableExperiences(items: ExperienceItem[]) {
  await setSiteSetting("site_experiences", items);
}
