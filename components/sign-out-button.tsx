"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="ios-button-secondary px-4 py-2 text-sm"
    >
      Logout
    </button>
  );
}
