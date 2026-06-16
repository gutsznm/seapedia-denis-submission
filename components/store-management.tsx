"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StoreManagement({ onStoreCreated }: { onStoreCreated: () => void }) {
  const [storeName, setStoreName] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!storeName.trim()) {
      setError("Nama toko wajib diisi.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: storeName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat toko.");
      }
      setSuccess("Toko berhasil dibuat!");
      onStoreCreated();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat toko.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Buat Toko Anda</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          {success && <div className="p-3 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg">{success}</div>}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Nama Toko</label>
            <Input
              type="text"
              placeholder="Masukkan nama toko Anda (Unik)"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Membuat..." : "Buat Toko"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
