import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import getMails from "@/lib/getMails";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { target, qty } = await req.json();

    const mails = await getMails({
      accessToken: session.accessToken,
      target: target,
      qty: qty,
    });

    return new Response(JSON.stringify({ mails }), { status: 200 });
  } catch (error) {
    console.error("Error en getMails:", error);
    return new Response(JSON.stringify({ error: "Error al obtener correos" }), {
      status: 500,
    });
  }
}
