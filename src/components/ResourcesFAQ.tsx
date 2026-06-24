"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-all"
      >
        <span className="font-bold text-brand-black">{question}</span>
        <ChevronRight className={`text-brand-purple transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} size={20} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
        <div className="p-6 pt-0 text-sm text-brand-charcoal/60 leading-relaxed border-t border-gray-50">
          {answer}
        </div>
      </div>
    </div>
  );
}

export function ResourcesFAQ() {
  return (
    <div className="mt-20 max-w-4xl mx-auto">
      <h3 className="text-2xl font-heading font-bold text-brand-black mb-10 text-center">TaxSource Tracker™ FAQ</h3>
      <div className="space-y-4">
        <FaqItem 
          question="What is the TaxSource Tracker™?" 
          answer="It is a proprietary digital dashboard and organizational system designed by Jenn Simpson to help clients categorize, track, and manage their tax documentation throughout the year."
        />
        <FaqItem 
          question="How do I get access?" 
          answer="The tracker is included for all 'Boutique Advisory' clients. It can also be purchased as a standalone resource for individuals and businesses who want to improve their organization."
        />
        <FaqItem 
          question="Is my data secure in the tracker?" 
          answer="Yes. The tracker uses the same bank-grade 256-bit encryption as our main Secure Client Portal, ensuring your financial data remains private and protected."
        />
      </div>
    </div>
  );
}
