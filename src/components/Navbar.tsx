"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LogIn, UserPlus, LayoutDashboard, CalendarDays, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { BookingButton } from "@/components/BookingButton";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const loading = status === "loading";

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
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const portalHref = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF"
    ? "/admin"
    : "/portal";

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
                className="p-2 md:p-3 rounded-2xl bg-brand-soft-gray text-brand-charcoal hover:text-brand-purple transition-all active:scale-90"
                aria-label="Open Menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden xl:flex items-center gap-3">
              <BookingButton />
              
              <Link
                href={portalHref}
                className="group flex items-center gap-2 px-6 py-3 bg-brand-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-brand-purple transition-all shadow-sm active:scale-95"
              >
                <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
                {session ? "Dashboard" : "Portal"}
              </Link>

              {session ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-100 text-brand-charcoal text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              ) : (
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 px-6 py-3 bg-brand-purple text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#5a3a74] transition-all shadow-sm active:scale-95"
                >
                  <UserPlus size={14} />
                  Start Intake
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-[100] transition-all duration-500",
          isOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-brand-black/40 backdrop-blur-sm transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />

        {/* Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <Image
              src="/images/logo-long.png"
              alt="Your Tax Source"
              width={140}
              height={40}
              className="object-contain"
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
                href={portalHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-brand-black text-white font-bold hover:bg-brand-purple transition-all"
              >
                <LayoutDashboard size={20} />
                {session ? "My Dashboard" : "Client Portal"}
              </Link>
              
              {!session ? (
                <>
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
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-left"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              )}
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
