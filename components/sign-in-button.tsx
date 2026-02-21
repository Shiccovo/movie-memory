"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="ios-button w-full"
    >
      Sign in with Google
    </button>
  );
}
