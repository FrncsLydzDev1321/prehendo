import { TopBar } from "@/components/ui";
import Round from "./Round";

export const metadata = { title: "On the case · Prehendo" };

export default async function RoundPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const n = Number(level);
  const safeLevel = n === 2 || n === 3 ? n : 1;
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Round level={safeLevel} />
      </main>
    </>
  );
}
