import {
  Bell,
  Calculator,
  CalendarDays,
  ChartLine,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  Sun,
  Tags,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "../components/avatar";
import { Button } from "../components/button";
import { DropdownMenuItem } from "../components/dropdown-menu";
import { IconButton } from "../components/icon-button";
import type { ModuleKanjiKey } from "../components/module-kanji";
import {
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarMobileTrigger,
} from "../components/sidebar";
import { TopBar, TopBarActions } from "../components/top-bar";
import {
  WorkspaceSwitcher,
  type WorkspaceSwitcherItem,
} from "../components/workspace-switcher";
import { controlGroup, controlGroupInput } from "../lib/control";
import { cn } from "../lib/cn";
import { storyMessages } from "./messages";
import { workspaces } from "./workspaces";

// Marco de la app para las stories de pantallas: sidebar, top bar y selector de espacio armados
// con el kit, como los va a componer apps/web. Los links son "#": en la app van con <Link>.

export const fill = (text: string, values: Record<string, number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

export function switcherItems(locale: unknown): WorkspaceSwitcherItem[] {
  const s = storyMessages(locale).shell;
  return [
    {
      id: "general",
      name: s.general,
      description: s.generalDescription,
      icon: <LayoutGrid />,
      href: "#",
    },
    ...workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      description: s.types[workspace.type],
      initials: workspace.initials,
      color: workspace.color,
      href: "#",
    })),
  ];
}

type NavItem = { module: ModuleKanjiKey; icon: ReactNode };

const GENERAL_NAV: NavItem[] = [
  { module: "GENERAL", icon: <LayoutGrid /> },
  { module: "CALENDAR", icon: <CalendarDays /> },
  { module: "ADMIN", icon: <Settings /> },
];

const TANK_VAULT_NAV: NavItem[] = [
  { module: "DASHBOARD", icon: <LayoutDashboard /> },
  { module: "PRODUCTS", icon: <Package /> },
  { module: "CUSTOMERS", icon: <Users /> },
  { module: "SUPPLIERS", icon: <Truck /> },
  { module: "PRICE_LISTS", icon: <Tags /> },
  { module: "CALCULATOR", icon: <Calculator /> },
  { module: "MARKET_PRICES", icon: <TrendingUp /> },
  { module: "ORDERS", icon: <Receipt /> },
  { module: "DOCUMENTS", icon: <FileText /> },
  { module: "CALENDAR", icon: <CalendarDays /> },
  { module: "SOCIAL_METRICS", icon: <ChartLine /> },
];

export function StorySidebar({
  locale,
  workspaceId,
  active,
}: {
  locale: unknown;
  workspaceId: string;
  active: ModuleKanjiKey;
}) {
  const t = storyMessages(locale);
  const s = t.shell;
  const nav = workspaceId === "general" ? GENERAL_NAV : TANK_VAULT_NAV;
  return (
    <Sidebar label={s.nav}>
      <SidebarHeader>
        <WorkspaceSwitcher
          workspaces={switcherItems(locale)}
          currentId={workspaceId}
          label={s.switchWorkspace}
          groupLabel={s.workspaces}
          footer={
            <DropdownMenuItem>
              <Plus />
              {s.newWorkspace}
            </DropdownMenuItem>
          }
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup label={s.modules}>
          {nav.map((item) => (
            <SidebarItem
              key={item.module}
              href="#"
              module={item.module}
              icon={item.icon}
              label={t.modules[item.module]}
              active={item.module === active}
            />
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {workspaceId !== "general" && (
          <ul className="w-full">
            <SidebarItem
              href="#"
              module="ADMIN"
              icon={<Settings />}
              label={s.settings}
            />
          </ul>
        )}
        <SidebarCollapseButton
          collapseLabel={s.collapse}
          expandLabel={s.expand}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

export function StoryTopBar({ locale }: { locale: unknown }) {
  const s = storyMessages(locale).shell;
  return (
    <TopBar>
      <SidebarMobileTrigger label={s.openMenu} />
      <label className={cn(controlGroup, "hidden max-w-md sm:flex")}>
        <Search
          aria-hidden="true"
          className="ml-3 size-4 shrink-0 opacity-60"
        />
        <input
          type="search"
          aria-label={s.search}
          placeholder={s.search}
          className={controlGroupInput}
        />
      </label>
      <TopBarActions>
        <Button variant="ghost" size="sm" aria-label={s.language}>
          {locale === "en" ? "EN" : "ES"}
        </Button>
        <IconButton label={s.theme}>
          <Sun />
        </IconButton>
        <IconButton label={s.notifications}>
          <Bell />
        </IconButton>
        <div className="ml-2 flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium">{s.userName}</span>
            <span className="text-xs text-foreground/70">{s.userRole}</span>
          </div>
        </div>
      </TopBarActions>
    </TopBar>
  );
}
