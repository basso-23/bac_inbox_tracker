"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <main className="h-[100dvh] flex items-center justify-center bg-[#fafafa]">
      <div className="flex items-center flex-col login-container">
        {/*//* Bac logo */}
        <div className="login-logo-container">
          <div className="login-logo"></div>
        </div>

        {/*//* Title  */}
        <div className="font-large mt-6">Bienvenido a Inbox Tracker</div>

        {/*//* Gmail btn */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="google-btn mt-6 flex items-center gap-2 justify-center"
        >
          <div className="google-btn-logo"></div>
          Iniciar sesión con Google
        </button>

        {/*//* Nota */}
        <div className="mt-8 text-[13px] font-medium text-center w-[345px] tracking-tight text-secondary-color">
          Nota: Debe tener correos de{" "}
          <strong>notificacion_pa@pa.bac.net</strong> en su bandeja de entrada
          de Gmail para que la plataforma pueda acceder a sus transacciones.
        </div>
      </div>
    </main>
  );
}
