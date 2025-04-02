"use client";

import { useState } from "react";

export default function NegotiationForm({ price }: { price: number }) {
  const [offer, setOffer] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const offerNum = parseFloat(offer);
    if (offerNum >= price * 0.9) {
      setMessage("Offer accepted! We’ll contact you soon.");
    } else if (offerNum >= price * 0.7) {
      setMessage("Offer under review. We’ll get back to you.");
    } else {
      setMessage("Sorry, your offer is too low.");
    }
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
    </div>
  );
}
