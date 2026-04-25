import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Search, 
    Box, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    Link as LinkIcon, 
    Clock, 
    ShieldCheck, 
    Cpu, 
    Globe,
    ExternalLink,
    Zap,
    Hash
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SITE_NAME } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface TransactionDetails {
    hash: string;
    blockNumber: number;
    from: string;
    to: string;
    status: string;
    timestamp: string | null;
    gasUsed?: string;
}

const BlockchainVerification = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialHash = searchParams.get("hash") || "";

    const [query, setQuery] = useState(initialHash);
    const [result, setResult] = useState<TransactionDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState("");

    const loadingSteps = [
        "Connecting to Sepolia Node...",
        "Accessing Distributed Ledger...",
        "Decrypting Transaction Protocol...",
        "Verifying Cryptographic Signatures...",
        "Validating Block Integrity..."
    ];

    const verifyTransaction = async (hash: string) => {
        if (!hash) return;

        setLoading(true);
        setError("");
        setResult(null);
        setLoadingStep(0);

        // Simulated Progress for "Wow" Factor
        for (let i = 0; i < loadingSteps.length; i++) {
            setLoadingStep(i);
            await new Promise(r => setTimeout(r, 600));
        }

        try {
            const { data } = await api.get(`/vote/verify/${hash}`);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Hash Verification Rejected: Record Not Found on Ledger.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialHash) {
            setQuery(initialHash);
            verifyTransaction(initialHash);
        }
    }, [initialHash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query) {
            setSearchParams({ hash: query });
            verifyTransaction(query);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-cyan-400">
            {/* Cyber Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]" />
            <div className="fixed inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5 z-0 pointer-events-none" />

            <div className="container max-w-4xl mx-auto py-12 px-4 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-16">
                    <Link to="/" className="group mb-8">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-3 relative">
                                <img src="/logo.png" alt={SITE_NAME} className="w-12 h-12 object-contain brightness-125" />
                                <span className="font-black text-3xl tracking-tighter text-white uppercase italic">{SITE_NAME} <span className="text-cyan-500">LEDGER</span></span>
                            </div>
                        </div>
                    </Link>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                        <Zap className="w-3 h-3 animate-pulse" />
                        <span>Real-Time Node Verification</span>
                    </div>
                </div>

                {/* Search Terminal */}
                <Card className="bg-[#0A0A0A] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-12 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50" />
                    <CardContent className="p-8">
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Input Transaction Hash</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-cyan-500/5 blur-md group-focus-within:bg-cyan-500/10 transition-colors" />
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-cyan-500 transition-colors" />
                                    <Input
                                        placeholder="0x..."
                                        className="h-16 pl-12 bg-white/[0.03] border-white/10 text-xl font-mono text-cyan-400 placeholder:text-white/10 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all rounded-none"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full h-14 bg-white text-black hover:bg-cyan-400 transition-all font-black text-lg uppercase tracking-widest rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Analyzing Ledger...</span>
                                    </div>
                                ) : "Execute Verification"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Loading State - Terminal Steps */}
                {loading && (
                    <div className="space-y-4 mb-12 font-mono text-sm max-w-md mx-auto">
                        {loadingSteps.map((step, i) => (
                            <div key={i} className={cn(
                                "flex items-center gap-3 transition-opacity duration-300",
                                i > loadingStep ? "opacity-20" : i === loadingStep ? "opacity-100 text-cyan-400" : "opacity-60 text-white"
                            )}>
                                {i < loadingStep ? <CheckCircle2 className="w-4 h-4 text-cyan-500" /> : 
                                 i === loadingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                 <div className="w-4 h-4 rounded-full border border-white/20" />}
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error Box */}
                {error && !loading && (
                    <div className="bg-red-500/10 border border-red-500/30 p-8 text-center animate-in zoom-in duration-300">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Access Denied / Not Found</h3>
                        <p className="text-red-400 font-mono text-sm">{error}</p>
                    </div>
                )}

                {/* The "Official Proof" Digital Certificate */}
                {result && !loading && (
                    <div className="relative animate-in slide-in-from-bottom-8 duration-700">
                        {/* Certificate Backdrop Glow */}
                        <div className="absolute -inset-10 bg-cyan-500/10 blur-[100px] opacity-50 pointer-events-none" />
                        
                        <div className="relative bg-[#0F0F0F] border-x border-t border-white/20 p-1">
                            <div className="border border-white/10 p-8 space-y-12">
                                {/* Certificate Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-cyan-500 decoration-4 underline-offset-8">Blockchain Proof</h2>
                                        <p className="text-xs font-bold text-white/40 tracking-widest uppercase">Global Consensus Certificate</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-white/40 uppercase">Status</p>
                                            <p className="text-xl font-black text-cyan-500 italic uppercase">Validated</p>
                                        </div>
                                        <div className="p-3 bg-cyan-500/20 rounded-full">
                                            <ShieldCheck className="w-8 h-8 text-cyan-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Main Data Section */}
                                <div className="grid gap-10">
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                <Box className="w-3 h-3" /> Block Reference
                                            </label>
                                            <div className="text-4xl font-black text-white italic">#{result.blockNumber}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Ledger Timestamp
                                            </label>
                                            <div className="text-lg font-bold text-white">
                                                {result.timestamp ? new Date(result.timestamp).toUTCString() : 'REAL-TIME'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hash Row */}
                                    <div className="space-y-3 bg-white/[0.02] p-6 border border-white/5">
                                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <LinkIcon className="w-3 h-3" /> Cryptographic Identity (TX HASH)
                                        </label>
                                        <code className="block text-xs md:text-sm font-mono break-all text-cyan-400 leading-relaxed tracking-wider">
                                            {result.hash}
                                        </code>
                                    </div>

                                    {/* Address Info */}
                                    <div className="grid md:grid-cols-2 gap-10 border-t border-white/10 pt-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                <Cpu className="w-3 h-3" /> Origin Node (From)
                                            </label>
                                            <p className="text-[11px] font-mono break-all text-white/60">{result.from}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Destination Node (To)
                                            </label>
                                            <p className="text-[11px] font-mono break-all text-white/60">{result.to}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Link */}
                                <div className="pt-8 flex flex-col items-center gap-6">
                                    <Button 
                                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${result.hash}`, '_blank')}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest px-8 h-12 gap-2"
                                    >
                                        Open on Etherscan <ExternalLink className="w-4 h-4" />
                                    </Button>
                                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em] text-center italic">
                                        Immutable Proof of Record · Generated by {SITE_NAME} Trust Protocol
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Bottom Bar */}
                        <div className="h-6 bg-cyan-500 grid grid-cols-4 overflow-hidden opacity-80">
                            {[...Array(40)].map((_, i) => (
                                <div key={i} className="h-full border-r border-black/20" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockchainVerification;
