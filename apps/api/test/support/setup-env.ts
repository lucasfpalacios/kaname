// Corre antes de cada archivo de test (setupFiles de vitest), antes de importar AppModule:
// ConfigModule valida el entorno al importarse, así que las variables tienen que estar antes.
// El .env local se carga primero (DATABASE_URL de los e2e); lo demás se fija para que los tests
// sean deterministas. Un archivo puede cambiar alguna con vi.hoisted (ver register.spec.ts).
import "dotenv/config";

process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET ??= "secreto-de-prueba-de-al-menos-32-caracteres";
process.env.WEB_ORIGIN ??= "http://localhost:3000";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5434/test";
process.env.LOGIN_RATE_LIMIT = "5";
process.env.LOGIN_RATE_WINDOW_SECONDS = "60";
process.env.LOGIN_EMAIL_RATE_LIMIT = "10";
process.env.LOGIN_EMAIL_RATE_WINDOW_SECONDS = "900";
// Como detrás del proxy de Next: la IP del cliente llega en su header con este secreto (ver
// test/support/client-ip.ts).
process.env.PROXY_SHARED_SECRET =
  "secreto-del-proxy-de-prueba-de-32-caracteres";
process.env.REGISTRATION_ENABLED = "false";
// Nunca las credenciales reales del .env: Google se reemplaza por un doble (FakeGoogle).
process.env.GOOGLE_CLIENT_ID = "cliente-de-prueba.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = "secreto-de-prueba";
process.env.GOOGLE_REDIRECT_URI =
  "http://localhost:3000/api/auth/google/callback";
