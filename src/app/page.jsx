import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Dashboard from "@/components/sections/Dashboard";
import getMails from "@/lib/getMails";

export default async function Home() {
  const session = await getServerSession(authOptions);

  let mails = [];

  if (session) {
    mails = await getMails({
      accessToken: session.accessToken,
      target: "notificacion_pa@pa.bac.net",
      qty: 15,
    });
  }

  return (
    <main>
      <Dashboard session={session} mails={mails} />
    </main>
  );
}
