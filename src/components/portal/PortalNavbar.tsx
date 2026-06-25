"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LayoutDashboard, FileText, MessageSquare, ClipboardCheck, BookOpen, Settings, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PortalNavbarProps {
  userEmail?: string | null;
  userRole?: string;
}

export const PortalNavbar = ({ userEmail, userRole }: PortalNavbarProps) => {
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
    { name: "Dashboard", href: "/portal", icon: <LayoutDashboard size={20} /> },
    { name: "Documents", href: "/portal/documents", icon: <FileText size={20} /> },
    { name: "Messages", href: "/portal/messages", icon: <MessageSquare size={20} /> },
    { name: "Intake Form", href: "/portal/questionnaire", icon: <ClipboardCheck size={20} /> },
    { name: "Resources", href: "/portal/resources", icon: <BookOpen size={20} /> },
  ];

  if (userRole === "ADMIN" || userRole === "STAFF") {
    navLinks.push({ name: "Admin Hub", href: "/admin", icon: <Settings size={20} /> });
  }

  return (
    <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-purple rounded-xl flex items-center justify-center shadow-sm">
               <span className="text-white font-bold text-xl">Y</span>
            </div>
            <span className="font-heading font-bold text-lg md:text-xl text-brand-black hidden sm:block">
              Secure Client Portal
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-sm font-bold text-brand-charcoal/60 hover:text-brand-purple transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6">
          <button 
            onClick={() => setIsOpen(true)}
            className="md:hidden text-brand-black p-2 hover:text-brand-purple transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest leading-none mb-1">
              {userRole === "ADMIN" ? "Administrator" : userRole === "STAFF" ? "Staff Member" : "Authenticated Client"}
            </span>
            <span className="text-sm font-bold text-brand-black">{userEmail}</span>
          </div>
          
          <div className="hidden sm:block">
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[60] md:hidden transition-opacity duration-300",
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center">
                 <span className="text-white font-bold">Y</span>
              </div>
              <span className="font-heading font-bold text-brand-black">Portal Menu</span>
            </div>
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-4">Portal Navigation</p>
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between group py-3 px-4 rounded-2xl hover:bg-brand-purple/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-brand-charcoal/40 group-hover:text-brand-purple transition-colors">
                      {link.icon}
                    </div>
                    <span className="text-lg font-bold text-brand-black group-hover:text-brand-purple">{link.name}</span>
                  </div>
                  <ChevronRight size={20} className="text-brand-purple opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>

            <div className="h-px bg-gray-100 mx-4" />

            <div className="p-4 rounded-2xl bg-brand-soft-gray/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <ShieldCheck size={20} className="text-brand-purple" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest">{userRole}</p>
                  <p className="text-sm font-bold text-brand-black truncate">{userEmail}</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100">
            <p className="text-xs text-brand-charcoal/40 font-medium italic">Your data is encrypted and stored securely.</p>
          </div>
        </div>
      </div>
    </header>
  );
};
