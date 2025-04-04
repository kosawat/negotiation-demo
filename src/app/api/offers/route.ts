import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const { productId, price, minPrice, offer, storedOffers } =
      await req.json();

    // Validate request body
    if (
      !productId ||
      typeof price !== "number" ||
      typeof minPrice !== "number" ||
      typeof offer !== "number" ||
      !Array.isArray(storedOffers)
    ) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const maxOffersCount = product.maxOffersCount || 3;
    const currentOfferCount = storedOffers.length + 1; // +1 for the current offer

    // Check previous accepted offer / special offer
    const acceptedOffer = storedOffers.find((o: number) => o >= minPrice);
    if (acceptedOffer) {
      return NextResponse.json({
        message: `Your offer of $${acceptedOffer.toFixed(
          2
        )} was already accepted!`,
        resetAvailable: true,
        acceptedOffer: Number(acceptedOffer.toFixed(2)),
      });
    }

    // Case 3: Current offer count > maxOffersCount
    if (currentOfferCount > maxOffersCount) {
      // Assume the last offer was a special offer if no accepted offer exists
      const lastOffer = acceptedOffer || storedOffers[storedOffers.length - 1];
      return NextResponse.json({
        message: `You've used all ${maxOffersCount} chances. Special offer available: $${lastOffer.toFixed(
          2
        )}`,
        specialOffer: Number(lastOffer.toFixed(2)),
        resetAvailable: true,
      });
    }

    // Case 1: Current offer count < maxOffersCount
    if (currentOfferCount < maxOffersCount) {
      if (offer >= minPrice) {
        return NextResponse.json({
          message: `Offer accepted! You got it for $${offer.toFixed(2)}`,
          newOffer: offer,
          acceptedOffer: Number(offer.toFixed(2)),
          resetAvailable: true,
        });
      } else {
        const remaining = maxOffersCount - currentOfferCount;
        return NextResponse.json({
          message: `Offer rejected. Too low. You have ${remaining} chance${
            remaining === 1 ? "" : "s"
          } left.`,
          newOffer: offer,
        });
      }
    }

    // Case 2: Current offer count = maxOffersCount
    if (currentOfferCount === maxOffersCount) {
      if (offer >= minPrice) {
        return NextResponse.json({
          message: `Offer accepted! You got it for $${offer.toFixed(2)}`,
          newOffer: offer,
          acceptedOffer: Number(offer.toFixed(2)),
          resetAvailable: true,
        });
      } else {
        // Calculate special offer: average of previous offers + current, adjusted between minPrice and price
        const allOffers = [...storedOffers, offer];
        const avgOffer =
          allOffers.reduce((sum: number, o: number) => sum + o, 0) /
          allOffers.length;

        const priceRange = price - minPrice;
        // Generate random step from 0.1 to priceRange / 2, step 0.1
        const maxStep = priceRange / 2; // e.g., 5 / 2 = 2.5
        const stepCount = Math.floor(maxStep / 0.1); // Number of 0.1 steps up to maxStep, e.g., 2.5 / 0.1 = 25
        const randomSteps = Math.floor(Math.random() * stepCount) + 1; // Random steps from 1 to stepCount
        const randomIncrement = randomSteps * 0.1; // Convert to increment, e.g., 0.1 to 2.5
        const minSpecialOffer = minPrice + randomIncrement;

        const specialOffer = Math.max(
          minSpecialOffer,
          Math.min(price - 1, avgOffer + priceRange * 0.2)
        );
        return NextResponse.json({
          message: `Offer rejected. You've used all ${maxOffersCount} chances. Special offer generated: $${specialOffer.toFixed(
            2
          )}`,
          specialOffer: Number(specialOffer.toFixed(2)),
          newOffer: offer, // Still store the rejected offer
          resetAvailable: true,
        });
      }
    }

    // Fallback (shouldn't reach here with proper logic)
    return NextResponse.json(
      { message: "Unexpected error in offer processing" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error processing offer:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
