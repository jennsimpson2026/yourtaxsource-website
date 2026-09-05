import React from "react";
import { CreditCard, BadgeCheck, LockKeyhole, ReceiptText, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { FinalReturnDownloadButton } from "./FinalReturnDownloadButton";

interface FinancialSummaryProps {
  /** The full, unadjusted tax preparation fee for this return. */
  originalFee: number;
  /** Total amount waived (discount/courtesy) applied to this return. */
  waivedAmount: number;
  /** Total payments already applied toward this return (sum of paid invoices). */
  payments: number;
  /** Whether a 'Credit Card Surcharge' may be applied when paying by card. */
  surchargeEnabled: boolean;
  /** Whether the return documents are released to the client (balance $0 OR manual release). */
  documentsReleased: boolean;
  /** Optional label for the tax year being summarized. */
  taxYear?: number;
  /** ID of the released final-return document, if any, to show a download CTA. */
  finalReturnDocId?: string;
  /** Display name of the released final-return document. */
  finalReturnFileName?: string;
}

/**
 * Boutique Financial Summary shown in the Client Portal.
 *
 * Presents the full breakdown: Original Fee → Waivers → Adjusted Fee →
 * Payments → Balance, with clear 'Credit Card Surcharge' terminology and a
 * document-release status note. Pure presentational (server-safe).
 */
export function FinancialSummary({
  originalFee,
  waivedAmount,
  payments,
  surchargeEnabled,
  documentsReleased,
  taxYear,
  finalReturnDocId,
  finalReturnFileName,
}: FinancialSummaryProps) {
  const numericAdjustedFee = Math.max(0, originalFee - waivedAmount);
  const numericBalance = Math.max(0, numericAdjustedFee - payments);

  const feeText = toMoney(originalFee);
  const waiversText = toMoney(waivedAmount);
  const adjustedFeeText = toMoney(numericAdjustedFee);
  const paidText = toMoney(payments);
  const balanceText = toMoney(numericBalance);

  return (
    <section
      id="financial-summary"
      className="bg-gradient-to-br from-brand-lavender/40 to-white rounded-[2rem] p-8 md:p-12 border border-brand-lavender shadow-sm overflow-hidden relative"
    >
      <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
        <ReceiptText size={240} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple">
            <CreditCard size={22} />
          </div>
          <h3 className="text-2xl font-heading font-black text-brand-black">
            Financial Summary
          </h3>
        </div>
        <p className="text-brand-charcoal/60 text-sm font-medium mb-8">
          {taxYear ? `Tax Year ${taxYear} · ` : ""}A clear breakdown of your preparation fees and balance.
        </p>

        <div className="bg-white rounded-3xl shadow-xl shadow-brand-purple/5 border border-brand-lavender overflow-hidden">
          {/* Line items */}
          <dl className="divide-y divide-gray-100">
            <SummaryRow label="Original Fee" value={feeText} />
            <SummaryRow
              label="Waivers"
              value={`-${waiversText}`}
              muted={waivedAmount <= 0}
              note={waivedAmount <= 0 ? "None applied" : undefined}
            />
            <SummaryRow label="Adjusted Fee" value={adjustedFeeText} emphasized />
            <SummaryRow label="Payments" value={`-${paidText}`} muted={payments <= 0} />
          </dl>

          {/* Balance due */}
          <div className="flex items-center justify-between px-6 md:px-8 py-6 bg-brand-black text-white">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-lavender/70">
                Balance Due
              </span>
              <div className="font-heading text-4xl md:text-5xl font-black mt-1">
                ${balanceText}
              </div>
            </div>
            {numericBalance > 0 ? (
              <Link
                href="#invoices"
                className="inline-flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20"
              >
                Pay Now <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 bg-brand-purple/20 text-brand-lavender px-5 py-3 rounded-2xl font-bold text-sm border border-brand-purple/30">
                <BadgeCheck size={18} /> Paid in Full
              </div>
            )}
          </div>
        </div>

        {/* Released final-return download CTA */}
        {documentsReleased && finalReturnDocId && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-brand-purple/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-sm font-black text-brand-black uppercase tracking-wide">
                  Final Tax Documents Ready
                </p>
                <p className="text-xs text-brand-charcoal/70 mt-0.5">
                  {taxYear ? `Your ${taxYear} final tax return is available. ` : "Your final tax return is available. "}
                  <span className="font-semibold">{finalReturnFileName || "2026_Final_Return.pdf"}</span>
                </p>
              </div>
            </div>
            <FinalReturnDownloadButton documentId={finalReturnDocId} fileName={finalReturnFileName} />
          </div>
        )}

        {/* Surcharge + document release notes */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-2xl px-5 py-4 border border-brand-lavender flex items-start gap-3">
            <CreditCard size={18} className="text-brand-purple mt-0.5 shrink-0" />
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              {surchargeEnabled ? (
                <>
                  A <span className="font-bold text-brand-black">Credit Card Surcharge</span> (at
                  cost, up to 3%) may apply when paying by credit card. No surcharge on debit,
                  prepaid, bank draft, or cash.
                </>
              ) : (
                <>
                  Paying by credit card today?{" "}
                  <span className="font-bold text-brand-black">Card processing surcharge</span> is
                  not currently enabled.
                </>
              )}
            </p>
          </div>
          <div className="bg-white/70 rounded-2xl px-5 py-4 border border-brand-lavender flex items-start gap-3">
            <LockKeyhole size={18} className="text-brand-purple mt-0.5 shrink-0" />
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              {documentsReleased ? (
                <span className="font-bold text-brand-black">
                  Your final documents are unlocked and available to download.
                </span>
              ) : (
                <>
                  Your final documents will unlock once your{" "}
                  <span className="font-bold text-brand-black">balance reaches $0</span> or our team
                  releases them for you.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  muted,
  emphasized,
  note,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasized?: boolean;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-5">
      <div>
        <dt className={`font-bold text-sm ${emphasized ? "text-brand-black" : muted ? "text-gray-400" : "text-brand-charcoal/70"}`}>
          {label}
        </dt>
        {note && <dd className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{note}</dd>}
      </div>
      <dd className={`font-bold text-sm ${emphasized ? "text-brand-purple text-lg" : muted ? "text-gray-400" : "text-brand-black"}`}>
        ${value}
      </dd>
    </div>
  );
}

function toMoney(n: number): string {
  if (isNaN(n)) n = 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
