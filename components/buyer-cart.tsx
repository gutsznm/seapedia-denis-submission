"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice: number | null;
    image: string;
    store: {
      name: string;
    };
  };
}

interface CartData {
  id: number;
  storeId: number | null;
  items: CartItem[];
}

export default function BuyerCart({ onCheckoutNavigate }: { onCheckoutNavigate: () => void }) {
  const [cart, setCart] = React.useState<CartData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchCart = React.useCallback(async () => {
    try {
      const res = await fetch("/api/buyer/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId: number, newQty: number) => {
    try {
      const res = await fetch(`/api/buyer/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        fetchCart();
      }
    } catch {}
  };

  const deleteItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/buyer/cart/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCart();
      }
    } catch {}
  };

  const clearCart = async () => {
    if (!confirm("Kosongkan semua barang di keranjang?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/buyer/cart", { method: "DELETE" });
      if (res.ok) {
        fetchCart();
      }
    } catch {}
    setIsLoading(false);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/10">
        <ShoppingBag className="h-12 w-12 text-slate-400 mb-2" />
        <p className="text-sm text-muted-foreground">Keranjang belanja Anda kosong.</p>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* List Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
            Toko Aktif: <span className="font-bold">{cart.items[0]?.product.store.name}</span>
          </p>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8" onClick={clearCart} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-1" />
            Kosongkan Keranjang
          </Button>
        </div>

        <div className="space-y-3">
          {cart.items.map((item) => {
            const price = item.product.discountPrice || item.product.price;
            return (
              <Card key={item.id} className="shadow-sm border border-slate-100 flex items-center p-4 gap-4">
                <div className="h-16 w-16 relative rounded overflow-hidden bg-slate-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 rounded border flex items-center justify-center hover:bg-slate-50 font-bold active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 rounded border flex items-center justify-center hover:bg-slate-50 font-bold active:scale-95"
                  >
                    +
                  </button>
                  <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Ringkasan Belanja */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Ringkasan Belanja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground text-xs">Total Harga ({cart.items.length} Barang)</span>
              <span className="font-bold">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(subtotal)}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <Button className="w-full h-11 text-xs font-bold" onClick={onCheckoutNavigate}>
                Lanjut ke Checkout
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
