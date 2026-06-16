"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  MapPin, 
  ShoppingCart, 
  ClipboardList, 
  Package, 
  Menu, 
  BarChart2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import StoreManagement from "@/components/store-management";
import ProductManagement from "@/components/product-management";
import SellerOrders from "@/components/seller-orders";
import SellerReports from "@/components/seller-reports";
import BuyerWallet from "@/components/buyer-wallet";
import BuyerAddress from "@/components/buyer-address";
import BuyerCart from "@/components/buyer-cart";
import BuyerCheckout from "@/components/buyer-checkout";
import BuyerOrders from "@/components/buyer-orders";
import BuyerReports from "@/components/buyer-reports";
import DriverDashboard from "@/components/driver-dashboard";

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
  const [activeTab, setActiveTab] = React.useState("wallet"); 
  const [sellerTab, setSellerTab] = React.useState("products");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

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

  // Navigasi Dinamis Berdasarkan Active Role
  const getSidebarItems = () => {
    if (session.activeRole === "BUYER") {
      return [
        { id: "wallet", label: "Dompet", icon: Wallet, action: () => setActiveTab("wallet") },
        { id: "address", label: "Alamat", icon: MapPin, action: () => setActiveTab("address") },
        { id: "cart", label: "Keranjang", icon: ShoppingCart, action: () => setActiveTab("cart") },
        { id: "orders", label: "Pesanan Saya", icon: ClipboardList, action: () => setActiveTab("orders") },
        { id: "reports", label: "Laporan", icon: BarChart2, action: () => setActiveTab("reports") },
      ];
    }
    if (session.activeRole === "SELLER" && session.hasStore) {
      return [
        { id: "products", label: "Kelola Produk", icon: Package, action: () => setSellerTab("products") },
        { id: "orders", label: "Pesanan Masuk", icon: ClipboardList, action: () => setSellerTab("orders") },
        { id: "reports", label: "Laporan", icon: BarChart2, action: () => setSellerTab("reports") },
      ];
    }
    return [];
  };

  const sidebarItems = getSidebarItems();
  const currentActiveId = session.activeRole === "BUYER" ? activeTab : sellerTab;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Header />
      
      <div className="flex flex-1 relative">
        {/* ================= SIDEBAR DESKTOP ================= */}
        {session.activeRole && sidebarItems.length > 0 && (
          <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r p-4 space-y-6 sticky top-[65px] h-[calc(100vh-65px)]">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navigasi {session.activeRole}
              </p>
              <div className="space-y-1 pt-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentActiveId === item.id || (item.id === "cart" && activeTab === "checkout");
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                        isActive 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" 
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                      )}
                    >
                      <Icon className={cn("w-4 height-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tombol switch role/ganti akun bagian bawah jika diperlukan */}
            <div className="mt-auto border-t pt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-xs gap-2"
                onClick={() => handleRoleSelect("")}
              >
                Ganti Peran (Role)
              </Button>
            </div>
          </aside>
        )}

        {/* ================= MOBILE MENU TRIGGER ================= */}
        {session.activeRole && sidebarItems.length > 0 && (
          <div className="md:hidden fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="rounded-full w-12 h-12 shadow-lg flex items-center justify-center p-0"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* ================= SIDEBAR MOBILE OVERLAY ================= */}
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 p-4 space-y-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h2 className="text-lg font-bold px-3">Menu Utama</h2>
                <div className="space-y-1 pt-4">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentActiveId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setIsMobileSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= AREA KONTEN UTAMA ================= */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6 overflow-x-hidden">
          {!session.activeRole ? (
            <div className="max-w-md mx-auto pt-10">
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
            <>
              {/* Top Banner Dashboard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-xs">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Welcome back, <span className="font-bold text-foreground">{session.username}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-transparent">
                    Active Role: {session.activeRole}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded border dark:bg-slate-800 dark:text-slate-300 dark:border-transparent">
                    Total Peran: {session.roles.join(", ")}
                  </span>
                </div>
              </div>

              {/* Render Konten Berdasarkan Role */}
              {session.activeRole === "BUYER" && (
                <div className="pt-2">
                  {activeTab === "wallet" && <BuyerWallet />}
                  {activeTab === "address" && <BuyerAddress />}
                  {activeTab === "cart" && (
                    <BuyerCart onCheckoutNavigate={() => setActiveTab("checkout")} />
                  )}
                  {activeTab === "checkout" && (
                    <BuyerCheckout onCheckoutSuccess={() => setActiveTab("orders")} />
                  )}
                  {activeTab === "orders" && <BuyerOrders />}
                  {activeTab === "reports" && <BuyerReports />}
                </div>
              )}

              {session.activeRole === "SELLER" && (
                <div className="pt-2">
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
                      {sellerTab === "products" && <ProductManagement />}
                      {sellerTab === "orders" && <SellerOrders />}
                      {sellerTab === "reports" && <SellerReports />}
                    </>
                  )}
                </div>
              )}

              {session.activeRole === "DRIVER" && (
                <div className="pt-2">
                  <DriverDashboard />
                </div>
              )}

              {session.activeRole === "ADMIN" && (
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="shadow-xs md:col-span-3 bg-white dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Admin Panel Placeholder</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        System is under maintenance.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}