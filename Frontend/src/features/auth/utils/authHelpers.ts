import type { Role, User } from "../types";

export function getHomeRouteForRole(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "WORKER":
      return "/worker";
    case "ORGANISATION":
      return "/organisation";
    case "CUSTOMER":
    default:
      return "/user/home";
  }
}

export function getRoleLabel(user: User) {
  switch (user.role) {
    case "ADMIN":
      return "Admin";
    case "WORKER":
      return "Worker";
    case "ORGANISATION":
      return "Organisation";
    case "CUSTOMER":
    default:
      return "customer";
  }
}
