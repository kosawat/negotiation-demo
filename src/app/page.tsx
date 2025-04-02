import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome to Negotiation Shop
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
