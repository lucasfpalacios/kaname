// Códigos de error de validación. Los schemas no traen texto: la web los traduce
// con la clave Errors.<código> de sus mensajes (es.json / en.json).
export const ErrorCode = {
  moneyInvalid: "money_invalid",
  emailInvalid: "email_invalid",
  passwordRequired: "password_required",
  // Login: el mismo código si el email no existe o la contraseña no coincide.
  invalidCredentials: "invalid_credentials",
  unauthenticated: "unauthenticated",
  tooManyAttempts: "too_many_attempts",
  validationFailed: "validation_failed",
  nameRequired: "name_required",
  passwordTooShort: "password_too_short",
  emailTaken: "email_taken",
  registrationDisabled: "registration_disabled",
  // Espacio inexistente, sin membresía o módulo apagado: siempre 404, sin revelar cuál.
  notFound: "not_found",
  forbidden: "forbidden",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
