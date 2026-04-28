"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  X,
  MessageCircle,
  AudioWaveform,
  LogOut,
  LogIn,
  ArrowLeft,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserProfileDropdown } from "@/components/auth/user-profile-dropdown";
import { useSession } from "@/lib/contexts/session-context";

export function Header() {
  const { isAuthenticated, logout, user } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log("Header: Auth state: isAuthenticated =", isAuthenticated);
  const navItems = [
    { href: "/features", label: "Features" },
    { href: "/about", label: "About Aura" },
  ];

  const pathname = usePathname() || '';
  const isTherapyPage = pathname.startsWith('/therapy');

  return (
    <div className="w-full fixed top-0 z-50 bg-[#ffffff] backdrop-blur supports-[backdrop-filter]:bg-[#ffffff]/60">
      <div className="absolute inset-0 border-b border-[#b8cfe0]" />
      <header className="relative max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 cursor-default">
              <AudioWaveform className="h-7 w-7 text-[#297194] animate-pulse-gentle" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-[#297194]">
                  Aura3.0
                </span>
                <span className="text-xs text-muted-foreground">
                  Your mental health Companion{" "}
                </span>
              </div>
            </div>
          ) : (
            <Link
              href="/"
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            >
              <AudioWaveform className="h-7 w-7 text-[#297194] animate-pulse-gentle" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-[#297194]">
                  Aura3.0
                </span>
                <span className="text-xs text-muted-foreground">
                  Your mental health Companion{" "}
                </span>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-1">
              {!isAuthenticated && navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#297194] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
              {isAuthenticated && isTherapyPage && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-bold text-[#297194] hover:text-[#1e5870] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">

              {isAuthenticated ? (
                <UserProfileDropdown />
              ) : (
                <SignInButton />
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/10">
            <nav className="flex flex-col space-y-1 py-4">
              {!isAuthenticated && navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && isTherapyPage && (
                <Link
                  href="/dashboard"
                  className="px-4 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-md transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
