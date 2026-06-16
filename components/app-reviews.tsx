"use client";

import * as React from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AppReview {
  id: number;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AppReviews() {
  const [reviews, setReviews] = React.useState<AppReview[]>([]);
  const [name, setName] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!name || !comment) {
      setMsg("Semua field harus diisi!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      if (res.ok) {
        setMsg("Ulasan berhasil dikirim!");
        setName("");
        setComment("");
        setRating(5);
        fetchReviews();
      } else {
        const data = await res.json();
        setMsg(data.error || "Gagal mengirim ulasan.");
      }
    } catch {
      setMsg("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Review */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Beri Ulasan Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {msg && (
                  <div className={`p-3 text-xs rounded border ${msg.includes("berhasil") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {msg}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama Pengulas</label>
                  <Input 
                    type="text" 
                    placeholder="Masukkan nama Anda" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Rating (1 - 5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none transition-transform active:scale-90"
                      >
                        <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Komentar / Masukan</label>
                  <Textarea
                    placeholder="Bagaimana pengalaman Anda menggunakan Seapedia?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Mengirim..." : "Kirim Ulasan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Daftar Review */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ulasan Pengguna Aplikasi
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Apa kata mereka tentang pengalaman berbelanja dan berjualan di Seapedia.
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/20">
              <MessageSquare className="h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada ulasan untuk aplikasi ini.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2">
              {reviews.map((rev) => (
                <Card key={rev.id} className="shadow-sm border-slate-100 dark:border-slate-800">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm truncate max-w-[150px]">{rev.name}</h4>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 break-words line-clamp-4">
                      {rev.comment}
                    </p>
                    <div className="text-[10px] text-muted-foreground text-right">
                      {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
