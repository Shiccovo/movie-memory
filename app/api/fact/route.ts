import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { movie: true },
  });

  if (!user?.movie) {
    return NextResponse.json({ error: "No movie set" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Give me one short, fun, and surprising fact about the movie "${user.movie}".
               Keep it to 1-2 sentences. Be specific and interesting.`,
      maxTokens: 150,
    });

    const fact = await prisma.fact.create({
      data: {
        content: text,
        userId: session.user.id,
      },
      select: { id: true, content: true, createdAt: true },
    });

    return NextResponse.json(fact);
  } catch (error) {
    console.error("[/api/fact] OpenAI error:", error);

    // Fall back to the most recent cached fact if OpenAI fails
    const cached = await prisma.fact.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, content: true, createdAt: true },
    });

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // Last resort: store and return a static fallback so the UI isn't broken
    // while OpenAI quota is unavailable. Remove this once billing is set up.
    const fallback = await prisma.fact.create({
      data: {
        content: `"${user.movie}" is a fan favourite — add OpenAI credits to generate a real fun fact!`,
        userId: session.user.id,
      },
      select: { id: true, content: true, createdAt: true },
    });

    return NextResponse.json({ ...fallback, cached: true });
  }
}
