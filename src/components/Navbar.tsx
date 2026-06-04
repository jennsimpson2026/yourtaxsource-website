"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LogIn, UserPlus, LayoutDashboard, CalendarDays } from "lucide-react";
import { BookingButton } from "@/components/BookingButton";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Resources", href: "/resources" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-36 md:h-52 items-center">
          {/* Logo (Left) */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/images/logo-long.png" 
                alt="Your Tax Source Logo" 
                width={720} 
                height={240} 
                className="h-32 md:h-48 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
              <span className="sr-only">Your Tax Source</span>
            </Link>
          </div>

          {/* Desktop Links (Center) */}
          <div className="hidden xl:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-brand-charcoal hover:text-brand-purple transition-colors font-bold text-[11px] uppercase tracking-[0.2em] whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions (Right) */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Menu Button */}
            <div className="xl:hidden">
              <button 
                onClick={() => setIsOpen(true)}
                className="text-brand-black p-2 hover:text-brand-purple transition-colors"
                aria-label="Open Menu"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 md:gap-4">
              <Link 
                href="/auth/login" 
                className="text-brand-purple font-black hover:text-brand-black transition-colors text-[10px] uppercase tracking-widest flex items-center gap-1.5"
              >
                Login
              </Link>
              <BookingButton 
                label="Book"
                className="bg-brand-purple text-white px-4 py-2 rounded-lg font-black hover:bg-[#5a3a74] transition-all shadow-md text-[10px] uppercase tracking-widest flex items-center gap-1.5"
              />
            </div>

            <Link 
              href="/portal" 
              className="bg-brand-black text-white px-4 py-2 rounded-lg font-black hover:bg-brand-purple transition-all shadow-md flex items-center gap-2 text-[10px] uppercase tracking-widest whitespace-nowrap"
            >
              Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[60] xl:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Panel */}
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Image 
              src="/images/logo-long.png" 
              alt="Logo" 
              width={240} 
              height={60} 
              className="h-10 w-auto object-contain"
            />
            <button 
              onClick={() => setIsOpen(false)}
              className="text-brand-charcoal hover:text-brand-purple p-2 rounded-full hover:bg-brand-soft-gray transition-all"
              aria-label="Close Menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-4">Navigation</p>
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between group py-3 px-4 rounded-2xl hover:bg-brand-purple/5 transition-all"
                >
                  <span className="text-lg font-bold text-brand-black group-hover:text-brand-purple">{link.name}</span>
                  <ChevronRight size={20} className="text-brand-purple opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>

            <div className="h-px bg-gray-100 mx-4" />

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-4">Account</p>
              <Link 
                href="/portal" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-brand-black text-white font-bold hover:bg-brand-purple transition-all"
              >
                <LayoutDashboard size={20} />
                Client Portal
              </Link>
              <Link 
                href="/auth/signup" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-brand-purple text-white font-bold hover:bg-[#5a3a74] transition-all"
              >
                <UserPlus size={20} />
                Start Intake
              </Link>
              <Link 
                href="/auth/login" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-brand-purple/20 text-brand-purple font-bold hover:bg-brand-purple/5 transition-all"
              >
                <LogIn size={20} />
                Login
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 bg-brand-soft-gray/50">
            <p className="text-sm text-brand-charcoal/60 font-medium">Serving Clients Nationwide</p>
            <p className="text-xs text-brand-charcoal/40 mt-1">© {new Date().getFullYear()} Your Tax Source</p>
          </div>
        </div>
      </div>
    </nav>
  );
};
