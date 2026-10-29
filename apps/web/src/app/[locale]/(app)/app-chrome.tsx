"use client";

import {
  AppShell,
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarMobileTrigger,
  TopBar,
  TopBarActions,
  Toaster,
  TopBarSearch,
  WorkspaceSwitcher,
  type WorkspaceSwitcherItem,
} from "@kaname/ui";
import type { ModuleKey, SessionUser, WorkspaceSummary } from "@kaname/shared";
import { House, LayoutGrid, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  moduleFromSegment,
  workspaceInitials,
  workspacePath,
} from "@/lib/workspaces/modules";
import { savePreferences } from "@/lib/preferences/preferences";
import { saveSidebarCollapsed } from "@/lib/workspaces/sidebar-cookie";
import { LocaleSwitcher } from "../locale-switcher";
import { ThemeToggle } from "../theme-toggle";
import { MODULE_ICON } from "./module-icons";
import { PreferencesSync, themeOf } from "./preferences-sync";
import { SessionKeeper } from "./session-keeper";
import { UserMenuButton } from "./user-menu-button";

type Place =
  | { kind: "home" }
  | { kind: "general" }
  | {
      kind: "workspace";
      workspace: WorkspaceSummary;
      module: ModuleKey | null;
      settings: boolean;
    }
  | { kind: "none" };

// Dónde está el usuario según la URL (sin el idioma): /, /general o /w/[slug]/[módulo]. El slug
// ya lo validó el layout de /w/[slug]. Lo que no es ninguno de esos (una página 404 dentro del
// shell) no marca ningún ítem del sidebar; un módulo inválido tampoco.
function placeOf(pathname: string, workspaces: WorkspaceSummary[]): Place {
  if (pathname === "/") return { kind: "home" };
  if (pathname === "/general") return { kind: "general" };
  const match = /^\/w\/([^/]+)(?:\/([^/]+))?/.exec(pathname);
  const workspace = match
    ? workspaces.find((item) => item.slug === decodeURIComponent(match[1]))
    : undefined;
  if (!workspace) return { kind: "none" };
  const segment = match![2];
  return {
    kind: "workspace",
    workspace,
    module: segment ? moduleFromSegment(segment) : "DASHBOARD",
    settings: segment === "settings",
  };
}

// Shell de las páginas con sesión: AppShell del kit con el sidebar (selector de espacio y los
// módulos activos del espacio actual) y la TopBar. El acento es el del espacio actual.
export function AppChrome({
  user,
  workspaces,
  defaultCollapsed,
  children,
}: {
  user: SessionUser;
  workspaces: WorkspaceSummary[];
  defaultCollapsed: boolean;
  children: ReactNode;
}) {
  const t = useTranslations("Shell");
  const tModules = useTranslations("Modules");
  const tCommon = useTranslations("Common");
  const place = placeOf(usePathname(), workspaces);
  const current = place.kind === "workspace" ? place.workspace : null;

  const switcherItems: WorkspaceSwitcherItem[] = [
    {
      id: "home",
      name: t("home"),
      description: t("homeDescription"),
      icon: <House />,
      link: <Link href="/" />,
    },
    {
      id: "general",
      name: tModules("GENERAL"),
      description: t("generalDescription"),
      icon: <LayoutGrid />,
      link: <Link href="/general" />,
    },
    ...workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      description: t(`types.${workspace.type}`),
      initials: workspaceInitials(workspace.name),
      color: workspace.color,
      link: <Link href={workspacePath(workspace.slug)} />,
    })),
  ];

  const sidebar = (
    <Sidebar label={t("nav")} closeLabel={tCommon("close")}>
      <SidebarHeader>
        <WorkspaceSwitcher
          workspaces={switcherItems}
          currentId={current?.id ?? place.kind}
          label={t("switchWorkspace")}
          groupLabel={t("workspaces")}
        />
      </SidebarHeader>
      <SidebarContent>
        {current ? (
          <SidebarGroup label={t("modules")}>
            {current.modules.map((module) => (
              <SidebarItem
                key={module}
                asChild
                module={module}
                icon={MODULE_ICON[module]}
                label={tModules(module)}
                active={place.kind === "workspace" && place.module === module}
              >
                <Link href={workspacePath(current.slug, module)} />
              </SidebarItem>
            ))}
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarItem
              asChild
              icon={<House />}
              label={t("home")}
              active={place.kind === "home"}
            >
              <Link href="/" />
            </SidebarItem>
            <SidebarItem
              asChild
              module="GENERAL"
              icon={<LayoutGrid />}
              label={tModules("GENERAL")}
              active={place.kind === "general"}
            >
              <Link href="/general" />
            </SidebarItem>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        {/* Solo el Dueño de la cuenta configura el espacio. */}
        {current?.accountRole === "OWNER" && (
          <ul className="w-full">
            <SidebarItem
              asChild
              module="ADMIN"
              icon={<Settings />}
              label={t("settings")}
              active={place.kind === "workspace" && place.settings}
            >
              <Link href={`${workspacePath(current.slug)}/settings`} />
            </SidebarItem>
          </ul>
        )}
        <SidebarCollapseButton
          collapseLabel={t("collapse")}
          expandLabel={t("expand")}
        />
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <AppShell
      sidebar={sidebar}
      accentColor={current?.color}
      defaultCollapsed={defaultCollapsed}
      onCollapsedChange={saveSidebarCollapsed}
      skipToContentLabel={t("skip")}
      topBar={
        <TopBar>
          <SidebarMobileTrigger label={t("openMenu")} />
          {/* Deshabilitada hasta que exista la búsqueda global. */}
          <TopBarSearch
            label={t("search")}
            placeholder={t("searchSoon")}
            disabled
          />
          <TopBarActions>
            <LocaleSwitcher
              onLocaleChange={(locale) => savePreferences({ locale })}
            />
            <ThemeToggle
              onThemeChange={(theme) =>
                void savePreferences({ theme: themeOf(theme) })
              }
            />
            <UserMenuButton user={user} />
          </TopBarActions>
        </TopBar>
      }
    >
      <PreferencesSync locale={user.locale} theme={user.theme} />
      <Toaster
        label={tCommon("notification")}
        // Radix reemplaza {hotkey} por el atajo (F8): va literal en el texto traducido.
        viewportLabel={tCommon("notifications", { hotkey: "{hotkey}" })}
        closeLabel={tCommon("close")}
      />
      <SessionKeeper />
      {children}
    </AppShell>
  );
}
