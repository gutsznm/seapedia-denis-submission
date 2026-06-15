"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  return (
    <nav className="w-full border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        <div className="flex-shrink-0 flex items-center md:pl-10">
          <Image 
            src="/seapedia-logo.webp" 
            alt="Logo Seapedia" 
            width={150} 
            height={150} 
            priority 
            className="object-contain"
          />
        </div>
        <div className="relative flex-1 max-w-xl mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Cari barang di sini..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-base w-full"
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 md:pr-2">
          <Button className="h-12 px-5 font-medium" variant="outline" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button className="h-12 px-5 font-medium" asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
