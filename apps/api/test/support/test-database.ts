// Base de datos de los e2e: siempre una separada (kaname_test por defecto), nunca la de
// desarrollo. Se puede cambiar con TEST_DATABASE_URL, pero el nombre tiene que terminar en _test.
export const DEFAULT_TEST_DATABASE_URL =
  "postgresql://kaname:kaname@localhost:5434/kaname_test";

export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.endsWith("_test")) {
    throw new Error(
      `La base de los e2e tiene que terminar en _test (es "${name}"). Revisá TEST_DATABASE_URL.`,
    );
  }
  return url;
}
