import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/api/server";
import { ProductsScreen } from "./products-screen";

// /w/[slug]/products: catálogo del espacio. Sin el módulo activo o sin permiso de ver: 404, como la
// API. Los datos los pide la pantalla (TanStack Query); acá solo se valida el acceso.
export default async function ProductsPage({
  params,
}: PageProps<"/w/[slug]/products">) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  const permissions = workspace?.permissions.PRODUCTS;
  if (!workspace?.modules.includes("PRODUCTS") || !permissions?.view)
    notFound();
  return (
    <ProductsScreen
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      baseCurrency={workspace.baseCurrency}
      permissions={permissions}
    />
  );
}
