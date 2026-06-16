"use client";

import React from "react";
import Image from "next/image";
import { Star, Heart, ShoppingCart, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/shared/dummy";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Fungsi format rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Hitung persentase diskon
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      
      {/* Area Gambar */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badge Diskon */}
        {product.discountPrice && (
          <span className="absolute top-2 left-2 z-10 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {discountPercentage}% OFF
          </span>
        )}

        {/* Tombol Favorit (Heart) */}
        <button className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 text-slate-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500 shadow-sm">
          <Heart className={`h-4 w-4 ${product.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      {/* Detail Konten */}
      <CardContent className="p-3">
        {/* Judul Produk - Batasi maksimal 2 baris agar rapi */}
        <h3 className="line-clamp-2 h-10 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Info Harga */}
        <div className="mt-2 flex flex-col">
          {product.discountPrice ? (
            <>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {formatRupiah(product.discountPrice)}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                {formatRupiah(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>

        {/* Rating & Ulasan */}
        <div className="mt-2 flex items-center gap-1 text-[11px] sm:text-xs">
          <div className="flex items-center text-amber-500">
            <Star className="h-3 w-3 fill-amber-500" />
            <span className="ml-1 font-semibold text-slate-700 dark:text-slate-300">
              {product.rating}
            </span>
          </div>
          <span className="text-muted-foreground">({product.reviewsCount})</span>
        </div>
      </CardContent>

      {/* Bagian Bawah: Lokasi Toko & CTA */}
      <CardFooter className="flex items-center justify-between border-t border-slate-50 p-3 pt-2 dark:border-slate-900">
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground max-w-[70%]">
          <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
          <span className="truncate">{product.location}</span>
        </div>

        {/* Tombol Tambah ke Keranjang */}
        <Button size="icon" className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-transform active:scale-95">
          <ShoppingCart className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>

    </Card>
  );
}