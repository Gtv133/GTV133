import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './productStore';

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  items: PurchaseItem[];
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseState {
  purchases: Purchase[];
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  getPurchase: (id: string) => Purchase | undefined;
}

export const usePurchaseStore = create(
  persist<PurchaseState>(
    (set, get) => ({
      purchases: [],
      
      addPurchase: async (purchase) => {
        const now = new Date().toISOString();
        const newPurchase = {
          ...purchase,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: now,
          updatedAt: now,
          total: purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        };

        set((state) => ({
          purchases: [...state.purchases, newPurchase],
        }));
      },

      updatePurchase: async (id, updatedPurchase) => {
        set((state) => ({
          purchases: state.purchases.map((purchase) =>
            purchase.id === id
              ? { 
                  ...purchase, 
                  ...updatedPurchase,
                  total: updatedPurchase.items 
                    ? updatedPurchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
                    : purchase.total,
                  updatedAt: new Date().toISOString() 
                }
              : purchase
          ),
        }));
      },

      deletePurchase: async (id) => {
        set((state) => ({
          purchases: state.purchases.filter((purchase) => purchase.id !== id),
        }));
      },

      getPurchase: (id) => {
        return get().purchases.find((purchase) => purchase.id === id);
      },
    }),
    {
      name: 'pos-purchase-storage',
      version: 1,
    }
  )
);