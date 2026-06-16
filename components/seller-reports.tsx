"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Summary {
  totalIncome: number;
  totalOrdersCount: number;
}

export default function SellerReports() {
  const [summary, setSummary] = React.useState<Summary | null>(null);

  React.useEffect(() => {
    fetch("/api/seller/reports")
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) {
          setSummary(data.summary);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Pendapatan (Bersih)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-extrabold text-green-600">
            {summary ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(summary.totalIncome) : "IDR 0"}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
            {summary ? summary.totalOrdersCount : 0} Transaksi
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
