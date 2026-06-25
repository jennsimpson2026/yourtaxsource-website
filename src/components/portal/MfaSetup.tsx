"use client";

import { useState } from "react";
import { generateMfaSecret, verifyAndEnableMfa } from "@/actions/auth";
import { ShieldCheck, Smartphone, Loader2, AlertCircle } from "lucide-react";
import QRCode from "qrcode";

export function MfaSetup({ userId, initialEnabled }: { userId: string, initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMfaSecret(userId);
      if ("error" in result) throw new Error(result.error);
      
      const url = await QRCode.toDataURL(result.otpauth);
      setQrCodeUrl(url);
      setShowSetup(true);
    } catch (err: any) {
      setError(err.message || "Failed to start MFA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (token.length !== 6) return;
    
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyAndEnableMfa(userId, token);
      if ("error" in result) throw new Error(result.error);
      
      setEnabled(true);
      setShowSetup(false);
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (enabled) {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-brand-black">Two-Factor Auth Active</h3>
            <p className="text-brand-charcoal/60 text-sm">Your account is protected by an additional layer of security.</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-wider">
          Enabled
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-lavender rounded-2xl flex items-center justify-center text-brand-purple">
          <Smartphone size={24} />
        </div>
        <div>
          <h3 className="text-xl font-heading font-bold text-brand-black">Two-Factor Authentication</h3>
          <p className="text-brand-charcoal/60 text-sm">Add a second layer of security using an authenticator app.</p>
        </div>
      </div>

      {!showSetup ? (
        <button
          onClick={handleStartSetup}
          disabled={loading}
          className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Set Up MFA"}
        </button>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-brand-soft-gray p-6 rounded-3xl">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48 rounded-xl bg-white p-2" />
            )}
            <div className="space-y-4">
              <p className="text-sm text-brand-charcoal font-medium">
                1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="space-y-2">
                <p className="text-sm text-brand-charcoal font-medium">2. Enter the 6-digit code from the app:</p>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full p-4 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border-none focus:ring-2 focus:ring-brand-purple outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-100">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowSetup(false)}
              className="flex-1 py-4 rounded-2xl font-bold text-brand-charcoal hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || token.length !== 6}
              className="flex-[2] bg-brand-purple text-white py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-lg shadow-brand-purple/20"
            >
              {verifying ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Enable"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
