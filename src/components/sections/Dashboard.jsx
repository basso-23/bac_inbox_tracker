"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

import { useAtom } from "jotai";
import { sessionAtom } from "@/atom";
import { mailsAtom } from "@/atom";

export default function Dashboard({ session, mails }) {
  const [session_, setSession_] = useAtom(sessionAtom);
  const [mails_, setMails_] = useAtom(mailsAtom);

  useEffect(() => {
    setSession_(session);
    setMails_(mails);
  }, []);

  if (!session_) {
    return (
      <Button onClick={() => signIn("google")}>
        Iniciar sesión con Google
      </Button>
    );
  }

  return (
    <main>
      <div>
        <h1>Bienvenido, {session_.user.name}</h1>
        <p>Tu token de acceso: {session_.accessToken}</p>
      </div>
    </main>
  );
}
