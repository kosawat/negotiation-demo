"use client";

import { useState } from "react";

const ivyApiUrl = process.env.NEXT_PUBLIC_IVY_API_URL;
const ivyApiKey = process.env.NEXT_PUBLIC_IVY_API_KEY || "my-api-key";

export default function NegotiationForm({
  product,
}: {
  product: {
    id: string;
    price: number;
    minPrice: number;
    maxOffersCount: number;
  };
}) {
  const [offer, setOffer] = useState("");
  const [message, setMessage] = useState("");
  const [specialOffer, setSpecialOffer] = useState<number | null>(null);
  const [resetAvailable, setResetAvailable] = useState(false);
  const [acceptedPrice, setAcceptedPrice] = useState<number | null>(null); // Track final price
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const offerKey = `offers_${product.id}`; // Simplified for demo; in production, include user ID/IP

  console.log("IVY API", ivyApiUrl, ivyApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const offerNum = parseFloat(offer);

    // Validate offer
    if (isNaN(offerNum)) {
      setMessage("Offer must be valid number");
      return;
    }

    if (offerNum > product.price) {
      setMessage("Offer must lesss than or equal to product's price");
      return;
    }

    const storedOffers = JSON.parse(
      localStorage.getItem(offerKey) || "[]"
    ) as number[];

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          price: product.price,
          minPrice: product.minPrice,
          offer: offerNum,
          storedOffers, // Send current offers to API
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || "Something went wrong");
        return;
      }

      const data = await response.json();
      setMessage(data.message);
      setSpecialOffer(data.specialOffer || null);
      setResetAvailable(data.resetAvailable || false);

      // Update localStorage if a new offer was processed
      if (data.newOffer) {
        const updatedOffers = [...storedOffers, data.newOffer];
        if (isFinite(data?.specialOffer)) {
          updatedOffers.push(data.specialOffer);
        }
        localStorage.setItem(offerKey, JSON.stringify(updatedOffers));
      }

      if (data.acceptedOffer || data.specialOffer) {
        setAcceptedPrice(data.acceptedOffer || data.specialOffer);
      }

      setOffer(""); // Clear input
    } catch (error) {
      console.error("Error submitting offer:", error);
      setMessage("Failed to submit offer. Please try again.");
    }
  };

  const handleReset = () => {
    localStorage.removeItem(offerKey);
    setMessage("Offer history reset. You can start bidding again.");
    setSpecialOffer(null);
    setResetAvailable(false);
    setAcceptedPrice(null);
  };

  const handleBuyNow = async () => {
    if (!acceptedPrice) return;

    setIsProcessingPayment(true);
    try {
      const response = await fetch(`/api/ivy-checkout`, {
        method: "POST",
        body: JSON.stringify({
          price: {
            total: acceptedPrice, // Convert to cents
            currency: "EUR", // Adjust as needed
            subTotal: acceptedPrice, // Simplified for demo
            shipping: 0, // No shipping in this case
            totalNet: acceptedPrice, // No VAT for simplicity
            vat: 0,
          },
          referenceId: `order_${product.id}_${Date.now()}`, // Unique order ID
          displayId: `ORD-${product.id}`, // Human-readable ID
          paymentMode: "settlement", // Default mode
          successCallbackUrl: "http://localhost:3000/thank-you",
          errorCallbackUrl: "http://localhost:3000/error",
          paymentSchemeSelection: "instant_preferred", // Ivy’s focus on instant payments
          customer: {
            email: "test@example.com", // Replace with real user data in production
          },
          market: "DE", // Germany, adjust as needed
          locale: "en", // English, adjust as needed
          lineItems: [
            {
              name: product.id, // Use product name if available
              referenceId: product.id,
              singleNet: Math.round(acceptedPrice * 100),
              singleVat: 0,
              amount: Math.round(acceptedPrice * 100),
              quantity: 1,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Payment failed: ${errorData.message || "Unknown error"}`);
        setIsProcessingPayment(false);
        return;
      }

      const data = await response.json();
      // Redirect to Ivy’s payment page
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error("Error initiating payment:", error);
      setMessage("Failed to initiate payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const hasAcceptedOffer = acceptedPrice !== null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Make an Offer</h3>
      {!hasAcceptedOffer ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="offer"
              className="block text-sm font-medium text-gray-700"
            >
              Your Offer ($)
            </label>
            <input
              type="number"
              id="offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              step="0.01"
              min="0"
              className="mt-1 px-2 py-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Submit Offer
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleBuyNow}
            disabled={isProcessingPayment}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-300 disabled:bg-green-400"
          >
            {isProcessingPayment
              ? "Processing..."
              : `Buy Now for $${acceptedPrice.toFixed(2)}`}
          </button>
        </div>
      )}
      {message && (
        <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
      )}
      {specialOffer && (
        <p className="mt-2 text-center text-sm text-green-600">
          Special Offer: ${specialOffer.toFixed(2)}
        </p>
      )}
      {resetAvailable && (
        <button
          onClick={handleReset}
          className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-300"
        >
          Reset Offer History
        </button>
      )}
    </div>
  );
}
