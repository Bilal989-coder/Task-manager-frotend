export function roleLabel(role) {
  if (role === "admin") return "Manager";
  if (role === "member") return "Team Member";
  return role || "";
}
