"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home, ClipboardList, User, LogOut, Check, X,
    Bell, Menu, Wrench, TrendingUp, Clock,
    DollarSign, MapPin, BadgeCheck, CalendarCheck, Trash2,
    Star, Sparkles, Zap, ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function WorkerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("home");
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        let channel: any;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push("/auth"); return; }
            setUser(session.user);
            const { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
            if (p) {
                if (p.role !== "worker") { router.push("/dashboard/user"); return; }
                setProfile(p);
            }

            // First fetch existing records
            await fetchBookings(session.user.id);
            setLoading(false);

            // Then subscribe to new ones
            channel = supabase.channel(`bookings:worker:${session.user.id}:${Date.now()}`)
                .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "bookings",
                    filter: `assigned_worker_id=eq.${session.user.id}`
                }, payload => {
                    setBookings(cur => {
                        if (cur.some(b => b.id === payload.new.id)) return cur;
                        return [payload.new, ...cur];
                    });
                })
                .on("postgres_changes", {
                    event: "UPDATE",
                    schema: "public",
                    table: "bookings",
                    filter: `assigned_worker_id=eq.${session.user.id}`
                }, payload => {
                    setBookings(cur => cur.map(b => b.id === payload.new.id ? payload.new : b));
                })
                .subscribe();
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [router]);

    const fetchBookings = async (userId: string) => {
        const { data } = await supabase
            .from("bookings")
            .select("*")
            .eq('assigned_worker_id', userId)
            .order("created_at", { ascending: false });
        if (data) setBookings(data);
    };

    const toggleAvailability = async () => {
        if (!profile || updatingAvailability) return;
        setUpdatingAvailability(true);
        const newStatus = !profile.available;
        const { error } = await supabase.from("profiles").update({ available: newStatus }).eq("id", user.id);
        if (!error) {
            setProfile({ ...profile, available: newStatus });
        }
        setUpdatingAvailability(false);
    };

    const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

    const handleDeleteBooking = async (id: string) => {
        if (!confirm("Are you sure you want to remove this job from your list?")) return;
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

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
        if (!error) setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    };

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "bookings", label: "Bookings", icon: ClipboardList },
        { id: "profile", label: "Profile", icon: User },
    ];

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === "pending").length,
        completed: bookings.filter(b => b.status === "confirmed" || b.status === "completed").length,
        declined: bookings.filter(b => b.status === "declined").length,
    };

    const statusColor: any = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        confirmed: "bg-green-50 text-green-700 border-green-200",
        declined: "bg-red-50 text-red-700 border-red-200",
        completed: "bg-blue-50 text-blue-700 border-blue-200"
    };

    const getServiceIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'plumber': return "🔧";
            case 'electrician': return "⚡";
            case 'carpenter': return "🪚";
            case 'painter': return "🖌️";
            case 'ac technician': return "❄️";
            case 'cleaner': return "🧹";
            default: return "👷";
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#5B4DFF] border-t-transparent rounded-full animate-spin" />
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
                <div className="flex items-center gap-2">
                    {profile?.available && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-green-700">Live</span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]">
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-64 bg-white border-r border-[#E5E7EB] flex-col p-5 shrink-0 z-30`}>
                <Link href="/" className="hidden md:flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-[#5B4DFF] flex items-center justify-center shadow-sm">
                        <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl text-[#111827]">Kaam<span className="text-[#5B4DFF]">AI</span></span>
                </Link>

                {/* Online toggle */}
                <div className="mb-6 p-3 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full transition-colors ${profile?.available ? "bg-green-500" : "bg-[#D1D5DB]"}`} />
                        <span className="text-sm font-semibold text-[#111827]">{profile?.available ? "Available" : "Busy"}</span>
                    </div>
                    <button onClick={toggleAvailability} disabled={updatingAvailability}
                        className={`w-10 h-6 rounded-full relative transition-colors ${profile?.available ? "bg-[#10B981]" : "bg-[#D1D5DB]"} ${updatingAvailability ? "opacity-50" : ""}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${profile?.available ? "left-5" : "left-1"}`} />
                    </button>
                </div>

                {/* Pending badge */}
                {stats.pending > 0 && (
                    <div className="mb-4 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-xs font-semibold text-amber-700">{stats.pending} new job{stats.pending > 1 ? "s" : ""} waiting</p>
                    </div>
                )}

                <nav className="flex-1 space-y-1">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                ? "bg-[#5B4DFF]/8 text-[#5B4DFF]"
                                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"}`}>
                            <item.icon className="w-[18px] h-[18px]" />
                            {item.label}
                            {item.id === "bookings" && stats.pending > 0 && (
                                <span className="ml-auto w-5 h-5 rounded-full bg-[#5B4DFF] text-white text-[10px] font-bold flex items-center justify-center">
                                    {stats.pending}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                    <div className="px-3 py-2 rounded-xl bg-[#F8F9FC]">
                        <p className="text-xs font-semibold text-[#111827] truncate">{profile?.full_name || "Worker"}</p>
                        <p className="text-xs text-[#9CA3AF] truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition-all">
                        <LogOut className="w-[18px] h-[18px]" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-5 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">

                        {/* HOME */}
                        {activeTab === "home" && (
                            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

                                {/* Header Card */}
                                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                        <Wrench className="w-48 h-48 rotate-12" />
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-20 h-20 rounded-2xl bg-[#5B4DFF]/10 flex items-center justify-center text-3xl shrink-0">
                                                {getServiceIcon(profile?.service_category)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h1 className="text-2xl font-black text-[#111827]">{profile?.full_name}</h1>
                                                    <span className="px-2.5 py-0.5 rounded-lg bg-[#5B4DFF]/10 text-[#5B4DFF] text-[10px] font-bold uppercase tracking-wider">
                                                        {profile?.service_category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
                                                        <Star className="w-4 h-4 fill-current" /> {profile?.rating || "5.0"}
                                                    </span>
                                                    <span className="text-[#E5E7EB]">•</span>
                                                    <span className="flex items-center gap-1 text-[#6B7280]">
                                                        <MapPin className="w-4 h-4" /> {profile?.area}, {profile?.city}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${profile?.available ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                                                <span className={`w-2 h-2 rounded-full ${profile?.available ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                                                <span className="text-sm font-bold">{profile?.available ? "🟢 Available" : "🔴 Busy"}</span>
                                            </div>
                                            <button onClick={toggleAvailability} disabled={updatingAvailability}
                                                className="px-6 py-2.5 rounded-2xl bg-[#111827] text-white text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-sm">
                                                Toggle Status
                                            </button>
                                        </div>
                                    </div>

                                    {/* Skills chips */}
                                    {profile?.skills && profile.skills.length > 0 && (
                                        <div className="mt-8 flex flex-wrap gap-2">
                                            {profile.skills.map((skill: string, i: number) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[#374151] text-xs font-semibold flex items-center gap-1.5">
                                                    <ShieldCheck className="w-3 h-3 text-[#5B4DFF]" /> {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                    {[
                                        { label: "Total Jobs", value: stats.total, icon: ClipboardList, color: "text-[#111827]", bg: "bg-[#5B4DFF]/8", ic: "text-[#5B4DFF]" },
                                        { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-700", bg: "bg-amber-50", ic: "text-amber-600" },
                                        { label: "Completed", value: stats.completed, icon: Check, color: "text-green-700", bg: "bg-green-50", ic: "text-green-600" },
                                        { label: "Est. Earnings", value: `Rs ${(stats.completed * 1500).toLocaleString()}`, icon: DollarSign, color: "text-[#5B4DFF]", bg: "bg-[#5B4DFF]/8", ic: "text-[#5B4DFF]" },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-shadow">
                                            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                                                <s.icon className={`w-[18px] h-[18px] ${s.ic}`} />
                                            </div>
                                            <p className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</p>
                                            <p className="text-xs text-[#6B7280] font-medium">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent bookings preview */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-[#111827]">Recent Activity</h2>
                                    <button onClick={() => setActiveTab("bookings")} className="text-sm font-bold text-[#5B4DFF] hover:underline">View all</button>
                                </div>
                                <div className="space-y-3">
                                    {bookings.slice(0, 3).map((b: any, i) => (
                                        <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#5B4DFF]/8 flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-[#5B4DFF]" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#111827] text-sm">{b.user_request.substring(0, 50)}...</p>
                                                    <p className="text-xs text-[#9CA3AF]">{b.location} • {new Date(b.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${statusColor[b.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {bookings.length === 0 && (
                                        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-12 text-center">
                                            <CalendarCheck className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
                                            <p className="text-[#111827] font-bold mb-1">Abhi koi booking nahi hai</p>
                                            <p className="text-sm text-[#6B7280]">Jab koi {profile?.service_category || "professional"} book karega toh yahan dikhega</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* BOOKINGS */}
                        {activeTab === "bookings" && (
                            <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black text-[#111827]">
                                            Meri {profile?.service_category} Bookings
                                        </h1>
                                        <p className="text-[#6B7280] mt-1">{stats.pending > 0 ? `${stats.pending} waiting for your response` : "All caught up!"}</p>
                                    </div>
                                    {stats.pending > 0 && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
                                            <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                                            <span className="text-sm font-bold text-amber-700">{stats.pending} New Tasks</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {bookings.map((b: any) => (
                                            <motion.div key={b.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                                                className={`bg-white border rounded-3xl p-6 transition-all ${b.status === "pending"
                                                    ? "border-[#5B4DFF]/30 shadow-[0_10px_40px_rgba(91,77,255,0.06)] ring-1 ring-[#5B4DFF]/10"
                                                    : "border-[#E5E7EB] opacity-90 grayscale-[0.3]"}`}>
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-[#5B4DFF]/10 flex items-center justify-center shrink-0">
                                                                <Zap className="w-6 h-6 text-[#5B4DFF]" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <span className="px-2.5 py-0.5 text-[10px] font-black text-[#5B4DFF] bg-[#5B4DFF]/10 rounded-md uppercase tracking-tighter">New Request</span>
                                                                    <span className="text-xs text-[#9CA3AF] font-medium">{new Date(b.created_at).toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-[#111827] font-bold text-lg leading-tight mb-2">&ldquo;{b.user_request}&rdquo;</p>
                                                                <div className="flex flex-wrap gap-4 text-sm">
                                                                    <span className="flex items-center gap-1.5 text-[#374151] font-semibold"><MapPin className="w-4 h-4 text-[#6B7280]" />{b.location}</span>
                                                                    <span className="flex items-center gap-1.5 text-[#374151] font-semibold"><Clock className="w-4 h-4 text-[#6B7280]" />{b.scheduled_time || "Asap"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${statusColor[b.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                            {b.status}
                                                        </span>
                                                    </div>

                                                    {/* AI Reasoning Section */}
                                                    {b.reasoning && (
                                                        <div className="bg-[#F8F9FC] rounded-2xl p-4 border border-[#E5E7EB]">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-6 h-6 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center">
                                                                    <Wrench className="w-3 h-3 text-[#5B4DFF]" />
                                                                </div>
                                                                <p className="text-xs font-black text-[#111827] uppercase tracking-widest">AI Selection Reason</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {/* Handle both object reasoning and string reasoning if any */}
                                                                {typeof b.reasoning === 'object' ? (
                                                                    b.reasoning.selectedReasons?.slice(0, 2).map((r: string, idx: number) => (
                                                                        <div key={idx} className="flex items-start gap-2 text-sm text-[#4B5563]">
                                                                            <Check className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                                                                            <span>{r}</span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-sm text-[#4B5563] italic">"{b.reasoning}"</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-3">
                                                            {b.status === "pending" && (
                                                                <>
                                                                    <button onClick={() => updateStatus(b.id, "confirmed")} className="px-6 py-2 bg-[#111827] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95">Accept Job</button>
                                                                    <button onClick={() => updateStatus(b.id, "declined")} className="px-5 py-2 border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 text-sm font-bold rounded-xl transition-all active:scale-95">Decline</button>
                                                                </>
                                                            )}
                                                            {b.status === "confirmed" && (
                                                                <button onClick={() => updateStatus(b.id, "completed")} className="px-6 py-2 bg-[#5B4DFF] hover:bg-[#4A3DE8] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95">Complete Job</button>
                                                            )}
                                                        </div>
                                                        <button onClick={() => handleDeleteBooking(b.id)} className="p-2.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {bookings.length === 0 && (
                                        <div className="bg-white border border-[#E5E7EB] rounded-[40px] p-20 text-center">
                                            <div className="w-20 h-20 bg-[#F3F4F6] rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <ClipboardList className="w-10 h-10 text-[#D1D5DB]" />
                                            </div>
                                            <h2 className="text-2xl font-black text-[#111827] mb-2">Abhi koi booking nahi hai</h2>
                                            <p className="text-base text-[#6B7280] max-w-md mx-auto">
                                                Jab koi {profile?.service_category || "professional"} book karega toh yahan dikhega. Stay online!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* PROFILE */}
                        {activeTab === "profile" && (
                            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8 font-black text-2xl text-[#111827]">Account Settings</div>
                                <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm">
                                    <div className="flex items-center gap-6 mb-10 pb-10 border-b border-[#F3F4F6]">
                                        <div className="w-24 h-24 rounded-[32px] bg-[#5B4DFF]/10 flex items-center justify-center text-3xl font-black text-[#5B4DFF]">
                                            {profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "W"}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-[#111827]">{profile?.full_name}</h2>
                                            <p className="text-[#6B7280] font-medium">{user?.email}</p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B4DFF]/8 text-[#5B4DFF] text-xs font-bold uppercase tracking-wider">
                                                    <BadgeCheck className="w-3.5 h-3.5" /> Verified Kaam Expert
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xs font-black text-[#111827] uppercase tracking-widest mb-4 opacity-40">Professional Details</h3>
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-3xl bg-[#F8F9FC] border border-[#E5E7EB]">
                                                    <p className="text-[10px] font-bold text-[#6B7280] uppercase mb-1">Service category</p>
                                                    <p className="font-black text-[#111827] flex items-center gap-2">
                                                        <span className="text-lg">{getServiceIcon(profile?.service_category)}</span>
                                                        {profile?.service_category}
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-3xl bg-[#F8F9FC] border border-[#E5E7EB]">
                                                    <p className="text-[10px] font-bold text-[#6B7280] uppercase mb-2">My Skills</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {profile?.skills?.map((s: string, i: number) => (
                                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-bold text-[#374151]">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-black text-[#111827] uppercase tracking-widest mb-4 opacity-40">Business Performance</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 rounded-3xl bg-[#5B4DFF]/5 border border-[#5B4DFF]/10 text-center">
                                                    <p className="text-2xl font-black text-[#5B4DFF] mb-1">{stats.completed}</p>
                                                    <p className="text-[10px] font-bold text-[#6B7280] uppercase">Jobs Done</p>
                                                </div>
                                                <div className="p-5 rounded-3xl bg-[#F59E0B]/5 border border-[#F59E0B]/10 text-center">
                                                    <p className="text-2xl font-black text-[#F59E0B] mb-1">{profile?.rating || "5.0"}</p>
                                                    <p className="text-[10px] font-bold text-[#6B7280] uppercase">Avg Rating</p>
                                                </div>
                                            </div>
                                        </div>
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
