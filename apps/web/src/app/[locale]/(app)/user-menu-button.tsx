"use client";

import { DropdownMenuItem, UserMenu } from "@kaname/ui";
import type { SessionUser } from "@kaname/shared";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoginPath } from "@/components/use-login-path";

// Menú de usuario de la TopBar con "Cerrar sesión": avisa a la API (borra la sesión y las
// cookies) y va a /login.
export function UserMenuButton({ user }: { user: SessionUser }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const loginPath = useLoginPath();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace(loginPath());
    router.refresh();
  }

  return (
    <UserMenu
      name={user.name}
      subtitle={user.isSuperadmin ? t("superadmin") : undefined}
      email={user.email}
      avatarUrl={user.avatarUrl}
      label={t("userMenu")}
    >
      <DropdownMenuItem disabled={signingOut} onSelect={() => void signOut()}>
        <LogOut />
        {t("signOut")}
      </DropdownMenuItem>
    </UserMenu>
  );
}
