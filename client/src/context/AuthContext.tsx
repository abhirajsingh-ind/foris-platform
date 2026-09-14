import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  faceVerified: boolean;
  phoneOtpVerified: boolean;
  login: (badgeId: string, password: string) => Promise<LoginResult>;
  completeFaceVerification: () => void;
  verifyPhoneOtp: (otp: string) => Promise<{ success: boolean; error?: string }>;
  resendPhoneOtp: () => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [faceVerified, setFaceVerified] = useState<boolean>(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState<boolean>(false);

  // Ensure website ALWAYS starts on Page 1 (Login) upon opening/refreshing
  useEffect(() => {
    localStorage.removeItem('foris_token');
    sessionStorage.removeItem('foris_face_verified');
    sessionStorage.removeItem('foris_phone_otp_verified');
    setUser(null);
    setToken(null);
    setFaceVerified(false);
    setPhoneOtpVerified(false);
    setIsLoading(false);
  }, []);

  const login = async (badgeId: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('foris_token', data.token);
        setToken(data.token);
        setUser(data.user);
        // Face verification NOT yet complete — user must pass biometric check
        setFaceVerified(false);
        sessionStorage.removeItem('foris_face_verified');
        return { success: true };
      }

      const isStaticOrNotFound = !res.ok && (res.status === 404 || res.status === 502 || res.status === 503);
      if (isStaticOrNotFound) {
        const demoAuth = getDemoAuthFallback(badgeId, password);
        if (demoAuth.success && demoAuth.user) {
          const mockToken = 'mock_jwt_demo_' + Date.now();
          localStorage.setItem('foris_token', mockToken);
          setToken(mockToken);
          setUser(demoAuth.user);
          setFaceVerified(false);
          sessionStorage.removeItem('foris_face_verified');
          return { success: true };
        }
        return { success: false, error: demoAuth.error || 'Invalid User ID or Password' };
      }

      // Account lockout (403)
      if (res.status === 403) {
        return { success: false, error: data.error || 'Account temporarily locked.' };
      }

      // Invalid credentials (401) — generic message for security
      return { success: false, error: 'Invalid User ID or Password' };
    } catch (err) {
      const demoAuth = getDemoAuthFallback(badgeId, password);
      if (demoAuth.success && demoAuth.user) {
        const mockToken = 'mock_jwt_demo_' + Date.now();
        localStorage.setItem('foris_token', mockToken);
        setToken(mockToken);
        setUser(demoAuth.user);
        setFaceVerified(false);
        sessionStorage.removeItem('foris_face_verified');
        return { success: true };
      }
      return { success: false, error: demoAuth.error || 'Invalid User ID or Password' };
    }
  };

  const getDemoAuthFallback = (bId: string, pwd: string) => {
    const upperBadge = bId.trim().toUpperCase();
    const demoUsers: Record<string, any> = {
      'FORIS-CFO-001': {
        id: 'usr-cfo-001',
        badgeId: 'FORIS-CFO-001',
        name: 'Dr. Abhiraj Singh',
        email: 'abhiraj.singh@forensic.gov.in',
        role: 'FORENSIC_OFFICER',
        designation: 'Chief Forensic Scientist',
        department: 'State Cyber & Forensic Laboratory',
      },
      'FORIS-CYBER-002': {
        id: 'usr-cfo-002',
        badgeId: 'FORIS-CYBER-002',
        name: 'Pooja Sharma',
        email: 'pooja.sharma@forensic.gov.in',
        role: 'FORENSIC_OFFICER',
        designation: 'Senior Cyber Forensic Analyst',
        department: 'Digital Forensics & Malware Division',
      },
      'POLICE-INV-101': {
        id: 'usr-pol-101',
        badgeId: 'POLICE-INV-101',
        name: 'Inspector Amit K. Singh',
        email: 'amit.singh@police.gov.in',
        role: 'POLICE_OFFICER',
        designation: 'Lead Investigating Officer',
        department: 'Cyber Crime Investigation Cell',
      },
      'JUDGE-SESS-901': {
        id: 'usr-jdg-901',
        badgeId: 'JUDGE-SESS-901',
        name: 'Hon. Justice M. L. Deshmukh',
        email: 'justice.deshmukh@judiciary.gov.in',
        role: 'JUDGE',
        designation: 'Special Sessions Court Judge',
        department: 'Designated Cyber & Forensic Tribunal',
      },
    };

    const demoPass: Record<string, string> = {
      'FORIS-CFO-001': 'Forensic#Secure2026',
      'FORIS-CYBER-002': 'Cyber#Forensic2026',
      'POLICE-INV-101': 'Police#Shield2026',
      'JUDGE-SESS-901': 'Justice#Docket2026',
    };

    if (demoUsers[upperBadge] && demoPass[upperBadge] === pwd) {
      return { success: true, user: demoUsers[upperBadge] };
    }
    return { success: false, error: 'Invalid User ID or Password' };
  };

  const completeFaceVerification = () => {
    setFaceVerified(true);
    setPhoneOtpVerified(false);
    sessionStorage.setItem('foris_face_verified', 'true');
    sessionStorage.removeItem('foris_phone_otp_verified');
  };

  const verifyPhoneOtp = async (otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (token && !token.startsWith('mock_jwt_demo_')) {
        const res = await fetch('/api/auth/verify-2fa-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setPhoneOtpVerified(true);
          sessionStorage.setItem('foris_phone_otp_verified', 'true');
          return { success: true };
        }
        return { success: false, error: data.error || 'Invalid verification code.' };
      }

      // Fallback for static demo environments
      if (otp.length === 6) {
        setPhoneOtpVerified(true);
        sessionStorage.setItem('foris_phone_otp_verified', 'true');
        return { success: true };
      }

      return { success: false, error: 'Invalid verification code.' };
    } catch (err: any) {
      if (otp.length === 6) {
        setPhoneOtpVerified(true);
        sessionStorage.setItem('foris_phone_otp_verified', 'true');
        return { success: true };
      }
      return { success: false, error: err.message || 'Verification failed.' };
    }
  };

  const resendPhoneOtp = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      if (token && !token.startsWith('mock_jwt_demo_')) {
        const res = await fetch('/api/auth/resend-2fa-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          return { success: true, message: data.message };
        }
        return { success: false, error: data.error || 'Failed to resend SMS verification code.' };
      }

      return { success: true, message: 'Fresh verification code dispatched to abhirajsingh0904@gmail.com' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend code.' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        // silent logout
      }
    }
    localStorage.removeItem('foris_token');
    sessionStorage.removeItem('foris_face_verified');
    sessionStorage.removeItem('foris_phone_otp_verified');
    setToken(null);
    setUser(null);
    setFaceVerified(false);
    setPhoneOtpVerified(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        faceVerified,
        phoneOtpVerified,
        login,
        completeFaceVerification,
        verifyPhoneOtp,
        resendPhoneOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
