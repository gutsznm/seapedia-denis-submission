"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StoreManagement from "@/components/store-management";
import ProductManagement from "@/components/product-management";
import SellerOrders from "@/components/seller-orders";
import BuyerWallet from "@/components/buyer-wallet";
import BuyerAddress from "@/components/buyer-address";
import BuyerCart from "@/components/buyer-cart";
import BuyerCheckout from "@/components/buyer-checkout";
import BuyerOrders from "@/components/buyer-orders";

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  activeRole: string | null;
  walletBalance: number;
  hasStore: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = React.useState<UserSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("wallet"); // wallet, address, cart, checkout, orders
  const [sellerTab, setSellerTab] = React.useState("products"); // products, orders

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/auth/login");
        } else {
          setSession(data.user);
        }
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleRoleSelect = async (role: string) => {
    const res = await fetch("/api/auth/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeRole: role }),
    });
    if (res.ok) {
      const data = await res.json();
      setSession((prev) => prev ? { ...prev, activeRole: data.activeRole } : null);
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {!session.activeRole ? (
          <div className="max-w-md mx-auto">
            <Card className="shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Choose Active Role</CardTitle>
                <CardDescription>
                  You own multiple roles. Please select one to begin your session.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {session.roles.map((role: string) => (
                  <Button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full h-12 text-sm font-bold"
                  >
                    Use as {role}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-xl border">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Welcome back, <span className="font-bold text-foreground">{session.username}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded dark:bg-blue-900/30 dark:text-blue-300">
                  Active Role: {session.activeRole}
                </span>
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-800 rounded dark:bg-slate-800 dark:text-slate-300">
                  Total Roles: {session.roles.join(", ")}
                </span>
              </div>
            </div>

            {/* Dashboard Shells based on Active Role */}
            {session.activeRole === "BUYER" && (
              <div className="space-y-6">
                <div className="flex border-b overflow-x-auto gap-4">
                  {[
                    { id: "wallet", label: "Dompet" },
                    { id: "address", label: "Alamat" },
                    { id: "cart", label: "Keranjang" },
                    { id: "orders", label: "Pesanan Saya" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-2.5 text-sm font-semibold border-b-2 px-1 focus:outline-none transition-all ${activeTab === tab.id || (activeTab === "checkout" && tab.id === "cart") ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "wallet" && <BuyerWallet />}
                {activeTab === "address" && <BuyerAddress />}
                {activeTab === "cart" && (
                  <BuyerCart onCheckoutNavigate={() => setActiveTab("checkout")} />
                )}
                {activeTab === "checkout" && (
                  <BuyerCheckout onCheckoutSuccess={() => setActiveTab("orders")} />
                )}
                {activeTab === "orders" && <BuyerOrders />}
              </div>
            )}

            {session.activeRole === "SELLER" && (
              <div className="space-y-6">
                {!session.hasStore ? (
                  <StoreManagement onStoreCreated={() => {
                    fetch("/api/auth/session")
                      .then(res => res.json())
                      .then(data => {
                        if (data.user) setSession(data.user);
                      });
                  }} />
                ) : (
                  <>
                    <div className="flex border-b overflow-x-auto gap-4">
                      {[
                        { id: "products", label: "Kelola Produk" },
                        { id: "orders", label: "Pesanan Masuk" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSellerTab(tab.id)}
                          className={`pb-2.5 text-sm font-semibold border-b-2 px-1 focus:outline-none transition-all ${sellerTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {sellerTab === "products" && <ProductManagement />}
                    {sellerTab === "orders" && <SellerOrders />}
                  </>
                )}
              </div>
            )}

            {session.activeRole === "DRIVER" && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Driver Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-extrabold text-blue-600">IDR 0</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Driver Panel Placeholder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Job listings, job delivery status and earning tracker will be active in Level 5.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {session.activeRole === "ADMIN" && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-sm md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Admin Panel Placeholder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      System wide monitoring, voucher/promo generation UI, time simulation and overdue order checks will be active in Level 6.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}