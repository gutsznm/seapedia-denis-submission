"use client";

import * as React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  items: OrderItem[];
  statusHistory: {
    id: number;
    status: string;
    timestamp: string;
  }[];
}

export default function SellerOrders() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [msg, setMsg] = React.useState("");

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/seller/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const handleProcessOrder = async (orderId: number) => {
    setMsg("");
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/process`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Pesanan #${orderId} berhasil diproses!`);
        fetchOrders();
      } else {
        setMsg(data.error || "Gagal memproses pesanan.");
      }
    } catch {
      setMsg("Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Daftar Pesanan Masuk</h3>
      </div>
      {msg && (
        <div className={`p-3 text-xs rounded border ${msg.includes("berhasil") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {msg}
        </div>
      )}
      {orders.length === 0 ? (
        <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
          <p className="text-sm text-muted-foreground">Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-sm border border-slate-100">
              <CardHeader className="pb-3 border-b flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">ID Pesanan: #{order.id}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                    {order.status}
                  </span>
                  {order.status === "Sedang Dikemas" && (
                    <Button size="sm" className="text-xs h-8 font-bold" onClick={() => handleProcessOrder(order.id)}>
                      Proses & Kirim
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.product.name} <span className="text-muted-foreground">x{item.quantity}</span>
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Subtotal Pesanan:</span>
                  <span className="text-blue-600 font-bold">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.subtotal)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
