import { 
  generateSecret, 
  generateSync, 
  verifySync, 
  generateURI,
  NobleCryptoPlugin,
  ScureBase32Plugin
} from "otplib";

const crypto = new NobleCryptoPlugin();
const base32 = new ScureBase32Plugin();

/**
 * Compatibility wrapper for otplib v13 to match the previous API used in the codebase.
 */
export const authenticator = {
  generateSecret: (length?: number) => generateSecret({ crypto, base32, length }),
  generate: (secret: string) => generateSync({ secret, crypto, base32 }),
  verify: ({ token, secret }: { token: string; secret: string }) => {
    try {
      const result = verifySync({ token, secret, crypto, base32 });
      return result.valid;
    } catch (e) {
      console.error("MFA Verification Error:", e);
      return false;
    }
  },
  toURI: ({ label, issuer, secret }: { label: string; issuer: string; secret: string }) => 
    generateURI({ label, issuer, secret }),
};
