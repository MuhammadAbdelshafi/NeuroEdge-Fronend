'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ role: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'admin') {
                router.push('/dashboard');
            }
            setUser(parsedUser);
        } else {
            router.push('/login');
        }
    }, [router]);

    if (!user) return null; // Or loading spinner

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/admin/dashboard">
                        <Button
                            variant={pathname === '/admin/dashboard' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button
                            variant={pathname === '/admin/users' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Users
                        </Button>
                    </Link>
                    <Separator className="my-2" />
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-slate-500">
                            <FileText className="mr-2 h-4 w-4" />
                            Return to App
                        </Button>
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            router.push('/login');
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
