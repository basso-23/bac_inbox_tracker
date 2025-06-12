"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Bienvenido a Mi App</h1>
        <p className="mb-6 text-gray-600">Inicia sesión para continuar</p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Iniciar sesión con Google
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            ¿No tienes una cuenta? Puedes crearla desde tu cuenta de Google.
          </p>
        </div>
      </div>
    </main>
  );
}
