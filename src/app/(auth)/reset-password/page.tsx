import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/site/reset-password-form";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
