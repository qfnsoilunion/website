export type Role = "ADMIN" | "DEALER" | null;

export const roleManager = {
  get(): Role {
    return localStorage.getItem("role") as Role;
  },

  set(role: Role): void {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  },

  clear(): void {
    localStorage.removeItem("role");
  },

  getActorHeader(): string | null {
    const role = this.get();
    if (!role) return null;
    
    if (role === "ADMIN") {
      return "ADMIN";
    } else {
      // For dealer, we should ideally get the dealer name from context
      // For now, using a placeholder
      return "DEALER:Current Dealer";
    }
  },
};
