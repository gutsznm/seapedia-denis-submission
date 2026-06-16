"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Address {
  id: number;
  addressText: string;
}

export default function BuyerAddress() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [newAddress, setNewAddress] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchAddresses = React.useCallback(async () => {
    try {
      const res = await fetch("/api/buyer/address");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newAddress.trim()) {
      setError("Alamat tidak boleh kosong.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/buyer/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressText: newAddress.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah alamat");
      setSuccess("Alamat berhasil ditambahkan!");
      setNewAddress("");
      fetchAddresses();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menambah alamat";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tambah Alamat Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAddress} className="space-y-4">
              {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
              {success && <div className="p-3 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg">{success}</div>}
              <div className="space-y-1">
                <Input
                  type="text"
                  placeholder="Contoh: Jl. Kemaritiman No. 12, Jakarta"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Menyimpan..." : "Simpan Alamat"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Alamat Pengiriman Saya</CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada alamat tersimpan.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <div key={addr.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Alamat {idx + 1}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{addr.addressText}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
