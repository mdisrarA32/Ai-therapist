"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";

export function UserProfileDropdown() {
  const { user, logout } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleEditProfileClick = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  if (!user) return null;

  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "AA";
  const avatarUrl = (user as any).profilePhoto;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="w-10 h-10 rounded-full bg-[#297194] flex items-center justify-center border border-[#D1E1F7] hover:border-[#1e5870] transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#297194] focus:ring-offset-2"
        aria-label="User Profile"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-[#ffffff] text-sm">{initials}</span>
        )}
      </button>

      {/* Level 1 Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#ffffff] border border-[#D1E1F7] shadow-xl rounded-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={handleEditProfileClick}
            className="w-full text-left px-4 py-2 hover:bg-[#D1E1F7] flex items-center gap-3 transition-colors text-sm font-medium text-[#1a4a5e]"
          >
            <User className="w-4 h-4 text-[#297194]" />
            Edit Profile
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 hover:bg-[#D1E1F7] flex items-center gap-3 transition-colors text-sm font-medium text-destructive"
          >
            <LogOut className="w-4 h-4 text-destructive" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
