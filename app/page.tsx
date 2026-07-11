import { cookies } from "next/headers";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const cookieStore = await cookies();
  const heroSeen = cookieStore.has("pl_hero_seen");

  return <HomeClient heroSeen={heroSeen} />;
}
