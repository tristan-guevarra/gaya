// login page

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await authApi.login(data);
      login(result.user, result.access_token, result.refresh_token);
      toast.success('Welcome back!');
      router.push('/map');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // demo login helper
  const demoLogin = async (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@gaya.app', password: 'GayaAdmin2024!' },
      coach: { email: 'coach@academy.com', password: 'CoachPass2024!' },
      athlete: { email: 'athlete@example.com', password: 'AthletePass2024!' },
    };
    setLoading(true);
    try {
      const result = await authApi.login(creds[role]);
      login(result.user, result.access_token, result.refresh_token);
      toast.success(`Logged in as ${role}`);
      router.push(role === 'admin' ? '/intelligence' : '/map');
    } catch {
      toast.error('Demo login failed — is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--gradient-bg)' }}>
      <div className="relative w-full max-w-[420px]">
        {/* logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="font-display font-bold text-2xl text-text-primary tracking-tight">Gaya</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to Gaya</p>
        </div>

        <Card className="!p-8 !bg-white/60 !backdrop-blur-sm !border !border-white/60 !shadow-xl !shadow-blue-900/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/40" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/60 px-3 text-[10px] text-text-muted uppercase tracking-wider">
                  Quick demo
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { role: 'admin', label: 'Admin', emoji: '👑' },
                { role: 'coach', label: 'Coach', emoji: '⚽' },
                { role: 'athlete', label: 'Athlete', emoji: '🏃' },
              ].map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => demoLogin(demo.role)}
                  disabled={loading}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 border border-white/60 transition-all text-xs text-text-secondary disabled:opacity-50"
                >
                  <span className="text-lg">{demo.emoji}</span>
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-atlas-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
