"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const FAQS = [
  {
    question: "What is the TaxSource Tracker™?",
    answer: "A proprietary digital system designed by Jenn Simpson to help you manage tax documents throughout the year. It provides real-time visibility into your tax readiness."
  },
  {
    question: "How do I get access?",
    answer: "Access is included for all Boutique Advisory clients. Standalone purchase is also available for $49."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use enterprise-grade AES-256 encryption for all documents and data stored in the Tracker."
  },
  {
    question: "Do I need a separate login?",
    answer: "No, the Tracker is fully integrated into the Client Portal. One secure login gives you access to everything."
  }
];

export function ResourcesFAQ() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {FAQS.map((faq, idx) => (
        <FaqItem key={idx} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 hover:bg-white transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center transition-all"
      >
        <span className="font-bold text-brand-black text-sm">{question}</span>
        <ChevronRight className={`text-brand-purple transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} size={18} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
        <div className="p-6 pt-0 text-xs text-brand-charcoal/60 leading-relaxed border-t border-gray-100">
          {answer}
        </div>
      </div>
    </div>
  );
}
