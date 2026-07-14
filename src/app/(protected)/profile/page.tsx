import type { Metadata } from "next";
import { ProfileOverview } from "@/features/profile/components/profile-overview";
import { ProfileDetailsSection } from "@/features/profile/components/profile-details-section";
import { ChangeEmailSection } from "@/features/profile/components/change-email-section";
import { ChangePasswordSection } from "@/features/profile/components/change-password-section";
import { SessionsSection } from "@/features/sessions/components/sessions-section";

export const metadata: Metadata = { title: "Hesap" };

/** Protected — the proxy guarantees a session before this renders. */
export default function ProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="t-h1">Hesap</h1>
        <p className="text-sm text-muted-foreground">Kimliğini, e-posta ve şifreni yönet.</p>
      </header>

      <div className="flex flex-col gap-6">
        <ProfileOverview />
        <ProfileDetailsSection />
        <ChangeEmailSection />
        <ChangePasswordSection />
        <SessionsSection />
      </div>
    </div>
  );
}
