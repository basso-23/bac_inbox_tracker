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
    const { target, qty, startDate, endDate } = await req.json();

    // Validación básica de fechas si están presentes
    if (startDate && isNaN(Date.parse(startDate))) {
      return new Response(
        JSON.stringify({ error: "Fecha de inicio inválida" }),
        {
          status: 400,
        }
      );
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return new Response(JSON.stringify({ error: "Fecha final inválida" }), {
        status: 400,
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return new Response(
        JSON.stringify({
          error: "La fecha de inicio no puede ser posterior a la fecha final",
        }),
        {
          status: 400,
        }
      );
    }

    const mails = await getMails({
      accessToken: session.accessToken,
      target,
      qty,
      startDate,
      endDate,
    });

    return new Response(JSON.stringify({ mails }), { status: 200 });
  } catch (error) {
    console.error("Error en getMails:", error);
    return new Response(JSON.stringify({ error: "Error al obtener correos" }), {
      status: 500,
    });
  }
}
