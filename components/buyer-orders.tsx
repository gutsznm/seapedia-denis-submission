"use client";

import * as React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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
  items: {
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
  statusHistory: {
    id: number;
    status: string;
    timestamp: string;
  }[];
}

export default function BuyerOrders() {
  const [orders, setOrders] = React.useState<Order[]>([]);

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/buyer/orders");
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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Riwayat Pesanan Anda</h3>
      {orders.length === 0 ? (
        <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
          <p className="text-sm text-muted-foreground">Belum ada riwayat pesanan.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-sm border border-slate-100">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">ID Pesanan: #{order.id}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                    {order.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Items List */}
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

                {/* Pricing Summary */}
                <div className="border-t pt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Diskon</span>
                      <span>-{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Ongkos Kirim ({order.deliveryMethod})</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN (12%)</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                    <span>Total Pembayaran</span>
                    <span className="text-blue-600">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Status History Timeline */}
                <div className="border-t pt-3 space-y-2">
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Pelacakan Status:</p>
                  <div className="flex flex-col gap-1.5 pl-2 border-l border-slate-200">
                    {order.statusHistory.map((h) => (
                      <div key={h.id} className="text-[10px] flex justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-300">{h.status}</span>
                        <span className="text-muted-foreground">{new Date(h.timestamp).toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
