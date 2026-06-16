import React from "react";
import { Button } from "@/components/ui/button";
import { Anchor, Ship, Fish } from "lucide-react";
import Link from "next/link";
import { Promo } from "./promo-card";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-background py-8 md:py-12 lg:py-16">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 -z-10 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute top-8 left-[5%] text-blue-300 animate-bounce duration-1000 hidden sm:block">
          <Anchor size={32} />
        </div>
        <div className="absolute bottom-8 right-[5%] text-sky-400 animate-pulse hidden sm:block">
          <Ship size={36} />
        </div>
        <div className="absolute top-1/4 right-[5%] text-blue-400 hidden lg:block">
          <Fish size={28} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left space-y-4 md:space-y-5 max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-chart-1/30 bg-chart-1/10 px-3 py-1 text-xs font-medium text-chart-1 backdrop-blur-sm dark:border-chart-1/40 dark:bg-chart-1/20 dark:text-chart-1/90">
              <span className="flex h-1.5 w-1.5 rounded-full bg-chart-1 animate-pulse" />
              The best marketplace
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="bg-gradient-to-b from-chart-1 via-chart-3 to-chart-5 bg-clip-text text-transparent">
              Jelajahi Dunia Kelautan Bersama
            </span>{" "}
              <Image
                src="/seapedia-logo.webp"
                alt="Logo Seapedia"
                width={140}
                height={40}  
                priority
                className="inline-block align-middle h-[1.2em] w-auto object-contain ml-1 -mt-1"
              />
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-md font-light leading-relaxed max-w-xl">
              Hubungkan langsung dengan nelayan lokal dan supplier terbaik.
              Dapatkan hasil laut segar, bibit unggul, hingga peralatan
              kemaritiman terlengkap.
            </p>
            <Button
              className="h-10 px-5 text-sm font-medium shadow-sm w-full sm:w-auto"
              asChild
            >
              <Link href="#">Mulai Berbelanja</Link>
            </Button>
            <div className="grid grid-cols-3 gap-4 pt-4 w-full border-t border-slate-100 dark:border-slate-800 text-center lg:text-left">
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  10k+
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Nelayan & Mitra
                </p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  50t+
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Produk Segar
                </p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  34
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Provinsi Terlayani
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 w-full max-w-md lg:max-w-none mx-auto">
            <div className="w-full [&_img]:object-cover">
              <Promo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
