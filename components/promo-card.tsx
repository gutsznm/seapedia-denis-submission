"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

const PROMO_IMAGES = [
  { id: 1, src: "/seapedia-logo.webp", alt: "Promo Seapedia 1" },
  { id: 2, src: "/images/promo-2.jpg", alt: "Promo Seapedia 2" },
  { id: 3, src: "/images/promo-3.jpg", alt: "Promo Seapedia 3" },
  { id: 4, src: "/images/promo-4.jpg", alt: "Promo Seapedia 4" },
  { id: 5, src: "/images/promo-5.jpg", alt: "Promo Seapedia 5" },
];

export function Promo() {
  const autoplayPlugin = Autoplay({ delay: 3000, stopOnInteraction: true });
  return (
    <Carousel
      plugins={[autoplayPlugin]}
      className="w-full max-w-[10rem] sm:max-w-xs"
      onMouseEnter={() => autoplayPlugin.stop()}
      onMouseLeave={() => autoplayPlugin.reset()}
    >
      <CarouselContent>
        {PROMO_IMAGES.map((promo) => (
          <CarouselItem key={promo.id}>
            <div className="p-1">
              <Card className="overflow-hidden border-none shadow-sm">
                <CardContent className="flex aspect-square items-center justify-center p-0 relative w-full h-full">
                  <Image
                    src={promo.src}
                    alt={promo.alt}
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 640px) 160px, (max-width: 768px) 320px, 384px"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
