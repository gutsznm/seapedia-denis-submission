import React from "react";
import ProductCard from "./product-card";
import { DUMMY_PRODUCTS } from "@/shared/dummy";

export default function ProductCatalogue() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Katalog */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Rekomendasi Produk Populer
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Koleksi hasil laut dan peralatan kemaritiman terbaik untukmu.
          </p>
        </div>
        
        <button className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Lihat Semua
        </button>
      </div>

      {/* Grid Katalog Produk Responsif */}
      {/* HP: 2 kolom (grid-cols-2) | Tablet: 3 kolom (md:grid-cols-3) | Desktop: 4 kolom (lg:grid-cols-4) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {DUMMY_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </section>
  );
}