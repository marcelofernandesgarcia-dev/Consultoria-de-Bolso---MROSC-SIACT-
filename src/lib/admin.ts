export const ADMIN_EMAILS = ['marcelofernandesgarcia@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
