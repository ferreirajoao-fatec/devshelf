"use server"

import { signIn, signOut } from "@/lib/auth"

import { safeRedirectPath } from "./redirect"

export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl")
  await signIn("github", {
    redirectTo: safeRedirectPath(typeof callbackUrl === "string" ? callbackUrl : null),
  })
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" })
}
