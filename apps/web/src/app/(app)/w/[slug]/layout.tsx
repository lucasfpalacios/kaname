import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/api/server";

// /w/[slug]/...: el slug se busca entre los espacios del usuario. Si no es suyo o no existe, 404,
// el mismo en los dos casos (como la API).
export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps<"/w/[slug]">) {
  const { slug } = await params;
  if (!(await getWorkspaceBySlug(slug))) notFound();
  return children;
}
