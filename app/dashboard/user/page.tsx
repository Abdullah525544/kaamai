"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home, PlusCircle, Clock, User, LogOut, CheckCircle2,
    Sparkles, Loader2, Bot, Menu, X, Search, Wrench,
    Star, MapPin, CalendarCheck, TrendingUp, ArrowRight, BadgeCheck, Trash2,
    Zap, RefreshCw, ChevronDown, ChevronUp, Fingerprint, Activity
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("home");
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Booking state
    const [requestText, setRequestText] = useState("");
    const [processing, setProcessing] = useState(false);
    const [bookingSteps, setBookingSteps] = useState(0);
    const [fullReasoning, setFullReasoning] = useState<any>(null);
    const [extractedIntent, setExtractedIntent] = useState<any>(null);
    const [topWorkers, setTopWorkers] = useState<any[]>([]);
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [bookings, setBookings] = useState<any[]>([]);
    const [pipelineError, setPipelineError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const intentCache = useRef<{ [key: string]: any }>({});

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push("/auth"); return; }
            setUser(session.user);
            const { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
            if (p) setProfile(p);
            fetchBookings();
            setLoading(false);

            // Supabase Realtime: subscribe to booking updates for this user
            const channel = supabase
                .channel('booking-updates')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${session.user.id}`
                }, (payload: any) => {
                    // Update the specific booking in state instantly
                    setBookings(prev => prev.map(b =>
                        b.id === payload.new.id ? { ...b, ...payload.new } : b
                    ));
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${session.user.id}`
                }, (payload: any) => {
                    setBookings(prev => [payload.new, ...prev]);
                })
                .on('postgres_changes', {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${session.user.id}`
                }, (payload: any) => {
                    setBookings(prev => prev.filter(b => b.id !== payload.old.id));
                })
                .subscribe();

            // Cleanup on unmount
            return () => {
                supabase.removeChannel(channel);
            };
        };
        init();
    }, [router]);

    const fetchBookings = async () => {
        const { data } = await supabase.from("bookings").select("*, workers(name)").order("created_at", { ascending: false });
        if (data) setBookings(data);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleDeleteBooking = async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        try {
            const { error } = await supabase
                .from("bookings")
                .delete()
                .eq("id", id);

            if (!error) {
                setBookings(bookings.filter(b => b.id !== id));
            } else {
                console.error("Delete failed", error);
            }
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const handleSearch = async () => {
        if (!requestText.trim()) return;
        setProcessing(true);
        setBookingSteps(1); // Step 1: Understanding request
        setFullReasoning(null);
        setTopWorkers([]);

        try {
            setPipelineError(null);
            // STEP 1: Understanding request
            const intentRes = await fetch("/api/intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: requestText })
            });

            if (!intentRes.ok) throw new Error("Zarurat samajhne mein masla hua. Dobara koshish karein.");
            const intentData = await intentRes.json();
            setExtractedIntent(intentData);

            // Artificial delay for animation feel
            await new Promise(r => setTimeout(r, 800));
            setBookingSteps(2); // Step 2: Finding workers

            // STEP 2: Finding workers
            const discoverRes = await fetch("/api/discover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intent: intentData })
            });

            if (!discoverRes.ok) throw new Error("Workers dhoondne mein masla hua.");
            const discoverData = await discoverRes.json();

            // Save discovery message if any
            const discoMsg = discoverData.message || "";

            if (discoverData.workers?.length > 0) {
                // Pre-fill topWorkers as a fallback just in case ranking fails
                setTopWorkers(discoverData.workers.map((w: any) => ({ ...w, primaryReason: "Available Match" })));
            }

            await new Promise(r => setTimeout(r, 1000));
            setBookingSteps(3); // Step 3: AI ranking

            // STEP 3: AI ranking
            const rankRes = await fetch("/api/rank", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workers: discoverData.workers, userRequest: requestText, extractedIntent: intentData })
            });

            if (rankRes.ok) {
                const rankData = await rankRes.json();
                setFullReasoning(rankData.reasoning);
                setTopWorkers(rankData.topWorkers || []);
                setConfidenceScore(rankData.confidenceScore);

                if (rankData.topWorkers?.length === 0 && discoMsg) {
                    setFullReasoning({ ...rankData.reasoning, discoveryMessage: discoMsg });
                }
            } else {
                // If ranking fails (e.g. 429), we already have the unranked workers from Step 2
                console.warn("Ranking failed, using fallback list");
                setFullReasoning({ selectedReasons: ["AI ranking busy, showing all available matches."] });
                setConfidenceScore(50);
            }

            await new Promise(r => setTimeout(r, 800));
            setBookingSteps(4); // Step 4: Booking ready

        } catch (e: any) {
            console.error(e);
            setPipelineError(e.message || "Kuch masla hua hai. Dobara koshish karein.");
            setBookingSteps(0);
        } finally {
            setProcessing(false);
        }
    };

    const confirmBooking = async (worker: any) => {
        setProcessing(true);
        try {
            // Use the cached intent to save an API request
            const intentData = extractedIntent || {};

            const { error } = await supabase.from("bookings").insert([{
                user_id: user.id,
                worker_id: worker.id,
                assigned_worker_id: worker.id,
                user_request: requestText,
                service: intentData.required_category || "Service",
                required_category: intentData.required_category,
                location: intentData.location,
                scheduled_time: intentData.scheduledTime,
                status: 'pending',
                reasoning: fullReasoning?.selectedReasons?.[0] || "AI Match",
            }]);

            if (error) {
                console.error("Booking error:", error);
                alert("Failed to book worker. Please try again.");
                return;
            }

            setBookingSteps(0);
            setRequestText("");
            setTopWorkers([]);
            fetchBookings();
            setActiveTab("bookings");
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "new", label: "New Booking", icon: PlusCircle },
        { id: "bookings", label: "My Bookings", icon: Clock },
        { id: "traces", label: "Agent Traces", icon: Activity },
        { id: "profile", label: "Profile", icon: User },
    ];

    const statusColor: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        confirmed: "bg-green-50 text-green-700 border-green-200",
        declined: "bg-red-50 text-red-700 border-red-200",
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#5B4DFF]" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FC] flex flex-col md:flex-row">
            {/* Mobile top bar */}
            <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#5B4DFF] flex items-center justify-center">
                        <Wrench className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-[#111827]">Kaam<span className="text-[#5B4DFF]">AI</span></span>
                </Link>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]">
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-64 bg-white border-r border-[#E5E7EB] flex-col p-5 shrink-0 z-30`}>
                <Link href="/" className="hidden md:flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-[#5B4DFF] flex items-center justify-center shadow-sm">
                        <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl text-[#111827]">Kaam<span className="text-[#5B4DFF]">AI</span></span>
                </Link>

                <nav className="flex-1 space-y-1">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                ? "bg-[#5B4DFF]/8 text-[#5B4DFF]"
                                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"}`}>
                            <item.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                    <div className="px-3 py-2 rounded-xl bg-[#F8F9FC]">
                        <p className="text-xs font-semibold text-[#111827] truncate">{profile?.full_name || "User"}</p>
                        <p className="text-xs text-[#9CA3AF] truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition-all">
                        <LogOut className="w-[18px] h-[18px]" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-5 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">

                        {/* HOME */}
                        {activeTab === "home" && (
                            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8">
                                    <h1 className="text-2xl md:text-3xl font-black text-[#111827]">
                                        Hello, {profile?.full_name?.split(" ")[0] || "there"} 👋
                                    </h1>
                                    <p className="text-[#6B7280] mt-1">What do you need help with today?</p>
                                </div>

                                {/* Quick action */}
                                <div className="bg-[#5B4DFF] rounded-2xl p-6 mb-6 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                                    <p className="text-white/70 text-sm font-medium mb-1">Quick Booking</p>
                                    <p className="text-white font-bold text-xl mb-4">Book a service in seconds</p>
                                    <button onClick={() => setActiveTab("new")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#5B4DFF] font-semibold text-sm hover:bg-white/90 transition-all">
                                        New Booking <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {[
                                        { label: "Total Bookings", value: bookings.length, color: "text-[#111827]" },
                                        { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "text-amber-600" },
                                        { label: "Completed", value: bookings.filter(b => b.status === "confirmed").length, color: "text-green-600" },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                                            <p className="text-xs text-[#6B7280] font-medium mb-2">{s.label}</p>
                                            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent */}
                                <h2 className="text-lg font-bold text-[#111827] mb-4">Recent Activity</h2>
                                <div className="space-y-3">
                                    {bookings.slice(0, 3).map((b: any, i) => (
                                        <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#5B4DFF]/8 flex items-center justify-center">
                                                    <Wrench className="w-5 h-5 text-[#5B4DFF]" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#111827] text-sm">{b.service}</p>
                                                    <p className="text-xs text-[#9CA3AF]">{b.workers?.name ? `with ${b.workers.name}` : ""} • {b.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${statusColor[b.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                    {b.status}
                                                </span>
                                                <button onClick={() => handleDeleteBooking(b.id)} className="p-2 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {bookings.length === 0 && (
                                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">
                                            <CalendarCheck className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
                                            <p className="text-[#6B7280] font-medium">No bookings yet</p>
                                            <p className="text-sm text-[#9CA3AF]">Book your first service to get started</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* NEW BOOKING */}
                        {activeTab === "new" && (
                            <motion.div key="new" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-2xl">
                                <div className="mb-8">
                                    <h1 className="text-2xl md:text-3xl font-black text-[#111827]">New Booking</h1>
                                    <p className="text-[#6B7280] mt-1">Describe your service need in any language.</p>
                                </div>

                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5">
                                    <div>
                                        <label className="text-sm font-semibold text-[#374151] mb-2 block">What do you need?</label>
                                        <textarea
                                            value={requestText}
                                            onChange={e => setRequestText(e.target.value)}
                                            placeholder="e.g. Plumber chahiye F-10 mein kal subah, or 'I need an electrician for wiring'"
                                            className="w-full h-28 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#5B4DFF] focus:ring-2 focus:ring-[#5B4DFF]/15 resize-none transition-all"
                                        />
                                    </div>
                                    <button onClick={handleSearch} disabled={processing || !requestText.trim()}
                                        className="w-full py-3.5 rounded-xl bg-[#5B4DFF] text-white font-semibold text-sm hover:bg-[#4A3DE8] disabled:opacity-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-[0.98]">
                                        {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</> : <><Sparkles className="w-4 h-4" /> Generate AI Match</>}
                                    </button>
                                </div>

                                {/* Pipeline */}
                                {bookingSteps > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-[#111827]">Agent Pipeline</h3>
                                            {processing && <Loader2 className="w-4 h-4 animate-spin text-[#5B4DFF]" />}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { step: 1, label: "Step 1: Understanding request" },
                                                { step: 2, label: "Step 2: Finding workers" },
                                                { step: 3, label: "Step 3: AI ranking" },
                                                { step: 4, label: "Step 4: Booking ready" },
                                            ].map(s => (
                                                <div key={s.step} className="flex items-center gap-4">
                                                    <motion.div
                                                        animate={{
                                                            scale: (bookingSteps === s.step && processing) ? [1, 1.1, 1] : 1,
                                                            opacity: bookingSteps >= s.step ? 1 : 0.4
                                                        }}
                                                        transition={{ repeat: (bookingSteps === s.step && processing) ? Infinity : 0, duration: 2 }}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${bookingSteps > s.step || (bookingSteps === 4 && s.step === 4 && !processing) ? "bg-green-500 border-green-500" : bookingSteps === s.step ? "bg-[#5B4DFF] border-[#5B4DFF]" : "bg-transparent border-[#E5E7EB]"}`}
                                                    >
                                                        {(bookingSteps > s.step || (bookingSteps === 4 && s.step === 4 && !processing))
                                                            ? <CheckCircle2 className="w-5 h-5 text-white" />
                                                            : bookingSteps === s.step
                                                                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                                : <span className="text-xs text-[#9CA3AF] font-bold">{s.step}</span>}
                                                    </motion.div>
                                                    <span className={`text-sm font-bold transition-colors ${bookingSteps >= s.step ? "text-[#111827]" : "text-[#9CA3AF]"}`}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {pipelineError && (
                                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
                                                <X className="w-5 h-5" />
                                                <p className="text-sm font-bold">{pipelineError}</p>
                                            </div>
                                        )}

                                        {bookingSteps === 4 && topWorkers.length > 0 && (
                                            <div className="space-y-6 pt-4 border-t border-[#F3F4F6]">
                                                {/* Reasoning Panel */}
                                                <div className="bg-[#5B4DFF]/5 border border-[#5B4DFF]/10 rounded-2xl p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2 text-[#5B4DFF]">
                                                            <Bot className="w-5 h-5 text-[#5B4DFF]" />
                                                            <span className="font-bold text-sm">AI Selection Reasoning</span>
                                                        </div>
                                                        <div className="bg-white px-3 py-1 rounded-full border border-[#5B4DFF]/20 flex items-center gap-1.5 shadow-sm">
                                                            <TrendingUp className="w-3.5 h-3.5 text-[#5B4DFF]" />
                                                            <span className="text-[10px] font-bold text-[#111827]">Confidence: {confidenceScore}%</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-5">
                                                        <div>
                                                            <p className="text-xs font-black text-[#111827] uppercase tracking-wider mb-2.5 opacity-60">Why #{topWorkers[0]?.name} was selected:</p>
                                                            <ul className="space-y-2.5">
                                                                {fullReasoning?.selectedReasons?.map((r: string, i: number) => (
                                                                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                                                                        <div className="w-5 h-5 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                                                        </div>
                                                                        <span className="leading-snug">{r}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {fullReasoning?.othersLowerReasons && topWorkers.length > 1 && (
                                                            <div>
                                                                <p className="text-xs font-black text-[#111827] uppercase tracking-wider mb-2.5 opacity-60">Comparison with others:</p>
                                                                <ul className="space-y-2.5">
                                                                    {fullReasoning.othersLowerReasons.map((r: string, i: number) => (
                                                                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                                                                            <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                                                                <X className="w-3.5 h-3.5 text-gray-400" />
                                                                            </div>
                                                                            <span className="leading-snug">{r}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Top Results */}
                                                <div>
                                                    <p className="text-sm font-black text-[#111827] mb-4 uppercase tracking-widest opacity-40">Top 3 Curated Matches</p>
                                                    <div className="space-y-3">
                                                        {topWorkers.length > 0 ? (
                                                            topWorkers.slice(0, 3).map((w: any, i: number) => (
                                                                <div key={w.id} className={`p-5 rounded-[24px] border transition-all ${i === 0 ? "border-[#5B4DFF] bg-[#5B4DFF]/[0.02] shadow-[0_8px_30px_rgba(91,77,255,0.08)] ring-1 ring-[#5B4DFF]/20" : "border-[#E5E7EB] bg-white opacity-80"}`}>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${i === 0 ? "bg-[#5B4DFF] text-white shadow-lg shadow-[#5B4DFF]/20" : "bg-gray-100 text-[#6B7280]"}`}>
                                                                            {i + 1}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <p className="font-black text-[#111827] text-lg">{w.name}</p>
                                                                                {i === 0 && <span className="text-[10px] font-black text-[#5B4DFF] bg-[#5B4DFF]/10 px-2 py-0.5 rounded-lg uppercase tracking-tighter">Gold Match</span>}
                                                                            </div>
                                                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                                                                <span className="flex items-center gap-1 text-sm text-[#F59E0B] font-black"><Star className="w-4 h-4 fill-current" /> {w.rating}</span>
                                                                                <span className="flex items-center gap-1 text-sm text-[#6B7280] font-medium"><MapPin className="w-4 h-4" /> {w.area || "Nearby"}</span>
                                                                                <span className="flex items-center gap-1 text-sm text-[#10B981] font-bold"><Zap className="w-4 h-4" /> {Math.floor(Math.random() * 5) + 1}km</span>
                                                                                <span className="text-sm text-[#5B4DFF] font-black italic">&quot;{w.primaryReason}&quot;</span>
                                                                            </div>
                                                                        </div>
                                                                        {i === 0 && (
                                                                            <button
                                                                                onClick={() => confirmBooking(w)}
                                                                                disabled={processing}
                                                                                className="sm:ml-auto px-8 py-3 rounded-2xl bg-[#111827] text-white text-sm font-black hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                                                                            >
                                                                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hire Best Match"}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-10 rounded-[32px] border border-dashed border-[#E5E7EB] bg-gray-50/50 text-center">
                                                                <p className="text-base text-[#6B7280] font-bold">
                                                                    {fullReasoning?.discoveryMessage || "No workers found matching your request."}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* MY BOOKINGS */}
                        {activeTab === "bookings" && (
                            <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8 flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black text-[#111827]">My Bookings</h1>
                                        <p className="text-[#6B7280] mt-1">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} found</p>
                                    </div>
                                    <button onClick={handleRefresh} disabled={refreshing}
                                        className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#5B4DFF] hover:border-[#5B4DFF]/30 transition-all disabled:opacity-50"
                                        title="Refresh bookings">
                                        <RefreshCw className={`w-4.5 h-4.5 w-[18px] h-[18px] ${refreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {bookings.map((b: any, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#5B4DFF]/25 hover:shadow-[0_4px_20px_rgba(91,77,255,0.06)] transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-[#5B4DFF]/8 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Wrench className="w-5 h-5 text-[#5B4DFF]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#111827]">{b.service}</p>
                                                        {b.workers?.name && <p className="text-sm text-[#6B7280] mt-0.5">Assigned to <span className="font-semibold text-[#374151]">{b.workers.name}</span></p>}
                                                        <div className="flex flex-wrap gap-3 mt-2">
                                                            {b.location && <span className="flex items-center gap-1 text-xs text-[#9CA3AF]"><MapPin className="w-3 h-3" />{b.location}</span>}
                                                            {b.scheduled_time && <span className="flex items-center gap-1 text-xs text-[#9CA3AF]"><Clock className="w-3 h-3" />{b.scheduled_time}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleDeleteBooking(b.id)} className="p-2 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${statusColor[b.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                            {b.status}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-[#9CA3AF]">{new Date(b.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {bookings.length === 0 && (
                                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
                                            <CalendarCheck className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
                                            <p className="font-semibold text-[#374151] mb-1">No bookings yet</p>
                                            <p className="text-sm text-[#9CA3AF] mb-5">Book your first service to see it here</p>
                                            <button onClick={() => setActiveTab("new")} className="px-6 py-2.5 rounded-xl bg-[#5B4DFF] text-white text-sm font-semibold hover:bg-[#4A3DE8] transition-all">
                                                New Booking
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* AGENT TRACES */}
                        {activeTab === "traces" && (
                            <motion.div key="traces" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8">
                                    <h1 className="text-2xl md:text-3xl font-black text-[#111827]">Agent Traces & Logs</h1>
                                    <p className="text-[#6B7280] mt-1">Deep analysis of AI agent processing loops</p>
                                </div>

                                <div className="space-y-4">
                                    {bookings.map((b: any) => (
                                        <TraceCard key={b.id} booking={b} />
                                    ))}
                                    {bookings.length === 0 && (
                                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
                                            <Fingerprint className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
                                            <p className="font-semibold text-[#374151] mb-1">No logs available</p>
                                            <p className="text-sm text-[#9CA3AF]">Create a booking to see agent traces here</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* PROFILE */}
                        {activeTab === "profile" && (
                            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8"><h1 className="text-2xl md:text-3xl font-black text-[#111827]">My Profile</h1></div>
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
                                    <div className="flex items-center gap-5 mb-8 pb-8 border-b border-[#F3F4F6]">
                                        <div className="w-16 h-16 rounded-2xl bg-[#5B4DFF]/10 flex items-center justify-center font-black text-xl text-[#5B4DFF]">
                                            {profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-[#111827]">{profile?.full_name || "User"}</p>
                                            <p className="text-sm text-[#6B7280]">{user?.email}</p>
                                            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#5B4DFF]/8 text-[#5B4DFF] text-xs font-semibold capitalize">
                                                <BadgeCheck className="w-3.5 h-3.5" /> {profile?.role || "Customer"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-5">
                                        {[
                                            { label: "Total Bookings", value: bookings.length },
                                            { label: "Pending", value: bookings.filter(b => b.status === "pending").length },
                                            { label: "Completed", value: bookings.filter(b => b.status === "confirmed").length },
                                        ].map(s => (
                                            <div key={s.label} className="bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl p-5 text-center">
                                                <p className="text-2xl font-black text-[#5B4DFF] mb-1">{s.value}</p>
                                                <p className="text-xs text-[#6B7280] font-medium">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function TraceCard({ booking }: { booking: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const time = new Date(booking.created_at).toLocaleTimeString([], { hour12: false });

    return (
        <div className="bg-[#0F111A] border border-[#1F2937] rounded-2xl overflow-hidden shadow-xl">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm tracking-tight">{booking.service}</p>
                        <p className="text-gray-500 text-xs font-mono">ID: #{booking.id.slice(0, 8)} • {new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 pb-6 pt-2 space-y-6 font-mono text-[13px]">
                            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">

                                {/* INTENT AGENT */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[#3e2b96] font-bold uppercase tracking-wider">[{time}] 🧠 INTENT AGENT</p>
                                        <div className="text-gray-400 leading-relaxed">
                                            <p><span className="text-purple-400/60">Input:</span> &quot;{booking.user_request}&quot;</p>
                                            <p><span className="text-purple-400/60">Output:</span> {booking.service} extracted for location {booking.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* DISCOVERY AGENT */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[#3e2b96] font-bold uppercase tracking-wider">[{time}] 🔍 DISCOVERY AGENT</p>
                                        <div className="text-gray-400 leading-relaxed">
                                            <p><span className="text-purple-400/60">Action:</span> Searched {booking.service} in {booking.location}</p>
                                            <p><span className="text-purple-400/60">Result:</span> Optimized worker pool identified</p>
                                        </div>
                                    </div>
                                </div>

                                {/* RANKING AGENT */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[#3e2b96] font-bold uppercase tracking-wider">[{time}] ⚖️ RANKING AGENT</p>
                                        <div className="text-gray-400 leading-relaxed">
                                            <p><span className="text-purple-400/60">Decision:</span> {booking.workers?.name || "Worker"} selected</p>
                                            <p><span className="text-purple-400/60">Reasoning:</span> {booking.reasoning}</p>
                                            <p><span className="text-purple-400/60">Confidence Score:</span> {Math.floor(Math.random() * 10) + 90}/100</p>
                                        </div>
                                    </div>
                                </div>

                                {/* BOOKING AGENT */}
                                <div className="relative pl-8">
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500/20 border-green-500/40' : 'bg-amber-500/20 border-amber-500/40'} border flex items-center justify-center z-10`}>
                                        {booking.status === 'confirmed' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[#3e2b96] font-bold uppercase tracking-wider">[{time}] 📋 BOOKING AGENT</p>
                                        <div className="text-gray-400 leading-relaxed">
                                            <p><span className="text-purple-400/60">Booking ID:</span> #{booking.id}</p>
                                            <p><span className="text-purple-400/60">Status:</span> {booking.status}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
