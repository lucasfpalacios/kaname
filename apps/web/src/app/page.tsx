import { Currency, moneySchema } from "@kaname/shared";

// Verificación temporal de @kaname/shared: se saca cuando haya un uso real.
const ejemplo = moneySchema.parse({ amount: "1500.00", currency: Currency.ARS });

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2">
      <h1 className="text-5xl font-semibold tracking-tight">Kaname</h1>
      <p className="text-sm opacity-60">
        {ejemplo.amount} {ejemplo.currency}
      </p>
    </main>
  );
}
