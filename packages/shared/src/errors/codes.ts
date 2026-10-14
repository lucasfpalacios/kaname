// Códigos de error de validación. Los schemas no traen texto: la web los traduce
// con la clave Errors.<código> de sus mensajes (es.json / en.json).
export const ErrorCode = {
  moneyInvalid: "money_invalid",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
