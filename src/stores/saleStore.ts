import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './productStore';
import { useProductStore } from './productStore';
import { useSettingStore } from './settingStore';

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
  product: Product;
  originalPrice?: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  customerId?: string;
  paymentMethod: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface SaleState {
  currentSale: SaleItem[];
  sales: Sale[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearSale: () => void;
  completeSale: (paymentMethod: string, customerId?: string) => Sale;
  getSaleHistory: () => Sale[];
  getDailySales: () => number;
  getWeeklySales: () => number;
  getMonthlySales: () => number;
}

const initialState: Partial<SaleState> = {
  currentSale: [],
  sales: []
};

export const useSaleStore = create(
  persist<SaleState>(
    (set, get) => ({
      currentSale: [],
      sales: [],

      addItem: (product, quantity) => {
        const { wholesaleSettings } = useSettingStore.getState();
        
        set((state) => {
          const existingItem = state.currentSale.find(
            (item) => item.productId === product.id
          );

          let newPrice = product.sellingPrice;
          let originalPrice = product.sellingPrice;

          // Apply wholesale discount if enabled and conditions are met
          if (wholesaleSettings.enabled) {
            const totalQuantity = state.currentSale.reduce((sum, item) => sum + item.quantity, 0) + quantity;
            const itemQuantity = existingItem ? existingItem.quantity + quantity : quantity;

            const shouldApplyDiscount = wholesaleSettings.minQuantityType === 'total' 
              ? totalQuantity >= wholesaleSettings.minQuantity
              : itemQuantity >= wholesaleSettings.minQuantity;

            if (shouldApplyDiscount) {
              newPrice = product.sellingPrice * (1 - wholesaleSettings.discountPercentage / 100);
            }
          }

          if (existingItem) {
            return {
              currentSale: state.currentSale.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      price: newPrice,
                      originalPrice: originalPrice,
                      total: (item.quantity + quantity) * newPrice,
                    }
                  : item
              ),
            };
          }

          return {
            currentSale: [
              ...state.currentSale,
              {
                productId: product.id,
                quantity,
                price: newPrice,
                originalPrice: originalPrice,
                total: quantity * newPrice,
                product,
              },
            ],
          };
        });

        // Update product stock
        const productStore = useProductStore.getState();
        productStore.updateProduct(product.id, {
          currentStock: product.currentStock - quantity,
        });
      },

      removeItem: (productId) => {
        const item = get().currentSale.find((i) => i.productId === productId);
        if (item) {
          // Restore product stock
          const productStore = useProductStore.getState();
          const product = productStore.getProduct(productId);
          if (product) {
            productStore.updateProduct(productId, {
              currentStock: product.currentStock + item.quantity,
            });
          }
        }

        set((state) => ({
          currentSale: state.currentSale.filter(
            (item) => item.productId !== productId
          ),
        }));
      },

      updateItemQuantity: (productId, quantity) => {
        const { wholesaleSettings } = useSettingStore.getState();
        const currentItem = get().currentSale.find(
          (item) => item.productId === productId
        );

        if (currentItem) {
          const quantityDiff = quantity - currentItem.quantity;
          const productStore = useProductStore.getState();
          const product = productStore.getProduct(productId);
          
          if (product) {
            let newPrice = currentItem.originalPrice || product.sellingPrice;

            // Apply wholesale discount if enabled and conditions are met
            if (wholesaleSettings.enabled) {
              const totalQuantity = get().currentSale.reduce(
                (sum, item) => sum + (item.productId === productId ? quantity : item.quantity),
                0
              );

              const shouldApplyDiscount = wholesaleSettings.minQuantityType === 'total'
                ? totalQuantity >= wholesaleSettings.minQuantity
                : quantity >= wholesaleSettings.minQuantity;

              if (shouldApplyDiscount) {
                newPrice = newPrice * (1 - wholesaleSettings.discountPercentage / 100);
              }
            }

            productStore.updateProduct(productId, {
              currentStock: product.currentStock - quantityDiff,
            });

            set((state) => ({
              currentSale: state.currentSale.map((item) =>
                item.productId === productId
                  ? {
                      ...item,
                      quantity,
                      price: newPrice,
                      total: quantity * newPrice,
                    }
                  : item
              ),
            }));
          }
        }
      },

      clearSale: () => {
        // Restore all product stock
        const currentSale = get().currentSale;
        const productStore = useProductStore.getState();
        
        currentSale.forEach((item) => {
          const product = productStore.getProduct(item.productId);
          if (product) {
            productStore.updateProduct(item.productId, {
              currentStock: product.currentStock + item.quantity,
            });
          }
        });

        set({ currentSale: [] });
      },

      completeSale: (paymentMethod, customerId) => {
        const { currentSale } = get();
        const subtotal = currentSale.reduce((sum, item) => sum + item.total, 0);
        
        // Get tax settings and calculate tax only if enabled
        const { receiptSettings } = useSettingStore.getState();
        const tax = receiptSettings.enableTax ? subtotal * 0.16 : 0;
        const total = subtotal + tax;

        // Calculate total discount
        const discount = currentSale.reduce((sum, item) => {
          const originalTotal = item.quantity * (item.originalPrice || item.price);
          return sum + (originalTotal - item.total);
        }, 0);

        const sale: Sale = {
          id: Math.random().toString(36).substr(2, 9),
          items: [...currentSale],
          subtotal,
          tax,
          total,
          discount,
          customerId,
          paymentMethod,
          createdAt: new Date().toISOString(),
          status: 'completed',
        };

        set((state) => ({
          sales: [...state.sales, sale],
          currentSale: [],
        }));

        return sale;
      },

      getSaleHistory: () => {
        return get().sales;
      },

      getDailySales: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return get().sales
          .filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= today && sale.status === 'completed';
          })
          .reduce((sum, sale) => sum + sale.total, 0);
      },

      getWeeklySales: () => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return get().sales
          .filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= weekStart && sale.status === 'completed';
          })
          .reduce((sum, sale) => sum + sale.total, 0);
      },

      getMonthlySales: () => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        return get().sales
          .filter((sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= monthStart && sale.status === 'completed';
          })
          .reduce((sum, sale) => sum + sale.total, 0);
      },
    }),
    {
      name: 'pos-sale-storage',
      version: 1,
      migrate: (persistedState: any) => ({
        ...initialState,
        ...persistedState,
      })
    }
  )
);