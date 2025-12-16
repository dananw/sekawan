import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { Loader2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '../api/auth';
import { useAuthStore, type User } from '@/lib/auth';

export function LoginForm() {
    const navigate = useNavigate();
    const login = useLogin();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                const result = await login.mutateAsync(value);
                const user: User = {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role as User['role'],
                };
                setAuth(
                    user,
                    result.tokens.accessToken,
                    result.tokens.refreshToken
                );
                navigate({ to: '/dashboard' });
            } catch (err: any) {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        },
    });

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]"></div>
            <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50"></div>

            <div className="relative z-10 w-full flex justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Truck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Sekawan Fleet
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-2">
                                Vehicle Booking Management System
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit();
                            }}
                            className="space-y-4"
                        >
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form.Field name="email">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@sekawan.com"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            className="h-11"
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                                        )}
                                    </div>
                                )}
                            </form.Field>

                            <form.Field name="password">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            className="h-11"
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                                        )}
                                    </div>
                                )}
                            </form.Field>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-black hover:bg-zinc-800 text-white font-medium"
                                disabled={login.isPending}
                            >
                                {login.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <div className="pt-4 border-t">
                                <p className="text-xs text-center text-muted-foreground">
                                    Demo credentials:
                                </p>
                                <div className="mt-2 text-xs text-center space-y-1 text-muted-foreground">
                                    <p><span className="font-medium">Admin:</span> admin@sekawan.com</p>
                                    <p><span className="font-medium">Password:</span> password123</p>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
