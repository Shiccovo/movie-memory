import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import SignOutButton from "@/components/sign-out-button";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, movie: true },
  });

  if (!user?.movie) redirect("/onboarding");

  return (
    <main className="flex-1 flex flex-col px-4 py-8 relative z-10">
      <div className="max-w-3xl w-full mx-auto space-y-8 flex-1 flex flex-col">
        {/* Header with user info */}
        <div className="ios-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {user.image && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/50 flex-shrink-0">
                  <Image
                    src={user.image}
                    alt={user.name ?? "User avatar"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1 flex-1">
                <h1 className="text-3xl font-bold truncate">
                  {user.name ?? "Welcome"}
                </h1>
                <p className="text-secondary text-sm truncate">{user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* Client component handles movie editing + fact fetching */}
        <div className="flex-1">
          <DashboardClient
            userId={session.user.id}
            initialMovie={user.movie}
          />
        </div>
      </div>
    </main>
  );
}
