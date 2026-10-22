import { TopBar } from "@/components/ui";
import Lobby from "./Lobby";

export const metadata = { title: "Detective Lobby · Prehendo" };

export default function PlayPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <Lobby />
      </main>
    </>
  );
}
