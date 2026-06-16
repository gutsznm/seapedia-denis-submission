"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [session, setSession] = React.useState<{
    id: number;
    username: string;
    email: string;
    roles: string[];
    activeRole: string | null;
    walletBalance: number;
    hasStore: boolean;
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setSession(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    window.location.href = "/";
  };

  const handleRoleChange = async (role: string) => {
    const res = await fetch("/api/auth/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeRole: role }),
    });
    if (res.ok) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <nav className="w-full border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
        
        {/* LOGO */}
        <div className="flex-shrink-0 flex items-center md:pl-5">
          <Link href="/">
            <Image 
              src="/seapedia-logo.webp" 
              alt="Logo Seapedia" 
              width={120} 
              height={120} 
              priority 
              className="object-contain cursor-pointer"
            />
          </Link>
        </div>

        {!session && (
          <div className="relative flex-1 max-w-xl mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Cari barang di sini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-sm w-full"
            />
          </div>
        )}

        {session && <div className="flex-1" />}

        <div className="flex items-center gap-3 flex-shrink-0 md:pr-2">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline">
                Hi, <span className="font-semibold text-foreground">{session.username}</span>
              </span>
              
              {session.roles && session.roles.length > 0 && (
                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg">
                  <span className="text-xs font-semibold px-2">Role:</span>
                  <select 
                    value={session.activeRole || ""}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="text-xs bg-background border rounded px-1.5 py-0.5 font-bold cursor-pointer"
                  >
                    <option value="" disabled>Select active role</option>
                    {session.roles.map((r: string) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <Button asChild className="h-10 px-4" variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              
              <Button onClick={handleLogout} variant="ghost" size="icon" className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <Button className="h-10 px-5 font-medium" variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className="h-10 px-5 font-medium" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Header;