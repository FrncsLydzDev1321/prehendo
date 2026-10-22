import Link from "next/link";
import { TopBar } from "@/components/ui";

export default function TeacherBar({ name }: { name: string }) {
  return (
    <TopBar
      right={
        <>
          <Link href="/teacher" className="hidden font-bold text-fog hover:text-chalk sm:inline">HQ</Link>
          <Link href="/teacher/new" className="font-bold text-fog hover:text-chalk">New case</Link>
          <span className="hidden text-fog md:inline">· {name}</span>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-lg border border-smoke px-3 py-1 font-bold hover:border-fog">Log out</button>
          </form>
        </>
      }
    />
  );
}
