import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SignInButton from "@/components/sign-in-button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { movie: true },
    });
    redirect(user?.movie ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent drop-shadow-lg">
              Movie Memory
            </span>
          </h1>
          <p className="text-xl text-white/80 dark:text-white/70 font-medium">
            Discover fun facts about your favorite movie
          </p>
        </div>

        {/* Sign in card */}
        <div className="ios-card p-8 space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Welcome</h2>
            <p className="text-secondary text-lg">Sign in to get started</p>
          </div>

          <SignInButton />

          <p className="text-xs text-secondary text-center leading-relaxed">
            Your favorite movie and fun facts are saved securely with your account.
          </p>
        </div>
      </div>
    </main>
  );
}
