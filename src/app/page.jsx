import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Dashboard from "@/components/sections/Dashboard";
import getMails from "@/lib/getMails";

export default async function Home() {
  const session = await getServerSession(authOptions);

  const defaultTarget = process.env.NEXT_PUBLIC_DEFAULT_TARGET;
  const defaultQty = process.env.NEXT_PUBLIC_DEFAULT_QTY;

  let mails = [];

  if (session) {
    mails = await getMails({
      accessToken: session.accessToken,
      target: defaultTarget,
      qty: defaultQty,
    });
  }

  return (
    <main className="font-general">
      <Dashboard session={session} mails={mails} />
    </main>
  );
}
