import { cookies } from "next/headers";
import HomeClient from "@/components/HomeClient";
import { getServerLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const cookieStore = await cookies();
  const heroSeen = cookieStore.has("pl_hero_seen");
  const locale = await getServerLocale();

  return <HomeClient heroSeen={heroSeen} locale={locale} />;
}
