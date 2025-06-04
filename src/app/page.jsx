import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Dashboard from "@/components/sections/Dashboard";
import fetchMails from "@/lib/fetchMails";

export default async function Home() {
  const session = await getServerSession(authOptions);
  let mails = [];

  //Obtener correos
  if (session) {
    mails = await fetchMails(session.accessToken, "notificacion_pa@pa.bac.net");
  }

  return (
    <main>
      <Dashboard session={session} mails={mails} />
    </main>
  );
}
