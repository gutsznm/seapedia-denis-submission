"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Summary {
  totalSpending: number;
  totalOrders: number;
  completedOrders: number;
}

export default function BuyerReports() {
  const [summary, setSummary] = React.useState<Summary | null>(null);

  React.useEffect(() => {
    fetch("/api/buyer/reports")
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) {
          setSummary(data.summary);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid sm:grid-cols-3 gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-extrabold text-blue-600">
            {summary ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(summary.totalSpending) : "IDR 0"}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
            {summary ? summary.totalOrders : 0} Pesanan
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Pesanan Selesai</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-extrabold text-green-600">
            {summary ? summary.completedOrders : 0} Pesanan
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
