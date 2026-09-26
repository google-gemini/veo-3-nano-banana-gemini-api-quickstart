import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-elevated rounded-2xl shadow-xl border border-border p-8 text-center">
                <div className="w-16 h-16 bg-success/12 rounded-full flex items-center justify-center mx-auto mb-6 text-success">
                    <CheckCircle className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-8">
                    Thank you for your purchase. 100 credits have been added to your account.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:brightness-110 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Return to Studio
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
