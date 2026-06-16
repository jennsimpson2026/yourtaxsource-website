"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export function DocumentYearFilter({ years }: { years: number[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = searchParams.get("year") || "all";

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (year === "all") {
      params.delete("year");
    } else {
      params.set("year", year);
    }
    router.push(`/portal/documents?${params.toString()}`);
  };

  if (years.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 pl-2 text-brand-charcoal/40">
        <Filter size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Year:</span>
      </div>
      <select
        value={currentYear}
        onChange={(e) => handleYearChange(e.target.value)}
        className="bg-transparent text-sm font-bold text-brand-black outline-none cursor-pointer pr-4"
      >
        <option value="all">All Documents</option>
        {years.map((year) => (
          <option key={year} value={year.toString()}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
