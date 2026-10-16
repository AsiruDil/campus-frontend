export function roleHome(role) {
  if (role === "superadmin") return "/super-admin";
  if (role === "admin" || role === "madam") return "/admin";
  return "/home";
}
