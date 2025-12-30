import { useState } from "react";
import { CreditCard, Smartphone, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentFormProps {
  totalAmount: number;
  onPaymentComplete: () => void;
  onBack: () => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

type PaymentMethod = "debit" | "credit" | "upi";

const PaymentForm = ({
  totalAmount,
  onPaymentComplete,
  onBack,
  isProcessing,
  setIsProcessing,
}: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("debit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const validateCardForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Invalid expiry date (MM/YY)";
    }
    if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = "CVV must be 3-4 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpiForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!upiId.includes("@")) {
      newErrors.upiId = "Invalid UPI ID (e.g., name@upi)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    let isValid = false;
    
    if (paymentMethod === "upi") {
      isValid = validateUpiForm();
    } else {
      isValid = validateCardForm();
    }
    
    if (!isValid) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    onPaymentComplete();
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <Label className="mb-3 block text-sm font-medium text-card-foreground">
          Select Payment Method
        </Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => {
            setPaymentMethod(value as PaymentMethod);
            setErrors({});
          }}
          className="grid grid-cols-3 gap-3"
        >
          <div>
            <RadioGroupItem
              value="debit"
              id="debit"
              className="peer sr-only"
            />
            <Label
              htmlFor="debit"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-border bg-background p-4 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
            >
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Debit Card</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="credit"
              id="credit"
              className="peer sr-only"
            />
            <Label
              htmlFor="credit"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-border bg-background p-4 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
            >
              <CreditCard className="h-6 w-6 text-blue-500" />
              <span className="text-xs font-medium">Credit Card</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="upi"
              id="upi"
              className="peer sr-only"
            />
            <Label
              htmlFor="upi"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-border bg-background p-4 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
            >
              <Smartphone className="h-6 w-6 text-green-500" />
              <span className="text-xs font-medium">UPI</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Card Form */}
      {(paymentMethod === "debit" || paymentMethod === "credit") && (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-sm text-card-foreground">
              Card Number
            </Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className={errors.cardNumber ? "border-destructive" : ""}
            />
            {errors.cardNumber && (
              <p className="text-xs text-destructive">{errors.cardNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-sm text-card-foreground">
              Cardholder Name
            </Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className={errors.cardName ? "border-destructive" : ""}
            />
            {errors.cardName && (
              <p className="text-xs text-destructive">{errors.cardName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-sm text-card-foreground">
                Expiry Date
              </Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                maxLength={5}
                className={errors.expiryDate ? "border-destructive" : ""}
              />
              {errors.expiryDate && (
                <p className="text-xs text-destructive">{errors.expiryDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-sm text-card-foreground">
                CVV
              </Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                maxLength={4}
                className={errors.cvv ? "border-destructive" : ""}
              />
              {errors.cvv && (
                <p className="text-xs text-destructive">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>Your payment info is secure and encrypted</span>
          </div>
        </div>
      )}

      {/* UPI Form */}
      {paymentMethod === "upi" && (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="space-y-2">
            <Label htmlFor="upiId" className="text-sm text-card-foreground">
              UPI ID
            </Label>
            <Input
              id="upiId"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className={errors.upiId ? "border-destructive" : ""}
            />
            {errors.upiId && (
              <p className="text-xs text-destructive">{errors.upiId}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {["@paytm", "@phonepe", "@ybl", "@oksbi", "@okaxis"].map((suffix) => (
              <button
                key={suffix}
                type="button"
                onClick={() => {
                  const name = upiId.split("@")[0] || "name";
                  setUpiId(name + suffix);
                }}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {suffix}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>You'll receive a payment request on your UPI app</span>
          </div>
        </div>
      )}

      {/* Amount */}
      <div className="rounded-lg bg-primary/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          onClick={handlePayment}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay ₹{totalAmount}</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
