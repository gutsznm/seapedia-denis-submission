export interface Product {
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    rating: number;
    reviewsCount: number;
    image: string;
    location: string;
    isFavorite?: boolean;
  }
  
  export const DUMMY_PRODUCTS: Product[] = [
    {
      id: "p1",
      title: "Ikan Kerapu Macan Segar Tangkapan Nelayan Lokal - 1kg",
      price: 95000,
      discountPrice: 85000,
      rating: 4.8,
      reviewsCount: 120,
      image: "/images/product-kerapu.jpg", // Ganti sesuai aset kamu
      location: "Jakarta Utara",
      isFavorite: true,
    },
    {
      id: "p2",
      title: "Jaring Insang (Gill Net) Nylon Premium Ukuran 2.5 Inch",
      price: 350000,
      rating: 4.9,
      reviewsCount: 45,
      image: "/images/product-jaring.jpg",
      location: "Cirebon",
    },
    {
      id: "p3",
      title: "Pakan Udang Vaname Booster Grow Maksimal - Sak 25kg",
      price: 420000,
      discountPrice: 399000,
      rating: 4.7,
      reviewsCount: 88,
      image: "/images/product-pakan.jpg",
      location: "Sidoarjo",
    },
    {
      id: "p4",
      title: "GPS Navigation Marine Garmin Striker Plus 4cv Fishfinder",
      price: 3450000,
      rating: 5.0,
      reviewsCount: 14,
      image: "/images/product-gps.jpg",
      location: "Batam",
    },
  ];