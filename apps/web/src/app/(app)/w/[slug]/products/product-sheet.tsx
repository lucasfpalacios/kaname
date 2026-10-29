"use client";

import {
  Alert,
  Badge,
  Button,
  DateText,
  DescriptionList,
  IconButton,
  MoneyText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetBody,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Skeleton,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kaname/ui";
import type { ModulePermissions, VariantView } from "@kaname/shared";
import { useQuery } from "@tanstack/react-query";
import { PackagePlus, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SheetContent } from "@/components/overlays";
import { TIME_ZONE } from "@/i18n/locale";
import { catalogKeys, getMovements, getProduct } from "@/lib/catalog/api";
import { StockAdjustDialog } from "./stock-adjust-dialog";
import { useCatalogFormat } from "./use-catalog";
import { VariantFormDialog } from "./variant-form-dialog";

/** Movimientos que se muestran en el detalle (la API devuelve hasta 100). */
const MOVEMENTS_SHOWN = 10;

// Detalle de un producto en un Sheet lateral: sus datos, las variantes con stock y costo, y los
// últimos movimientos de stock de la variante elegida. Desde acá se ajusta el stock y se edita
// cada variante (con permiso de editar).
export function ProductSheet({
  workspaceId,
  productId,
  onClose,
  permissions,
  onEdit,
}: {
  workspaceId: string;
  productId: string | null;
  onClose: () => void;
  permissions: ModulePermissions;
  onEdit: (productId: string) => void;
}) {
  const t = useTranslations("Products");
  return (
    <Sheet
      open={productId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent className="sm:max-w-xl">
        {productId ? (
          <Detail
            // Otro producto: estado nuevo (variante elegida, diálogos).
            key={productId}
            workspaceId={workspaceId}
            productId={productId}
            permissions={permissions}
            onEdit={onEdit}
          />
        ) : (
          <SheetHeader>
            <SheetTitle>{t("detail")}</SheetTitle>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Detail({
  workspaceId,
  productId,
  permissions,
  onEdit,
}: {
  workspaceId: string;
  productId: string;
  permissions: ModulePermissions;
  onEdit: (productId: string) => void;
}) {
  const t = useTranslations("Products");
  const format = useCatalogFormat();
  const product = useQuery({
    queryKey: catalogKeys.product(workspaceId, productId),
    queryFn: () => getProduct(workspaceId, productId),
  });
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<VariantView | null>(null);
  const [editing, setEditing] = useState<VariantView | null>(null);

  const variants = product.data?.variants ?? [];
  const movementVariant =
    variants.find((variant) => variant.id === chosenId) ?? variants[0];
  const movements = useQuery({
    queryKey: catalogKeys.movements(workspaceId, movementVariant?.id ?? ""),
    queryFn: () => getMovements(workspaceId, movementVariant!.id),
    enabled: Boolean(movementVariant),
  });

  if (product.isPending) {
    return (
      <>
        <SheetHeader>
          <SheetTitle>{t("detail")}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </SheetBody>
      </>
    );
  }
  if (product.isError) {
    return (
      <>
        <SheetHeader>
          <SheetTitle>{t("detail")}</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <Alert variant="destructive">{t("loadError")}</Alert>
        </SheetBody>
      </>
    );
  }

  const data = product.data;
  const tracked = variants.filter((variant) => variant.trackStock);
  const totalStock = tracked.reduce(
    (sum, variant) => sum + Number(variant.stock),
    0,
  );
  const hasOptions = data.options.length > 0;
  const lowStock = variants.some((variant) => variant.lowStock);
  const variantName = (variant: VariantView) =>
    variant.name ?? t("defaultVariant");

  return (
    <>
      <SheetHeader>
        <SheetTitle>{data.name}</SheetTitle>
        <SheetDescription>
          {[t(`kinds.${data.kind}`), data.category?.name]
            .filter(Boolean)
            .join(" · ")}
        </SheetDescription>
      </SheetHeader>
      <SheetBody className="flex flex-col gap-6">
        {(!data.isActive || lowStock) && (
          <div className="flex flex-wrap gap-2">
            {!data.isActive && (
              <Badge variant="secondary">{t("archivedBadge")}</Badge>
            )}
            {lowStock && (
              <StatusBadge tone="warning" label={t("lowStockBadge")} />
            )}
          </div>
        )}
        {data.description && (
          <p className="text-sm whitespace-pre-line text-foreground/80">
            {data.description}
          </p>
        )}
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-foreground/70 uppercase">
            {t("sheet.data")}
          </h3>
          <DescriptionList
            items={[
              {
                term: t("columns.category"),
                description: data.category?.name ?? "—",
              },
              { term: t("fields.kind"), description: t(`kinds.${data.kind}`) },
              {
                term: t("sheet.totalStock"),
                description:
                  tracked.length > 0
                    ? t("units", {
                        quantity: format.quantity(String(totalStock)),
                      })
                    : t("sheet.notTracked"),
              },
              ...(hasOptions
                ? [
                    {
                      term: t("sheet.options"),
                      description: data.options
                        .map(
                          (option) =>
                            `${option.name}: ${option.values.join(", ")}`,
                        )
                        .join(" · "),
                    },
                  ]
                : []),
            ]}
          />
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-foreground/70 uppercase">
            {t("sheet.variants", { count: variants.length })}
          </h3>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sheet.variant")}</TableHead>
                  <TableHead className="text-right">
                    {t("columns.stock")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("columns.cost")}
                  </TableHead>
                  {permissions.edit && (
                    <TableHead>
                      <span className="sr-only">{t("columns.actions")}</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">
                          {variantName(variant)}
                        </span>
                        <span className="font-mono text-xs whitespace-nowrap text-foreground/70">
                          {variant.sku ?? t("noSku")}
                        </span>
                        {!variant.isActive && (
                          <Badge variant="secondary">
                            {t("archivedBadge")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {!variant.trackStock ? (
                        "—"
                      ) : variant.lowStock ? (
                        <StatusBadge
                          tone="warning"
                          label={t("lowStock", {
                            text: t("units", {
                              quantity: format.quantity(variant.stock),
                            }),
                          })}
                        />
                      ) : (
                        t("units", { quantity: format.quantity(variant.stock) })
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyText
                        value={variant.costAmount}
                        currency={variant.costCurrency}
                        locale={format.locale}
                      />
                    </TableCell>
                    {permissions.edit && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {variant.trackStock && variant.isActive && (
                            <IconButton
                              size="sm"
                              label={t("adjust.open", {
                                name: variantName(variant),
                              })}
                              onClick={() => setAdjusting(variant)}
                            >
                              <PackagePlus />
                            </IconButton>
                          )}
                          <IconButton
                            size="sm"
                            label={t("variant.edit", {
                              name: variantName(variant),
                            })}
                            onClick={() => setEditing(variant)}
                          >
                            <Pencil />
                          </IconButton>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-foreground/70 uppercase">
              {t("sheet.movements")}
            </h3>
            {variants.length > 1 && movementVariant && (
              <Select value={movementVariant.id} onValueChange={setChosenId}>
                <SelectTrigger
                  className="h-8 w-auto min-w-40"
                  aria-label={t("sheet.movementsOf")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variantName(variant)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {movements.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : movements.isError ? (
            <Alert variant="destructive">{t("loadError")}</Alert>
          ) : movements.data.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-foreground/70">
              {t("sheet.noMovements")}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("sheet.date")}</TableHead>
                    <TableHead>{t("sheet.type")}</TableHead>
                    <TableHead className="text-right">
                      {t("sheet.quantity")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.data.slice(0, MOVEMENTS_SHOWN).map((movement) => {
                    const quantity = Number(movement.quantity);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <DateText
                            value={movement.createdAt}
                            format="datetime"
                            locale={format.locale}
                            timeZone={TIME_ZONE}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{t(`movementTypes.${movement.type}`)}</span>
                            {movement.note && (
                              <span className="text-xs text-foreground/70">
                                {movement.note}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className={
                            quantity < 0
                              ? "text-right text-destructive tabular-nums"
                              : "text-right text-success tabular-nums"
                          }
                        >
                          {quantity > 0 ? "+" : "−"}
                          {format.quantity(String(Math.abs(quantity)))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </SheetBody>
      {permissions.edit && (
        <SheetFooter>
          <Button onClick={() => onEdit(data.id)}>
            <Pencil />
            {t("edit")}
          </Button>
        </SheetFooter>
      )}
      <StockAdjustDialog
        workspaceId={workspaceId}
        productName={data.name}
        variant={adjusting}
        onClose={() => setAdjusting(null)}
        onDone={(variant) => {
          setAdjusting(null);
          setChosenId(variant.id);
        }}
      />
      {editing && (
        <VariantFormDialog
          workspaceId={workspaceId}
          productName={data.name}
          variant={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
