import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link, redirect y hooks de ruteo que respetan el idioma actual.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
