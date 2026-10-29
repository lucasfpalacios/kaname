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
  // Link de recuperación vencido, ya usado o inexistente: un solo código para los tres.
  resetTokenInvalid: "reset_token_invalid",
  // Login con Google: algo falló en el flujo (state inválido, cancelado, canje rechazado...).
  oauthFailed: "oauth_failed",
  googleEmailUnverified: "google_email_unverified",
  // El email de Google no tiene cuenta y el registro está cerrado.
  googleRegistrationClosed: "google_registration_closed",
  forbidden: "forbidden",
  // Un POST con un body que no es JSON (defensa contra CSRF con formularios de otros sitios).
  unsupportedMediaType: "unsupported_media_type",
  // Espacios: slug con caracteres no permitidos o fuera de largo, slug ya usado en la cuenta y
  // color que no es #rrggbb.
  slugInvalid: "slug_invalid",
  slugTaken: "slug_taken",
  // El slug lo usa un espacio archivado de la cuenta: se puede restaurar (la respuesta trae su id).
  slugArchived: "slug_archived",
  // Otro cambio guardó lo mismo al mismo tiempo (un conflicto de unicidad que no es el slug).
  conflict: "conflict",
  colorInvalid: "color_invalid",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
