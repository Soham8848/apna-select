"use client";

import Link from "next/link";
import Image from "next/image";

const defaultCategories = [
  { id: 6, english: "Electronics", hinglish: "Gadget Gali", imageUrl: "/images/categories/electronics.jpg" },
  { id: 4, english: "Beauty", hinglish: "Sajna Sawarna", imageUrl: "/images/categories/beauty.jpg" },
  { id: 8, english: "Accessories", hinglish: "Style Ka Tadka", imageUrl: "/images/categories/accessories.jpg" },
  { id: 7, english: "Home & Gift", hinglish: "Ghar Ki Raunak", imageUrl: "/images/categories/home-gift.jpg" },
  { id: 11, english: "Kitchen", hinglish: "Kitchen Khazana", imageUrl: "/images/categories/kitchen.jpg" },
  { id: 1, english: "Audio", hinglish: "Shor Sharaba", imageUrl: "/images/categories/audio.jpg" },
  { id: 2, english: "Wearables", hinglish: "Wrist Pe Swag", imageUrl: "/images/categories/wearables.jpg" },
  { id: 3, english: "Mobile Accs", hinglish: "Phone Ka Shringar", imageUrl: "/images/categories/mobile-accs.jpg" },
  { id: 5, english: "Gaming", hinglish: "Noob to Pro", imageUrl: "/images/categories/gaming.jpg" },
  { id: 9, english: "Tools", hinglish: "Jugaad Junction", imageUrl: "/images/categories/tools.jpg" },
  { id: 10, english: "Quirky Items", hinglish: "Khatarnak Collection", imageUrl: "/images/categories/quirky.jpg" },
  { id: 12, english: "Health & Care", hinglish: "Apna Khayal", imageUrl: "/images/categories/health.jpg" },
  { id: 13, english: "Kids & Baby", hinglish: "Chillar Party", imageUrl: "/images/categories/kids.jpg" },
  { id: 14, english: "Travel", hinglish: "Safar Ka Sathi", imageUrl: "/images/categories/travel.jpg" },
  { id: 15, english: "Stationery", hinglish: "Likhai Padhai", imageUrl: "/images/categories/stationery.jpg" },
  { id: 16, english: "Storage", hinglish: "Sab Set", imageUrl: "/images/categories/storage.jpg" },
  { id: 17, english: "Jewellery", hinglish: "Chamak Dhamak", imageUrl: "/images/categories/jewellery.jpg" },
  { id: 18, english: "Automotives", hinglish: "Gaadi Waadi", imageUrl: "/images/categories/auto.jpg" },
];

export function CuratedCategories() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
          Curated Categories
        </h2>
        <div className="w-24 h-1 bg-amber-500 rounded-full shadow-[0_0_15px_#F59E0B]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {defaultCategories.slice(0, 12).map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${encodeURIComponent(cat.english.toLowerCase())}`}
            className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer container block"
          >
            <Image
              src={cat.imageUrl}
              alt={cat.english}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="text-white font-bold text-lg md:text-xl">{cat.english}</span>
              <span className="text-blue-300 dark:text-blue-400 text-sm font-medium">{cat.hinglish}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
