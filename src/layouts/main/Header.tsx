import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { supabase } from "@/service/supabase";

const navItems = [
  { label: "뉴스", to: "/" },
  { label: "주식", to: "/stock" },
  { label: "유튜브", to: "/youtube" },
  { label: "지출", to: "/expense" },
  { label: "목표", to: "/goals" },
];

export const Header = () => {
  const { isDark, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="z-9999 sticky top-0 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center h-12.5 px-4 md:px-5">
        {/* 로고 */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-base text-foreground mr-4 md:mr-8 shrink-0"
        >
          <img
            src="/assets/icons/icon_512_32x32_circle_resized_32px.png"
            alt="Jarvis"
            className="h-7 w-7 rounded-full"
          />
          Jarvis
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
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

        <div className="flex-1 md:hidden" />

        {/* 우측 액션 */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="h-8 w-8"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="로그아웃"
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          {/* 모바일 햄버거 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-2 space-y-0.5">
          {navItems.map(({ label, to }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block text-sm px-3 py-2.5 rounded-md transition-colors",
                  isActive
                    ? "text-foreground font-semibold bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </Link>
            );
          })}
          <div className="border-t border-border pt-2 mt-2">
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-2 w-full text-sm px-3 py-2.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
