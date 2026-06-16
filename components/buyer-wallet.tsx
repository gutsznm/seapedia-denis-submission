"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface WalletData {
  id: number;
  balance: number;
  transactions: {
    id: number;
    amount: number;
    type: string;
    createdAt: string;
  }[];
}

export default function BuyerWallet() {
  const [wallet, setWallet] = React.useState<WalletData | null>(null);
  const [topupAmount, setTopupAmount] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchWallet = React.useCallback(async () => {
    try {
      const res = await fetch("/api/buyer/wallet");
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWallet();
  }, [fetchWallet]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const val = parseFloat(topupAmount);
    if (isNaN(val) || val <= 0) {
      setError("Jumlah top up harus positif.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/buyer/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: val })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal top up");
      setSuccess(`Berhasil top up ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)}!`);
      setTopupAmount("");
      setWallet(data.wallet);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal top up";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Saldo Dompet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-blue-600">
              {wallet ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(wallet.balance) : "IDR 0"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Up Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTopup} className="space-y-4">
              {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
              {success && <div className="p-3 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg">{success}</div>}
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder="Jumlah Top Up (Contoh: 100000)"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                  min={1}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Memproses..." : "Top Up Sekarang"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {!wallet || wallet.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat transaksi.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {wallet.transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/10">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {tx.type === "TOPUP" ? "Top Up Saldo" : tx.type === "PAYMENT" ? "Pembayaran Pesanan" : tx.type === "REFUND" ? "Refund Pesanan" : "Penyesuaian Saldo"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className={`text-sm font-extrabold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount > 0 ? "+" : ""}{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(tx.amount)}
                    </p>
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
