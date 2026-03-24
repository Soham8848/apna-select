"use client";

import { MessageCircle, Instagram } from "lucide-react";
import Link from "next/link";

export function FloatingContact() {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
            <Link
                href="https://wa.me/#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg animate-bounce transition-colors"
                aria-label="Contact on WhatsApp"
            >
                <MessageCircle className="w-7 h-7 text-white" />
            </Link>

            <Link
                href="https://instagram.com/apna.select"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 hover:opacity-90 shadow-lg transition-opacity"
                aria-label="Follow on Instagram"
            >
                <Instagram className="w-7 h-7 text-white" />
            </Link>
        </div>
    );
}
