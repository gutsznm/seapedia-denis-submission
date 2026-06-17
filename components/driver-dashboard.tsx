"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Package, CheckCircle } from "lucide-react";

interface Job {
  id: number;
  deliveryMethod: string;
  deliveryFee: number;
  status: string;
  createdAt: string;
  buyer: { username: string };
  items: { id: number; quantity: number; product: { name: string } }[];
}

interface DeliveryEntry {
  id: number;
  status: string;
  order: {
    id: number;
    deliveryMethod: string;
    deliveryFee: number;
    status: string;
    createdAt: string;
    items: { id: number; quantity: number; product: { name: string } }[];
    statusHistory: { id: number; status: string; timestamp: string }[];
  };
}

export default function DriverDashboard() {
  const [availableJobs, setAvailableJobs] = React.useState<Job[]>([]);
  const [activeDelivery, setActiveDelivery] = React.useState<DeliveryEntry | null>(null);
  const [history, setHistory] = React.useState<DeliveryEntry[]>([]);
  const [totalEarnings, setTotalEarnings] = React.useState(0);
  const [tab, setTab] = React.useState<"available" | "active" | "history">("available");
  const [msg, setMsg] = React.useState("");

  const fetchJobs = React.useCallback(async () => {
    try {
      const res = await fetch("/api/driver/jobs");
      if (res.ok) {
        const data = await res.json();
        setAvailableJobs(data.jobs || []);
      }
    } catch {}
  }, []);

  const fetchDashboard = React.useCallback(async () => {
    try {
      const res = await fetch("/api/driver/dashboard");
      if (res.ok) {
        const data = await res.json();
        setActiveDelivery(data.active || null);
        setHistory(data.history || []);
        setTotalEarnings(data.totalEarnings || 0);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    fetchJobs();
    fetchDashboard();
  }, [fetchJobs, fetchDashboard]);

  const handleTakeJob = async (orderId: number) => {
    setMsg("");
    try {
      const res = await fetch(`/api/driver/jobs/${orderId}/take`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg("Berhasil mengambil pekerjaan!");
        fetchJobs();
        fetchDashboard();
        setTab("active");
      } else {
        setMsg(data.error || "Gagal mengambil pekerjaan.");
      }
    } catch {
      setMsg("Terjadi kesalahan.");
    }
  };

  const handleCompleteJob = async (orderId: number) => {
    setMsg("");
    try {
      const res = await fetch(`/api/driver/jobs/${orderId}/complete`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg("Pekerjaan selesai!");
        fetchDashboard();
        setTab("history");
      } else {
        setMsg(data.error || "Gagal menyelesaikan pekerjaan.");
      }
    } catch {
      setMsg("Terjadi kesalahan.");
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-green-600">{fmt(totalEarnings)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">10% dari biaya pengiriman</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Job Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-blue-600">{availableJobs.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Job Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
              {history.filter((h) => h.status === "Pesanan Selesai").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notification */}
      {msg && (
        <div className={`p-3 text-xs rounded border ${msg.includes("Berhasil") || msg.includes("selesai") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b gap-4">
        {[
          { id: "available", label: "Job Tersedia" },
          { id: "active", label: "Job Aktif" },
          { id: "history", label: "Riwayat Job" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "available" | "active" | "history")}
            className={`pb-2.5 text-sm font-semibold border-b-2 px-1 transition-all ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Available Jobs */}
      {tab === "available" && (
        <div className="space-y-4">
          {availableJobs.length === 0 ? (
            <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
              <Truck className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada job pengiriman tersedia.</p>
            </div>
          ) : (
            availableJobs.map((job) => (
              <Card key={job.id} className="shadow-sm border border-slate-100">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground">Order #{job.id}</p>
                      <p className="text-xs font-semibold mt-0.5">Pembeli: {job.buyer.username}</p>
                      <p className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString("id-ID")}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                        {job.deliveryMethod}
                      </span>
                      <p className="text-xs font-bold text-green-600 mt-1">
                        Pendapatan: {fmt(job.deliveryFee * 0.1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    {job.items.map((item) => (
                      <p key={item.id} className="text-slate-600 dark:text-slate-400">
                        {item.product.name} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  <Button size="sm" className="w-full font-bold" onClick={() => handleTakeJob(job.id)}>
                    <Package className="h-4 w-4 mr-1" />
                    Ambil Job Ini
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Active Job */}
      {tab === "active" && (
        <div>
          {!activeDelivery ? (
            <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
              <Truck className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada job aktif saat ini.</p>
            </div>
          ) : (
            <Card className="shadow-sm border border-blue-100 bg-blue-50/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{activeDelivery.order.id}</p>
                    <p className="text-sm font-bold mt-0.5">Sedang Dalam Pengiriman</p>
                    <p className="text-xs text-muted-foreground">{activeDelivery.order.deliveryMethod}</p>
                  </div>
                  <p className="text-xs font-bold text-green-600">
                    Pendapatan: {fmt(activeDelivery.order.deliveryFee * 0.1)}
                  </p>
                </div>
                <div className="text-xs space-y-1">
                  {activeDelivery.order.items.map((item) => (
                    <p key={item.id} className="text-slate-600">{item.product.name} x{item.quantity}</p>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground">Status Perjalanan:</p>
                  {activeDelivery.order.statusHistory.map((h) => (
                    <div key={h.id} className="flex justify-between text-[10px]">
                      <span className="font-semibold">{h.status}</span>
                      <span className="text-muted-foreground">{new Date(h.timestamp).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full font-bold bg-green-600 hover:bg-green-700" onClick={() => handleCompleteJob(activeDelivery.order.id)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Konfirmasi Pesanan Terkirim
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Job History */}
      {tab === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
              <p className="text-sm text-muted-foreground">Belum ada riwayat pengiriman.</p>
            </div>
          ) : (
            history.map((d) => (
              <Card key={d.id} className="shadow-sm border border-slate-100">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Order #{d.order.id}</p>
                      <p className="text-xs font-semibold">{d.order.deliveryMethod}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{d.status}</span>
                      <p className="text-xs font-bold text-green-600 mt-1">{fmt(d.order.deliveryFee * 0.1)}</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    {d.order.items.map((item) => (
                      <p key={item.id} className="text-slate-600">{item.product.name} x{item.quantity}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
