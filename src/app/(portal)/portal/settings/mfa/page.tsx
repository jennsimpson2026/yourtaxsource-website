"use client";

import { useState, useEffect } from "react";
import { generateMfaSecret, verifyAndEnableMfa } from "@/actions/auth";
import { useSession } from "next-auth/react";
import QRCode from "qrcode";

export default function MfaSetupPage() {
  const { data: session } = useSession();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if ((session?.user as any)?.id) {
      handleGenerateQr();
    }
  }, [session]);

  async function handleGenerateQr() {
    const result = await generateMfaSecret((session?.user as any).id);
    if (result.otpauth) {
      const url = await QRCode.toDataURL(result.otpauth);
      setQrCode(url);
    }
  }

  async function handleVerify() {
    setError(null);
    const result = await verifyAndEnableMfa((session?.user as any).id, code);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8 border rounded-lg bg-white shadow">
        <h2 className="text-2xl font-bold text-green-600">MFA Enabled!</h2>
        <p className="mt-4">Your account is now protected with two-factor authentication.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 border rounded-lg bg-white shadow">
      <h2 className="text-2xl font-bold">Set up MFA</h2>
      <p className="mt-2 text-sm text-gray-600">
        Scan the QR code below with your authenticator app (like Google Authenticator or Authy).
      </p>

      {qrCode && (
        <div className="mt-6 flex justify-center">
          <img src={qrCode} alt="QR Code" className="border p-2 rounded" />
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium">Enter 6-digit code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          type="text"
          placeholder="000000"
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleVerify}
        className="mt-6 w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
      >
        Verify and Enable
      </button>
    </div>
  );
}
