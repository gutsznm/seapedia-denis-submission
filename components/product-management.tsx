"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export default function ProductManagement() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [image, setImage] = React.useState("");
  
  const [editId, setEditId] = React.useState<number | null>(null);
  const [error, setError] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchProducts = React.useCallback(async () => {
    try {
      const res = await fetch("/api/seller/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!name || !description || !price || !stock || !image) {
      setError("Semua field wajib diisi.");
      return;
    }

    setIsLoading(true);
    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      image
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`/api/seller/products/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/seller/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan produk.");
      }

      setMsg(editId ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImage("");
      setEditId(null);
      fetchProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan produk.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImage(product.image);
    setError("");
    setMsg("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg("Produk berhasil dihapus!");
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menghapus produk.");
      }
    } catch {
      setError("Terjadi kesalahan.");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Form Tambah/Edit Produk */}
      <div className="md:col-span-1">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              {editId ? "Edit Produk" : "Tambah Produk Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
              {msg && <div className="p-3 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg">{msg}</div>}
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Produk</label>
                <Input
                  type="text"
                  placeholder="Contoh: Ikan Kerapu Segar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deskripsi</label>
                <Textarea
                  placeholder="Detail deskripsi produk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Harga (IDR)</label>
                <Input
                  type="number"
                  placeholder="Harga per unit/kg"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min={0}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Stok</label>
                <Input
                  type="number"
                  placeholder="Jumlah stok barang"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min={0}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Link URL Gambar</label>
                <Input
                  type="text"
                  placeholder="https://link-gambar.com/produk.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Menyimpan..." : "Simpan Produk"}
                </Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditId(null);
                      setName("");
                      setDescription("");
                      setPrice("");
                      setStock("");
                      setImage("");
                    }}
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Produk */}
      <div className="md:col-span-2">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Daftar Produk Toko Anda</h3>
        {products.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center bg-slate-50">
            <p className="text-sm text-muted-foreground">Belum ada produk di toko Anda.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {products.map((prod) => (
              <Card key={prod.id} className="shadow-sm border border-slate-100 flex flex-col justify-between">
                <CardContent className="p-4 space-y-2">
                  <div className="aspect-video relative rounded-lg bg-slate-100 overflow-hidden mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/product-placeholder.jpg";
                      }}
                    />
                  </div>
                  <h4 className="font-bold text-sm truncate">{prod.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{prod.description}</p>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-blue-600">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(prod.price)}
                    </span>
                    <span className="text-slate-600">Stok: {prod.stock}</span>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex gap-2 border-t border-slate-50 mt-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleEdit(prod)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleDelete(prod.id)}>
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
