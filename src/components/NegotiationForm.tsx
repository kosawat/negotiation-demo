"use client";

import { useState } from "react";

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

  const offerKey = `offers_${product.id}`; // Simplified for demo; in production, include user ID/IP

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
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Make an Offer</h3>
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
