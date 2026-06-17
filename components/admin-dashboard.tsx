"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Store, Package, ClipboardList, Tag, Truck, AlertTriangle, PlusCircle
} from "lucide-react";

interface Counts {
  users: number;
  stores: number;
  products: number;
  orders: number;
  vouchers: number;
  promos: number;
  deliveries: number;
}

interface RecentOrder {
  id: number;
  status: string;
  totalAmount: number;
  deliveryMethod: string;
  createdAt: string;
  buyer: { username: string };
}

interface Voucher {
  id: number;
  code: string;
  discount: number;
  expiryDate: string;
  maxUsage: number;
  remainingUsage: number;
}

interface Promo {
  id: number;
  code: string;
  discount: number;
  expiryDate: string;
}

export default function AdminDashboard() {
  const [counts, setCounts] = React.useState<Counts | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
  const [vouchers, setVouchers] = React.useState<Voucher[]>([]);
  const [promos, setPromos] = React.useState<Promo[]>([]);
  const [tab, setTab] = React.useState<"overview" | "vouchers" | "promos" | "overdue">("overview");
  const [msg, setMsg] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Voucher form
  const [vCode, setVCode] = React.useState("");
  const [vDiscount, setVDiscount] = React.useState("");
  const [vExpiry, setVExpiry] = React.useState("");
  const [vMaxUsage, setVMaxUsage] = React.useState("");

  // Promo form
  const [pCode, setPCode] = React.useState("");
  const [pDiscount, setPDiscount] = React.useState("");
  const [pExpiry, setPExpiry] = React.useState("");

  const fetchMonitoring = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/monitoring");
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts);
        setRecentOrders(data.recentOrders || []);
      }
    } catch {}
  }, []);

  const fetchVouchers = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vouchers");
      if (res.ok) {
        const data = await res.json();
        setVouchers(data.vouchers || []);
      }
    } catch {}
  }, []);

  const fetchPromos = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promos");
      if (res.ok) {
        const data = await res.json();
        setPromos(data.promos || []);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    fetchMonitoring();
    fetchVouchers();
    fetchPromos();
  }, [fetchMonitoring, fetchVouchers, fetchPromos]);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: vCode, discount: parseFloat(vDiscount), expiryDate: vExpiry, maxUsage: parseInt(vMaxUsage, 10) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("Voucher berhasil dibuat!");
      setVCode(""); setVDiscount(""); setVExpiry(""); setVMaxUsage("");
      fetchVouchers();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal membuat voucher.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pCode, discount: parseFloat(pDiscount), expiryDate: pExpiry })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("Promo berhasil dibuat!");
      setPCode(""); setPDiscount(""); setPExpiry("");
      fetchPromos();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal membuat promo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateOverdue = async () => {
    setMsg("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/simulate-overdue", { method: "POST" });
      const data = await res.json();
      setMsg(data.message || "Simulasi overdue selesai.");
      fetchMonitoring();
    } catch {
      setMsg("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const statCards = counts ? [
    { label: "Total Users", value: counts.users, icon: Users, color: "text-blue-600" },
    { label: "Total Toko", value: counts.stores, icon: Store, color: "text-purple-600" },
    { label: "Total Produk", value: counts.products, icon: Package, color: "text-orange-600" },
    { label: "Total Order", value: counts.orders, icon: ClipboardList, color: "text-green-600" },
    { label: "Voucher", value: counts.vouchers, icon: Tag, color: "text-pink-600" },
    { label: "Promo", value: counts.promos, icon: Tag, color: "text-rose-600" },
    { label: "Pengiriman", value: counts.deliveries, icon: Truck, color: "text-cyan-600" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b gap-4 overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "vouchers", label: "Voucher" },
          { id: "promos", label: "Promo" },
          { id: "overdue", label: "Overdue Handling" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id as typeof tab); setMsg(""); }}
            className={`pb-2.5 text-sm font-semibold border-b-2 px-1 whitespace-nowrap transition-all ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`p-3 text-xs rounded border ${msg.includes("berhasil") || msg.includes("selesai") || msg.includes("complete") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {msg}
        </div>
      )}

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{s.label}</p>
                      <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">5 Pesanan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesanan.</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex justify-between items-center text-xs border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">#{o.id} - {o.buyer.username}</p>
                        <p className="text-muted-foreground">{o.deliveryMethod} · {new Date(o.createdAt).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{fmt(o.totalAmount)}</p>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* VOUCHERS */}
      {tab === "vouchers" && (
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Buat Voucher Baru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateVoucher} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Kode Voucher</label>
                    <Input placeholder="VOUCHER123" value={vCode} onChange={(e) => setVCode(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Jumlah Diskon (IDR)</label>
                    <Input type="number" placeholder="50000" value={vDiscount} onChange={(e) => setVDiscount(e.target.value)} required min={1} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Tanggal Kadaluarsa</label>
                    <Input type="date" value={vExpiry} onChange={(e) => setVExpiry(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Maksimum Penggunaan</label>
                    <Input type="number" placeholder="100" value={vMaxUsage} onChange={(e) => setVMaxUsage(e.target.value)} required min={1} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Membuat..." : "Buat Voucher"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-base font-bold mb-4">Daftar Voucher</h3>
            {vouchers.length === 0 ? (
              <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
                <p className="text-sm text-muted-foreground">Belum ada voucher.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vouchers.map((v) => (
                  <Card key={v.id} className="shadow-sm border border-slate-100">
                    <CardContent className="p-4 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-extrabold text-blue-600">{v.code}</p>
                        <p className="text-xs text-muted-foreground">Diskon: {fmt(v.discount)}</p>
                        <p className="text-xs text-muted-foreground">Kadaluarsa: {new Date(v.expiryDate).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">Sisa Penggunaan</p>
                        <p className="text-lg font-extrabold text-green-600">{v.remainingUsage} / {v.maxUsage}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMOS */}
      {tab === "promos" && (
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Buat Promo Baru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePromo} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Kode Promo</label>
                    <Input placeholder="PROMO2025" value={pCode} onChange={(e) => setPCode(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Jumlah Diskon (IDR)</label>
                    <Input type="number" placeholder="25000" value={pDiscount} onChange={(e) => setPDiscount(e.target.value)} required min={1} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Tanggal Kadaluarsa</label>
                    <Input type="date" value={pExpiry} onChange={(e) => setPExpiry(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Membuat..." : "Buat Promo"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-base font-bold mb-4">Daftar Promo</h3>
            {promos.length === 0 ? (
              <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
                <p className="text-sm text-muted-foreground">Belum ada promo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {promos.map((p) => (
                  <Card key={p.id} className="shadow-sm border border-slate-100">
                    <CardContent className="p-4 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-extrabold text-rose-600">{p.code}</p>
                        <p className="text-xs text-muted-foreground">Diskon: {fmt(p.discount)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Kadaluarsa: {new Date(p.expiryDate).toLocaleDateString("id-ID")}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OVERDUE */}
      {tab === "overdue" && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-amber-100 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Simulasi & Penanganan Overdue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs space-y-2 bg-white dark:bg-slate-900 p-4 rounded-lg border">
                <p className="font-bold text-sm mb-2">Aturan SLA Pengiriman:</p>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold">Instant</span>
                  <span className="text-muted-foreground">1 hari setelah checkout</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-semibold">Next Day</span>
                  <span className="text-muted-foreground">2 hari setelah checkout</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold">Regular</span>
                  <span className="text-muted-foreground">5 hari setelah checkout</span>
                </div>
              </div>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <p>Ketika simulasi dijalankan:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Order yang melebihi SLA otomatis diubah ke status <strong>Dikembalikan</strong></li>
                  <li>Saldo buyer dikembalikan ke dompet</li>
                  <li>Stok produk dipulihkan</li>
                  <li>Status pengiriman diperbarui</li>
                </ul>
              </div>
              <Button
                onClick={handleSimulateOverdue}
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 font-bold"
              >
                {isLoading ? "Memproses..." : "Jalankan Pengecekan Overdue Sekarang"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
