export interface Product {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxOffersCount: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Vintage Leather Jacket",
    price: 199.99,
    minPrice: 149.99,
    maxOffersCount: 3,
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
    description: "Premium quality leather jacket with classic design",
  },
  {
    id: "2",
    name: "Wireless Headphones",
    price: 89.99,
    minPrice: 69.99,
    maxOffersCount: 3,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    description: "High-quality sound with noise cancellation",
  },
  {
    id: "3",
    name: "Smart Watch",
    price: 149.99,
    minPrice: 109.99,
    maxOffersCount: 3,
    image: "https://images.unsplash.com/photo-1632794716789-42d9995fb5b6",
    description: "Fitness tracking with sleek modern design",
  },
];
