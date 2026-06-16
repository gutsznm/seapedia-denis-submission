"use client";

import React from "react";
import ProductCard from "./product-card";

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  location: string;
  isFavorite?: boolean;
}

interface DBProduct {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  store?: {
    name: string;
  };
}

export default function ProductCatalogue() {
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          const mapped = data.products.map((p: DBProduct) => ({
            id: p.id.toString(),
            title: p.name,
            price: p.price,
            discountPrice: p.discountPrice || undefined,
            rating: 5.0, // default rating for catalog display
            reviewsCount: 0,
            image: p.image,
            location: p.store?.name || "Indonesia",
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

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
      {products.length === 0 ? (
        <div className="p-10 border border-dashed rounded-xl text-center bg-slate-50 dark:bg-slate-900/20">
          <p className="text-sm text-muted-foreground">Belum ada produk dari seller.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </section>
  );
}