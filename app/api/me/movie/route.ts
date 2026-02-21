import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("movie" in body)) {
    return NextResponse.json({ error: "Missing field: movie" }, { status: 400 });
  }

  const movie = typeof (body as { movie: unknown }).movie === "string"
    ? (body as { movie: string }).movie.trim()
    : "";

  if (movie.length < 1) {
    return NextResponse.json({ error: "Movie name is required" }, { status: 422 });
  }
  if (movie.length > 100) {
    return NextResponse.json({ error: "Movie name must be 100 characters or fewer" }, { status: 422 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { movie },
    select: { id: true, movie: true },
  });

  return NextResponse.json(user);
}
