import { Currency, moneySchema } from "@kaname/shared";
import { ThemeToggle } from "./theme-toggle";

// Página de prueba de los fundamentos del UI Kit (tokens, fuentes, tema).
// Se reemplaza por el launcher en la Fase 2.
const monto = moneySchema.parse({ amount: "1234567.50", currency: Currency.ARS });
const montoFormateado = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: monto.currency,
}).format(monto.amount as Intl.StringNumericLiteral);

const swatches = [
  "bg-background",
  "bg-card",
  "bg-primary",
  "bg-accent",
  "bg-accent-soft",
  "bg-success",
  "bg-warning",
  "bg-destructive",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Kaname</h1>
        <ThemeToggle />
      </div>

      <p className="text-base">
        Administrá todos tus emprendimientos desde un solo panel: productos,
        pedidos, compras y proyectos, con la misma base para cada espacio.
      </p>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-label">
          Ventas del mes
        </p>
        <p className="mt-2 whitespace-nowrap text-2xl font-bold tabular-nums text-primary">
          {montoFormateado}
        </p>
      </div>

      <ul className="grid grid-cols-4 gap-3" aria-label="Paleta">
        {swatches.map((clase) => (
          <li key={clase} className="flex flex-col gap-1 text-xs">
            <span className={`h-10 rounded-md border border-border ${clase}`} />
            {clase.replace("bg-", "")}
          </li>
        ))}
      </ul>
    </main>
  );
}
