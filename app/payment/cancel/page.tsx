import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-elevated rounded-2xl shadow-xl border border-border p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-destructive dark:text-red-400">
                    <XCircle className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Payment Cancelled
                </h1>
                <p className="text-muted-foreground mb-8">
                    Your payment was cancelled and no charges were made.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-accent px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Studio
                </Link>
            </div>
        </div>
    );
}
