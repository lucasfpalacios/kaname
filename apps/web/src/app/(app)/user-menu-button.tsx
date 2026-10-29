"use client";

import { DropdownMenuItem, UserMenu } from "@kaname/ui";
import type { SessionUser } from "@kaname/shared";
import { LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

// Menú de usuario de la TopBar: "Configuración de la cuenta" (solo para el Dueño de alguna cuenta)
// y "Cerrar sesión", que avisa a la API (borra la sesión y las cookies) y va a /login.
export function UserMenuButton({
  user,
  accountSettings,
}: {
  user: SessionUser;
  /** Mostrar "Configuración de la cuenta" (soy Dueño de alguna cuenta). */
  accountSettings: boolean;
}) {
  const tAccount = useTranslations("Account");
  const t = useTranslations("Auth");
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
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
      {accountSettings && (
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings />
            {tAccount("menu")}
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem disabled={signingOut} onSelect={() => void signOut()}>
        <LogOut />
        {t("signOut")}
      </DropdownMenuItem>
    </UserMenu>
  );
}
