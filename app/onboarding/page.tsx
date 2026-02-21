import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function saveMovie(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const raw = formData.get("movie");
  const movie = typeof raw === "string" ? raw.trim() : "";

  if (movie.length < 1) {
    // Re-render the page — we pass error via search params for simplicity
    redirect("/onboarding?error=too_short");
  }
  if (movie.length > 100) {
    redirect("/onboarding?error=too_long");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { movie },
  });

  redirect("/dashboard");
}

type Props = { searchParams: Promise<{ error?: string }> };

export default async function OnboardingPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  // If user already has a movie, skip onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { movie: true },
  });
  if (user?.movie) redirect("/dashboard");

  const { error } = await searchParams;
  const errorMessage =
    error === "too_short"
      ? "Movie name must be at least 1 character."
      : error === "too_long"
        ? "Movie name must be 100 characters or fewer."
        : null;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">What's your favorite?</h1>
          <p className="text-lg text-white/80 dark:text-white/70 font-medium">
            We'll show you fun facts about it.
          </p>
        </div>

        {/* Form card */}
        <div className="ios-card p-8 space-y-6">
          <form action={saveMovie} className="space-y-5">
            <div className="space-y-3">
              <label htmlFor="movie" className="block text-lg font-semibold">
                Movie Name
              </label>
              <input
                id="movie"
                name="movie"
                type="text"
                placeholder="e.g. Inception"
                minLength={1}
                maxLength={100}
                required
                autoFocus
                className="ios-input"
              />
              <p className="text-xs text-secondary font-medium">
                Maximum 100 characters
              </p>
            </div>

            {errorMessage && (
              <div className="ios-card p-5 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <p role="alert" className="text-danger font-semibold">
                  {errorMessage}
                </p>
              </div>
            )}

            <button type="submit" className="ios-button w-full text-lg py-4">
              Continue
            </button>
          </form>

          <p className="text-xs text-secondary text-center">
            You can change this anytime from your dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}
