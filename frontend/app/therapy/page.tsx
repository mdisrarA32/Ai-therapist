"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Calendar, AlertCircle, PlusCircle, ArrowRight, Loader2, HeartPulse } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { Badge } from "@/components/ui/badge";

interface TherapySession {
    _id: string;
    createdAt: string;
    updatedAt: string;
    sessionStatus: "ACTIVE" | "ESCALATED" | "CLOSED";
    lastRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

export default function TherapySessionList() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useSession();
    const [sessions, setSessions] = useState<TherapySession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;

        const fetchSessions = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/api/therapy/sessions`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSessions(data.sessions || []);
                }
            } catch (error) {
                console.error("Failed to fetch therapy sessions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, [authLoading, isAuthenticated]);

    const getRiskBadge = (risk?: string) => {
        switch (risk) {
            case "HIGH": return <Badge variant="destructive">High Risk</Badge>;
            case "MEDIUM": return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">Medium Risk</Badge>;
            case "LOW": return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Low Risk</Badge>;
            default: return <Badge variant="outline">Unassessed</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === "ESCALATED") return <Badge variant="destructive" className="flex gap-1 items-center"><AlertCircle className="w-3 h-3" /> Escalated</Badge>;
        if (status === "ACTIVE") return <Badge variant="outline" className="border-primary text-primary">Active</Badge>;
        return <Badge variant="secondary">Closed</Badge>;
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <HeartPulse className="w-8 h-8 text-primary" />
                        Therapy Sessions
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage and review your AI therapy sessions.</p>
                </div>
                <Button onClick={() => router.push("/therapy/new")} className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    New Session
                </Button>
            </div>

            {sessions.length === 0 ? (
                <Card className="bg-muted/30 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No therapy sessions yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Start your first therapy session to get context-aware, CBT-focused support.
                        </p>
                        <Button onClick={() => router.push("/therapy/new")} size="lg" className="gap-2">
                            Start your first therapy session <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session) => (
                        <Card
                            key={session._id}
                            className="cursor-pointer hover:border-primary/50 transition-colors group"
                            onClick={() => router.push(`/therapy/${session._id}`)}
                        >
                            <CardHeader className="p-4 sm:p-6 pb-0">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        Session
                                        <span className="text-sm font-normal text-muted-foreground">
                                            ({new Date(session.updatedAt).toLocaleDateString()})
                                        </span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {getRiskBadge(session.lastRiskLevel)}
                                        {getStatusBadge(session.sessionStatus)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Created: {new Date(session.createdAt).toLocaleString()}
                                    </div>
                                    <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                        View Session <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
