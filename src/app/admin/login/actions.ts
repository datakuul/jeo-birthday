"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type LoginState = { error?: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password, or you are not an authorised admin." };
    }
    // Re-throw redirect (and anything else) so Next can handle it.
    throw error;
  }
}
