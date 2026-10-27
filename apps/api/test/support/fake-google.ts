// Reemplaza a GoogleOAuthClient en los tests: en vez de canjear el código contra Google, devuelve
// un id_token armado con los claims que el test le asignó a ese código.
export class FakeGoogle {
  private readonly responses = new Map<string, Record<string, unknown>>();
  readonly exchanges: { code: string; codeVerifier: string }[] = [];

  /** Lo que Google "devuelve" al canjear `code`. */
  respond(code: string, claims: Record<string, unknown>) {
    this.responses.set(code, claims);
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<string> {
    this.exchanges.push({ code, codeVerifier });
    const claims = this.responses.get(code);
    if (!claims) throw new Error(`Google rechazó el canje del código (400)`);
    const part = (value: object) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${part({ alg: "RS256" })}.${part(claims)}.firma`;
  }
}
