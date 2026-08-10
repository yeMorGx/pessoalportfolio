export function isAllowedAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) {
    return true;
  }

  return email?.trim().toLowerCase() === adminEmail;
}
