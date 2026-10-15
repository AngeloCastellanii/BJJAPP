/** Credenciales solo desde env — nunca hardcodear en el código. */
export function getAuthCredentials() {
  const email = process.env.BJJAPP_AUTH_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.BJJAPP_AUTH_PASSWORD ?? "";
  return { email, password, configured: Boolean(email && password) };
}
