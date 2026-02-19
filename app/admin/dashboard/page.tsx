'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Users, FileText, Activity, Server } from 'lucide-react';

interface DashboardStats {
    papers: {
        total_papers: number;
        fetched_today: number;
        classified_today: number;
        summarized_today: number;
    };
    users: {
        total_users: number;
        new_users_7d: number;
        active_users_7d: number;
    };
    pipeline: {
        failed_jobs_24h: number;
        pending_classification: number;
        pending_summarization: number;
    };
}

interface AnalyticsStats {
    usage: {
        papers_viewed_7d: number;
        summaries_opened_7d: number;
        searches_7d: number;
        filters_7d: number;
        active_users_7d: number;
    };
    top_papers: { paper_id: string; count: number }[];
    top_searches: { term: string; count: number }[];
    top_subspecialties: { subspecialty: string; count: number }[];
    top_users: { email: string; name: string; count: number }[];
}

interface JobRun {
    id: string;
    job_name: string;
    status: 'running' | 'success' | 'failed';
    items_processed: number;
    duration_sec: number | null;
    started_at: string;
    error_message: string | null;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [usageStats, setUsageStats] = useState<AnalyticsStats | null>(null);
    const [jobs, setJobs] = useState<JobRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, jobsRes, usageRes] = await Promise.all([
                    api.get('/admin/stats/overview'),
                    api.get('/admin/jobs/recent'),
                    api.get('/admin/stats/usage?days=7')
                ]);
                setStats(statsRes.data.data);
                setJobs(jobsRes.data.data);
                setUsageStats(usageRes.data.data);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    router.push('/'); // Redirect if not admin
                } else {
                    setError('Failed to load dashboard data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* ... (Header and KPI Cards remain same) */}

            {/* Product Usage Analytics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Product Usage (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="flex gap-8 mb-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Active Users</div>
                                <div className="text-2xl font-bold">{usageStats?.usage.active_users_7d ?? 0}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Papers Viewed</div>
                                <div className="text-2xl font-bold">{usageStats?.usage.papers_viewed_7d ?? 0}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Summaries Opened</div>
                                <div className="text-2xl font-bold">{usageStats?.usage.summaries_opened_7d ?? 0}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Top Searches</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {usageStats?.top_searches && usageStats.top_searches.length > 0 ? (
                                    usageStats.top_searches.map((item) => (
                                        <div key={item.term} className="flex justify-between text-sm border p-2 rounded">
                                            <span className="truncate">{item.term}</span>
                                            <span className="font-mono font-bold">{item.count}</span>
                                        </div>
                                    ))
                                ) : <div className="text-sm text-muted-foreground">No data yet</div>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Popular Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Top Subspecialties</h4>
                                <div className="space-y-1">
                                    {usageStats?.top_subspecialties && usageStats.top_subspecialties.length > 0 ? (
                                        usageStats.top_subspecialties.map((item) => (
                                            <div key={item.subspecialty} className="flex justify-between text-sm">
                                                <span className="truncate max-w-[180px]" title={item.subspecialty}>{item.subspecialty}</span>
                                                <Badge variant="secondary">{item.count}</Badge>
                                            </div>
                                        ))
                                    ) : <div className="text-sm text-muted-foreground">No data yet</div>}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Top Viewed Papers</h4>
                                <div className="space-y-1">
                                    {usageStats?.top_papers && usageStats.top_papers.length > 0 ? (
                                        usageStats.top_papers.map((item) => (
                                            <div key={item.paper_id} className="flex justify-between text-sm">
                                                <span className="truncate max-w-[180px]" title={item.paper_id}>Paper {item.paper_id.slice(0, 8)}...</span>
                                                <Badge variant="outline">{item.count}</Badge>
                                            </div>
                                        ))
                                    ) : <div className="text-sm text-muted-foreground">No data yet</div>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Jobs Table */}
            <div className="grid gap-4 grid-cols-1">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Background Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Items Processed</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Started At</TableHead>
                                    <TableHead>Error</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.job_name}</TableCell>
                                        <TableCell>
                                            <Badge variant={job.status === 'success' ? 'default' : (job.status === 'running' ? 'secondary' : 'destructive')}>
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{job.items_processed}</TableCell>
                                        <TableCell>{job.duration_sec ? `${job.duration_sec.toFixed(2)}s` : '-'}</TableCell>
                                        <TableCell>{new Date(job.started_at).toLocaleString()}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-red-500" title={job.error_message || ''}>
                                            {job.error_message || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
