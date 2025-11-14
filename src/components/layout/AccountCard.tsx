/**
 * AccountCard component for teacher sidebar
 * Refined compact account card per .cursorrules
 * Single horizontal action row: Konto | Logg ut
 * Improved spacing and elegant vertical divider
 */

import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import { Card } from "@/components/ui/card";

export function AccountCard() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  // Generate initials from user name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleGoToAccount = () => {
    navigate(ROUTES.TEACHER.ACCOUNT);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Card className="w-full rounded-3xl border border-border/30 bg-white/90 backdrop-blur px-3.5 py-3 shadow-sm">
      {/* Top: Avatar + Name + Email */}
      <div className="flex items-start gap-3">
        {/* Avatar with initials */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
          {getInitials(user?.name)}
        </div>

        {/* Right column: Name, email, and actions */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Name and email */}
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.name || "Bruker"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || "lærer@example.com"}
            </p>
          </div>

          {/* Actions row with vertical divider */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 pb-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
              onClick={handleGoToAccount}
            >
              <User className="h-3.5 w-3.5" />
              <span>Konto</span>
            </button>

            {/* Elegant vertical divider */}
            <div className="h-3.5 w-px bg-border/40" />

            <button
              type="button"
              className="inline-flex items-center gap-1.5 hover:text-destructive transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logg ut</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
