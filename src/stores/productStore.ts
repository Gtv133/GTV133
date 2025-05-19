import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  barcode: string;
  internalCode: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  margin: number;
  currentStock: number;
  minStock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  getLowStockProducts: () => Product[];
  updateStock: (id: string, quantity: number) => void;
  importProducts: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'margin'>[]) => void;
}

export const useProductStore = create(
  persist<ProductState>(
    (set, get) => ({
      products: [],
      
      addProduct: (product) => {
        const now = new Date().toISOString();
        const margin = calculateMargin(product.purchasePrice, product.sellingPrice);
        
        const newProduct = {
          ...product,
          id: Math.random().toString(36).substr(2, 9),
          margin,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },

      updateProduct: (id, updatedProduct) => {
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id === id) {
              const margin = calculateMargin(
                updatedProduct.purchasePrice ?? product.purchasePrice,
                updatedProduct.sellingPrice ?? product.sellingPrice
              );
              
              return {
                ...product,
                ...updatedProduct,
                margin,
                updatedAt: new Date().toISOString(),
              };
            }
            return product;
          }),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },

      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },

      searchProducts: (query) => {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return get().products;
        
        return get().products.filter((product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.barcode.toLowerCase().includes(searchTerm) ||
          product.internalCode.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
        );
      },

      getLowStockProducts: () => {
        return get().products.filter(
          (product) => product.currentStock <= product.minStock
        );
      },

      updateStock: (id, quantity) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  currentStock: product.currentStock + quantity,
                  updatedAt: new Date().toISOString(),
                }
              : product
          ),
        }));
      },

      importProducts: (products) => {
        const now = new Date().toISOString();
        const newProducts = products.map(product => ({
          ...product,
          id: Math.random().toString(36).substr(2, 9),
          margin: calculateMargin(product.purchasePrice, product.sellingPrice),
          createdAt: now,
          updatedAt: now,
        }));

        set((state) => ({
          products: [...state.products, ...newProducts],
        }));
      },
    }),
    {
      name: 'pos-product-storage',
      version: 1,
    }
  )
);

function calculateMargin(purchasePrice: number, sellingPrice: number): number {
  if (!purchasePrice || !sellingPrice || purchasePrice <= 0 || sellingPrice <= 0) {
    return 0;
  }
  return Number(((sellingPrice - purchasePrice) / sellingPrice * 100).toFixed(2));
}