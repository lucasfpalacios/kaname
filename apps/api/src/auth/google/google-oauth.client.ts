import { Injectable } from "@nestjs/common";

export const GOOGLE_AUTHORIZE_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

// Canje del código de autorización por el id_token, contra el endpoint de tokens de Google (con
// el code_verifier de PKCE). Es lo único que habla con Google; en los tests se reemplaza.
@Injectable()
export class GoogleOAuthClient {
  async exchangeCode(
    code: string,
    codeVerifier: string,
    credentials: GoogleCredentials,
  ): Promise<string> {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        code_verifier: codeVerifier,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: credentials.redirectUri,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Google rechazó el canje del código (${response.status})`,
      );
    }
    const body = (await response.json()) as { id_token?: unknown };
    if (typeof body.id_token !== "string") {
      throw new Error("Google no devolvió un id_token");
    }
    return body.id_token;
  }
}
