import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Dashboard from "@/components/sections/Dashboard";
import fetchMails from "@/lib/fetchMails";

export default async function Home() {
  const session = await getServerSession(authOptions);

  let mails = [];

  //Obtener correos
  if (session) {
    mails = await fetchMails({
      accessToken: session.accessToken,
      target: "notificacion_pa@pa.bac.net",
      qty: 1,
    });
  }

  if (mails.length === 0) {
    console.log("sesión de correo EXPIRADA");
  } else {
    console.log("sesión de correo ACTIVA");
  }

  return (
    <main>
      <Dashboard session={session} mails={mails} />
    </main>
  );
}
