
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Box, CheckCircle2, XCircle, Loader2, Link as LinkIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TransactionDetails {
    hash: string;
    blockNumber: number;
    from: string;
    to: string;
    status: string;
    timestamp: string | null;
}

const BlockchainVerification = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialHash = searchParams.get("hash") || "";

    const [query, setQuery] = useState(initialHash);
    const [result, setResult] = useState<TransactionDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const verifyTransaction = async (hash: string) => {
        if (!hash) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const { data } = await api.get(`/vote/verify/${hash}`);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to verify transaction. It may be invalid or not found.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialHash) {
            verifyTransaction(initialHash);
        }
    }, [initialHash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query) {
            // Update URL
            setSearchParams({ hash: query });
            verifyTransaction(query);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                    Blockchain Verification Board
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Verify the integrity of the election by checking individual vote transactions on the blockchain.
                    Enter a transaction hash below to see its status and proof-of-work.
                </p>
            </div>

            {/* Search Bar */}
            <Card className="mb-10 shadow-lg border-primary/20">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4 flex-col md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Paste Transaction Hash (0x...)"
                                className="pl-10 font-mono"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="hero" disabled={loading} className="md:w-32">
                            {loading ? <Loader2 className="animate-spin" /> : "Verify"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Results */}
            {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6 text-center text-destructive flex flex-col items-center">
                        <XCircle className="h-10 w-10 mb-2" />
                        <p className="font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card className="overflow-hidden border-accent-teal/30 shadow-xl">
                    <div className="bg-muted/30 p-4 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">Transaction Details</span>
                            <Badge variant={result.status === 'Confirmed' ? 'default' : 'destructive'}
                                className={result.status === 'Confirmed' ? 'bg-success hover:bg-success/80' : ''}>
                                {result.status}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Pending...'}
                        </div>
                    </div>

                    <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-1">
                            <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                            <div className="font-mono text-sm break-all bg-secondary p-3 rounded-md flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 shrink-0 opacity-50" />
                                {result.hash}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Block Number</label>
                                <div className="text-xl font-bold font-mono text-primary">#{result.blockNumber}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">From (Voter Wallet / Relay)</label>
                                <div className="text-sm font-mono break-all">{result.from}</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">To (Election Contract)</label>
                            <div className="text-sm font-mono break-all text-accent-teal">{result.to}</div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground text-center">
                                This transaction is immutable and permanently recorded on the blockchain ledger.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BlockchainVerification;
