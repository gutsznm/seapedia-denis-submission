"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

interface Address {
  id: number;
  addressText: string;
}

export default function BuyerCheckout({ onCheckoutSuccess }: { onCheckoutSuccess: () => void }) {
  const [cart, setCart] = React.useState<CartData | null>(null);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState("");
  const [deliveryMethod, setDeliveryMethod] = React.useState("Regular");
  const [discountCode, setDiscountCode] = React.useState("");
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchCartAndAddresses = React.useCallback(async () => {
    try {
      const cartRes = await fetch("/api/buyer/cart");
      const addrRes = await fetch("/api/buyer/address");
      if (cartRes.ok && addrRes.ok) {
        const cartData = await cartRes.json();
        const addrData = await addrRes.json();
        setCart(cartData.cart);
        setAddresses(addrData.addresses || []);
        if (addrData.addresses && addrData.addresses.length > 0) {
          setSelectedAddressId(addrData.addresses[0].id.toString());
        }
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCartAndAddresses();
  }, [fetchCartAndAddresses]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedAddressId) {
      setError("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/buyer/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          addressId: parseInt(selectedAddressId, 10),
          discountCode: discountCode.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal checkout");
      onCheckoutSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal checkout";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <p className="text-center text-sm py-10">Memuat detail checkout...</p>;
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  let shippingFee = 10000;
  if (deliveryMethod === "Instant") shippingFee = 50000;
  if (deliveryMethod === "Next Day") shippingFee = 25000;

  const totalBeforeTax = subtotal + shippingFee;
  const taxAmount = totalBeforeTax * 0.12;
  const finalTotal = totalBeforeTax + taxAmount;

  return (
    <form onSubmit={handleCheckout} className="grid lg:grid-cols-3 gap-8">
      {/* Konfigurasi Checkout */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Alamat Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Belum ada alamat tersimpan. Tambahkan alamat di tab Alamat terlebih dahulu.
              </div>
            ) : (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full h-11 px-3 bg-background border rounded-lg text-sm"
              >
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.addressText}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Metode Pengiriman</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            {[
              { name: "Regular", fee: 10000 },
              { name: "Next Day", fee: 25000 },
              { name: "Instant", fee: 50000 }
            ].map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => setDeliveryMethod(m.name)}
                className={`p-3 border rounded-lg text-left text-xs space-y-1 focus:outline-none transition-all ${deliveryMethod === m.name ? "border-blue-600 bg-blue-50/50" : "hover:bg-slate-50"}`}
              >
                <p className="font-bold text-sm">{m.name}</p>
                <p className="text-muted-foreground font-semibold">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(m.fee)}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Kode Voucher / Promo</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Masukkan kode diskon (jika ada)"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Ringkasan & Submit */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Ringkasan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Biaya Pengiriman ({deliveryMethod})</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(shippingFee)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">PPN (12%)</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(taxAmount)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-bold">
              <span>Total Akhir</span>
              <span className="text-blue-600 text-base">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(finalTotal)}
              </span>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 text-xs font-bold mt-2">
              {isLoading ? "Memproses Order..." : "Bayar Sekarang"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
