'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './use-auth';
import { REDIRECT_AFTER_SIGN_IN } from '@/lib/constants';

export type AuthStep = 'signin' | 'reset' | 'forceChange';

export function useAuthFlow() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const step = (params.get('step') as AuthStep) ?? 'signin';
  const email = params.get('email') ?? '';

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && pathname === '/signin') {
      router.replace(REDIRECT_AFTER_SIGN_IN);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const setStep = useCallback(
    (next: AuthStep, nextEmail?: string) => {
      if (next === 'signin') {
        router.replace(pathname);
        return;
      }

      const usp = new URLSearchParams();
      usp.set('step', next);
      if (nextEmail) usp.set('email', nextEmail);
      router.replace(`${pathname}?${usp.toString()}`);
    },
    [pathname, router],
  );

  const completeAuthFlow = useCallback(() => {
    // After successful authentication (reset password, force change, etc.)
    // redirect to the dashboard instead of back to signin
    // Add a small delay to ensure auth state is updated
    setTimeout(() => {
      router.replace(REDIRECT_AFTER_SIGN_IN);
    }, 100);
  }, [router]);

  return {
    step,
    email,
    setStep,
    goToSignIn: () => setStep('signin'),
    goToPasswordReset: (email: string) => setStep('reset', email),
    goToForcePasswordChange: () => setStep('forceChange'),
    completeAuthentication: completeAuthFlow,
    isAuthenticated,
    isLoading,
  };
}
