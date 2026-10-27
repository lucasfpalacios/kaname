// Después de setup-env.ts, solo en los e2e: la app y los helpers usan la base de prueba. Pisa el
// DATABASE_URL del .env local (la de desarrollo).
import { testDatabaseUrl } from "./test-database.js";

process.env.DATABASE_URL = testDatabaseUrl();
