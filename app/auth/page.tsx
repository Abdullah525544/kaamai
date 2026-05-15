"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Loader2, Wrench, AlertCircle, CheckCircle2, Mail, Lock, User,
    BadgeCheck, MapPin, Clock, ChevronRight, ChevronLeft, Briefcase, GraduationCap
} from "lucide-react";

function friendlyError(msg: string): string {
    if (msg.includes("rate limit") || msg.includes("email rate"))
        return "Too many signup attempts. Please wait a few minutes and try again, or use a different email.";
    if (msg.includes("Invalid login") || msg.includes("invalid_credentials"))
        return "Incorrect email or password. Please try again.";
    if (msg.includes("already registered") || msg.includes("already been registered"))
        return "This email is already registered. Please sign in instead.";
    if (msg.includes("Password should be at least"))
        return "Password must be at least 6 characters.";
    if (msg.includes("valid email"))
        return "Please enter a valid email address.";
    return msg;
}

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    // Step 1: Basic Info
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<"customer" | "worker">("customer");

    // Step 2: Service Profile
    const [category, setCategory] = useState("Plumber");
    const [skills, setSkills] = useState("");
    const [experience, setExperience] = useState("");
    const [certifications, setCertifications] = useState("");

    // Step 3: Availability
    const [city, setCity] = useState("Islamabad");
    const [area, setArea] = useState("");
    const [days, setDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    const [hours, setHours] = useState("9am - 6pm");

    const categories = ["Plumber", "Electrician", "Carpenter", "Painter", "AC Technician", "Cleaner"];
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const toggleDay = (day: string) => {
        setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const handleNext = () => {
        setError("");

        // Guard for all required fields in step 1
        if (step === 1 && (!email || !password || (!isLogin && !fullName))) {
            setError("Please fill all required fields");
            return;
        }

        // If it's login or customer signup, we submit right away from step 1
        if (isLogin || (role === "customer" && !isLogin)) {
            handleSubmit();
            return;
        }

        // For workers, prevent going beyond step 3
        if (step >= 3) return;

        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step <= 1) return;
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
                router.push(profile?.role === "worker" ? "/dashboard/worker" : "/dashboard/user");
            } else {
                const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
                if (authError) throw authError;

                if (authData.user) {
                    const profileData: any = {
                        id: authData.user.id,
                        full_name: fullName,
                        role,
                        available: true,
                        rating: 5.0
                    };

                    if (role === "worker") {
                        profileData.service_category = category;
                        profileData.skills = skills.split(",").map(s => s.trim()).filter(s => s !== "");
                        profileData.experience_years = parseInt(experience) || 0;
                        profileData.certifications = certifications;
                        profileData.city = city;
                        profileData.area = area;
                        profileData.availability_days = days;
                        profileData.availability_hours = hours;
                    }

                    const { error: profileError } = await supabase.from("profiles").insert([profileData]);
                    if (profileError) throw profileError;

                    // Also add to workers table if it's a worker for discovery persistence
                    if (role === "worker") {
                        await supabase.from("workers").insert([{
                            id: authData.user.id,
                            name: fullName,
                            service: category,
                            area: area || "General",
                            city: city,
                            service_category: category,
                            skills: profileData.skills,
                            experience_years: profileData.experience_years,
                            certifications,
                            availability_days: days,
                            availability_hours: hours,
                            rating: 5.0,
                            available: true
                        }]);
                    }

                    router.push(role === "worker" ? "/dashboard/worker" : "/dashboard/user");
                }
            }
        } catch (err: any) {
            setError(friendlyError(err.message || "Something went wrong. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5B4DFF]/5 rounded-bl-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#5B4DFF]/4 rounded-tr-[120px] pointer-events-none" />

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-8 group z-10">
                <div className="w-9 h-9 rounded-xl bg-[#5B4DFF] flex items-center justify-center shadow-sm group-hover:shadow-[0_0_0_4px_#5B4DFF22] transition-all">
                    <Wrench className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" />
                </div>
                <span className="font-bold text-2xl text-[#111827]">Kaam<span className="text-[#5B4DFF]">AI</span></span>
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] z-10">

                {/* Header */}
                <div className="text-center mb-7">
                    <h1 className="text-2xl font-black text-[#111827] mb-1">
                        {isLogin ? "Welcome back" : (role === "worker" ? `Worker Signup (${step}/3)` : "Create account")}
                    </h1>
                    <p className="text-sm text-[#6B7280]">
                        {isLogin ? "Sign in to your KaamAI account" : (role === "worker" ? "Set up your professional profile" : "Join Pakistan&apos;s service marketplace")}
                    </p>
                </div>

                {/* Tab toggle - only on Step 1 */}
                {step === 1 && (
                    <div className="flex bg-[#F3F4F6] p-1 rounded-xl mb-7">
                        {["Sign In", "Sign Up"].map((label, i) => (
                            <button key={label} type="button" onClick={() => { setIsLogin(i === 0); setError(""); setSuccess(""); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${(isLogin ? i === 0 : i === 1) ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-4">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                {!isLogin && (
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                                                className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B4DFF] focus:ring-2 focus:ring-[#5B4DFF]/15 transition-all"
                                                placeholder="Ahmad Khan" />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B4DFF] focus:ring-2 focus:ring-[#5B4DFF]/15 transition-all"
                                            placeholder="ahmad@example.com" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B4DFF] focus:ring-2 focus:ring-[#5B4DFF]/15 transition-all"
                                            placeholder="••••••••" />
                                    </div>
                                </div>

                                {!isLogin && (
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-2">I want to...</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: "customer", label: "Hire a Worker", icon: "🏠" },
                                                { value: "worker", label: "Work & Earn", icon: "🔧" },
                                            ].map(opt => (
                                                <label key={opt.value}
                                                    className={`flex flex-col items-center gap-1.5 border rounded-xl p-3.5 cursor-pointer transition-all text-sm font-semibold text-center ${role === opt.value ? "bg-[#5B4DFF]/8 border-[#5B4DFF] text-[#5B4DFF]" : "bg-[#F8F9FC] border-[#E5E7EB] text-[#6B7280] hover:border-[#5B4DFF]/30 hover:text-[#374151]"}`}>
                                                    <input type="radio" name="role" value={opt.value} checked={role === opt.value} onChange={() => setRole(opt.value as any)} className="hidden" />
                                                    <span className="text-xl">{opt.icon}</span>
                                                    {opt.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 2: SERVICE PROFILE */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Service Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)}
                                        className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:border-[#5B4DFF] transition-all">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Skills</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                        <input type="text" value={skills} onChange={e => setSkills(e.target.value)}
                                            className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B4DFF] transition-all"
                                            placeholder="e.g. Pipe fitting, Drainage, Wiring" />
                                    </div>
                                    <p className="text-[10px] text-[#9CA3AF] mt-1">Separate with commas</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Experience (Years)</label>
                                    <input type="number" value={experience} onChange={e => setExperience(e.target.value)}
                                        className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B4DFF] transition-all"
                                        placeholder="5" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Certifications (Optional)</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                        <input type="text" value={certifications} onChange={e => setCertifications(e.target.value)}
                                            className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B4DFF] transition-all"
                                            placeholder="e.g. Govt Technical Diploma" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: AVAILABILITY */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-1.5">City</label>
                                        <input type="text" value={city} onChange={e => setCity(e.target.value)}
                                            className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:border-[#5B4DFF] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-1.5">Area</label>
                                        <input type="text" value={area} onChange={e => setArea(e.target.value)}
                                            className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:border-[#5B4DFF] transition-all"
                                            placeholder="e.g. F-10" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">Available Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {weekdays.map(d => (
                                            <button key={d} type="button" onClick={() => toggleDay(d)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${days.includes(d) ? "bg-[#5B4DFF] border-[#5B4DFF] text-white shadow-sm" : "bg-[#F8F9FC] border-[#E5E7EB] text-[#6B7280] hover:border-[#5B4DFF]/30"}`}>
                                                {d.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Working Hours</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                        <input type="text" value={hours} onChange={e => setHours(e.target.value)}
                                            className="w-full bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] focus:outline-none focus:border-[#5B4DFF] transition-all"
                                            placeholder="e.g. 9am - 6pm" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-3 pt-2">
                        {step > 1 && (
                            <button type="button" onClick={handleBack} disabled={loading}
                                className="px-5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] transition-all flex items-center justify-center">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <button type="button" onClick={(!isLogin && role === "worker" && step < 3) ? handleNext : handleSubmit} disabled={loading}
                            className="flex-1 py-3.5 rounded-xl bg-[#111827] text-white font-bold text-sm hover:bg-black disabled:opacity-60 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-[0.98]">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</> : (
                                isLogin ? "Sign In" : (
                                    (role === "worker" && step < 3) ? <>Next <ChevronRight className="w-4 h-4" /></> : "Complete Signup"
                                )
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-[#9CA3AF] mt-6">
                    {isLogin ? "Don&apos;t have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); setStep(1); setError(""); }} className="text-[#5B4DFF] font-semibold hover:underline">
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </p>

                {/* Trust footer */}
                <div className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-[#F3F4F6]">
                    {["Verified Profiles", "Secure Platform"].map(item => (
                        <div key={item} className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-medium">
                            <BadgeCheck className="w-3 h-3 text-[#5B4DFF]" /> {item}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

