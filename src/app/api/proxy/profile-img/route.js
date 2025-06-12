import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imgUrl = searchParams.get("url");

  if (!imgUrl) {
    return new NextResponse("Image URL is required", { status: 400 });
  }

  try {
    const response = await fetch(imgUrl, {
      headers: {
        // Algunos proveedores como Google requieren el User-Agent
        "User-Agent": request.headers.get("user-agent") || "",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 1 día
      },
    });
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
