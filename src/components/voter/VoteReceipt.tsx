import React from "react";
import { CheckCircle, ExternalLink, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/site-config";

interface VoteReceiptProps {
    voterName: string;
    timestamp: string | Date | undefined | null;
    transactionHash?: string;
    voterImage?: string;
    electionName?: string;
}

const VoteReceipt: React.FC<VoteReceiptProps> = ({
    voterName,
    timestamp,
    transactionHash,
    voterImage,
    electionName
}) => {
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Vote Receipt - ${voterName}`;
        window.print();
        document.title = originalTitle;
    };

    // Safe date formatting to prevent "Invalid Date"
    const formatDate = (dateValue: any) => {
        if (!dateValue) return "Official Record Pending";
        try {
            const d = new Date(dateValue);
            if (isNaN(d.getTime())) return "Processing...";
            return d.toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'medium'
            });
        } catch (e) {
            return "Processing...";
        }
    };

    return (
        <>
            <style>
                {`
                @media print {
                    /* Hide everything by default using visibility */
                    html, body, #root, .app-container {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                    }
                    
                    /* Show only the receipt and its ancestors */
                    #printable-receipt-card-wrapper, 
                    #printable-receipt-card-wrapper *,
                    #printable-receipt-card, 
                    #printable-receipt-card * {
                        visibility: visible !important;
                    }

                    /* Position the wrapper to take over the whole printed page */
                    #printable-receipt-card-wrapper {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        display: flex !important;
                        justify-content: center !important;
                        height: auto !important;
                    }

                    /* Center and style the card for the PDF */
                    #printable-receipt-card {
                        position: relative !important;
                        margin: 20px auto !important;
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                        break-inside: avoid !important;
                        max-width: 500px !important;
                        display: block !important;
                        float: none !important;
                    }

                    /* Hide any browser headers/footers if possible (modern browsers) */
                    @page {
                        margin: 0.5cm;
                        size: auto;
                    }

                    /* Extra insurance against UI elements */
                    nav, aside, footer, header, .print-hidden, [role="navigation"], button:not(.print-only) {
                        display: none !important;
                    }
                }
                `}
            </style>
            <div id="printable-receipt-card-wrapper" className="w-full">
                <Card id="printable-receipt-card" className="w-full max-w-md mx-auto overflow-hidden border-2 border-primary/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 py-6 text-center">
                        {voterImage ? (
                            <div className="w-20 h-20 rounded-full border-4 border-background shadow-lg mx-auto mb-4 overflow-hidden bg-muted">
                                <img src={voterImage} alt={voterName} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border border-success/20">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                        )}
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground uppercase">Official Vote Receipt</CardTitle>
                        <p className="text-sm text-primary uppercase tracking-widest font-extrabold mt-2 px-6 leading-tight">
                            {electionName || `${SITE_NAME} Election`}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold mt-2">Authenticated Platform Record</p>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-6 text-center">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Voter Name</span>
                                <p className="text-xl font-black text-foreground break-words">{voterName}</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Voting Timestamp</span>
                                <p className="text-sm font-semibold text-foreground">{formatDate(timestamp)}</p>
                            </div>

                            <div className="flex flex-col gap-1 p-6 bg-muted/30 rounded-2xl border border-border mt-6">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Blockchain Verification</span>
                                </div>
                                {transactionHash ? (
                                    <div className="space-y-4">
                                        <div className="bg-background p-3.5 rounded-xl border border-border/50 shadow-inner">
                                            <code className="block text-[10px] font-mono break-all text-muted-foreground select-all leading-relaxed tracking-wider">
                                                {transactionHash}
                                            </code>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Button
                                                variant="link"
                                                className="h-auto p-0 text-xs text-primary font-bold hover:underline print-hidden uppercase tracking-tighter"
                                                onClick={() => window.open(`/verify-vote?hash=${transactionHash}`, '_blank')}
                                            >
                                                Verify on Explorer <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic font-medium">Secured via Platform Ledger</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-dashed border-border flex flex-col items-center gap-5 print-hidden text-center">
                            <Button
                                onClick={handlePrint}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 font-black shadow-xl h-14 text-sm uppercase tracking-widest"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download Receipt
                            </Button>
                            <p className="text-[9px] text-muted-foreground leading-relaxed max-w-[300px] font-medium italic">
                                This document serves as permanent cryptographic proof of your participation. Candidate choices are never recorded on receipts for ballot privacy.
                            </p>
                        </div>

                        {/* Footer for printed version */}
                        <div className="hidden print:block pt-8 text-center border-t border-border mt-6">
                            <p className="text-xs font-black text-foreground uppercase tracking-wider">{SITE_NAME} Voting Framework</p>
                            <p className="text-[8px] text-muted-foreground mt-1.5 font-mono uppercase tracking-[0.3em]">Immutable Blockchain Security Layer</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default VoteReceipt;
