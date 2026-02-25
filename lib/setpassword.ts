"use server";
import { auth } from "./auth";
import { headers } from "next/headers";

export async function setPasswordAction(newPassword: string) {
  try {
    const headersList = await headers();
    
    await auth.api.setPassword({
      body: { newPassword },
      headers: headersList,
    });

    return { success: true, message: "Password set successfully." };
  } catch (error: unknown) {
    console.error("[setPasswordAction error]", error);
    const msg =
      error instanceof Error ? error.message : "Failed to set password.";
    return { success: false, message: msg };
  }
}