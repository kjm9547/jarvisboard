import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { supabase } from "@/service/superbase";

const navItems = [
  { label: "뉴스", to: "/" },
  { label: "주식", to: "/stock" },
  { label: "유튜브", to: "/youtube" },
  { label: "지출", to: "/expense" },
];

export const Header = () => {
  const { isDark, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="z-9999 sticky top-0 w-full h-12.5 flex items-center px-5 border-b border-border bg-background/80 backdrop-blur-md">
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-base text-foreground mr-8 shrink-0"
      >
        <img
          src="/assets/icons/icon_512_32x32_circle_resized_32px.png"
          alt="Jarvis"
          className="h-7 w-7 rounded-full"
        />
        Jarvis
      </Link>

      <nav className="flex items-center gap-0.5 flex-1">
        {navItems.map(({ label, to }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "text-sm px-3 py-1.5 rounded-md transition-colors",
                isActive
                  ? "text-foreground font-medium bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          className="h-8 w-8"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="로그아웃"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
