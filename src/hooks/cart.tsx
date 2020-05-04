import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productList = await AsyncStorage.getItem('products');

      if (productList) setProducts(JSON.parse(productList));
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productList = [...products];

      const cartProduct = productList.find(item => item.id === product.id);

      if (cartProduct) {
        cartProduct.quantity += 1;
      } else {
        productList.push({ ...product, quantity: 1 });
      }

      setProducts(productList);
      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productList = [...products];

      const cartProduct = productList.find(item => item.id === id);

      if (cartProduct) {
        cartProduct.quantity += 1;
      }

      setProducts(productList);
      await AsyncStorage.setItem('products', JSON.stringify(products));
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productList = [...products];

      const cartProduct = productList.find(item => item.id === id);

      if (cartProduct) {
        cartProduct.quantity -= 1;
      }

      setProducts(productList.filter(item => item.quantity > 0));

      await AsyncStorage.setItem('products', JSON.stringify(products));
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
