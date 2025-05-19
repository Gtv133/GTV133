import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logoUrl: string;
}

export interface ReceiptSettings {
  showLogo: boolean;
  showQr: boolean;
  footerMessage: string;
  printCopy: boolean;
  extraImageUrl?: string;
  printerName: string;
  paperWidth: number;
  fontSize: number;
  printHeader: boolean;
  printFooter: boolean;
  printQr: boolean;
  copies: number;
  enableTax: boolean;
}

export interface TaxSettings {
  defaultRate: number;
  includedInPrice: boolean;
  enabled: boolean;
}

export interface WholesaleSettings {
  enabled: boolean;
  minQuantityType: 'perItem' | 'total';
  minQuantity: number;
  discountPercentage: number;
}

export interface NotificationSettings {
  lowStockThreshold: number;
  enableEmail: boolean;
  enablePush: boolean;
}

interface SettingState {
  businessInfo: BusinessInfo;
  receiptSettings: ReceiptSettings;
  taxSettings: TaxSettings;
  wholesaleSettings: WholesaleSettings;
  notificationSettings: NotificationSettings;
  availablePrinters: string[];
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void;
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;
  updateTaxSettings: (settings: Partial<TaxSettings>) => void;
  updateWholesaleSettings: (settings: Partial<WholesaleSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  refreshPrinters: () => Promise<void>;
}

const initialState: Partial<SettingState> = {
  businessInfo: {
    name: 'Mi Tienda',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    logoUrl: '',
  },
  receiptSettings: {
    showLogo: true,
    showQr: true,
    footerMessage: '¡Gracias por su compra!',
    printCopy: true,
    extraImageUrl: '',
    printerName: '',
    paperWidth: 80,
    fontSize: 10,
    printHeader: true,
    printFooter: true,
    printQr: true,
    copies: 1,
    enableTax: false,
  },
  taxSettings: {
    defaultRate: 16,
    includedInPrice: false,
    enabled: false,
  },
  wholesaleSettings: {
    enabled: false,
    minQuantityType: 'perItem',
    minQuantity: 10,
    discountPercentage: 10,
  },
  notificationSettings: {
    lowStockThreshold: 5,
    enableEmail: false,
    enablePush: true,
  },
  availablePrinters: []
};

export const useSettingStore = create(
  persist<SettingState>(
    (set) => ({
      ...initialState as SettingState,
      
      updateBusinessInfo: (info) => {
        set((state) => ({
          businessInfo: { ...state.businessInfo, ...info },
        }));
      },

      updateReceiptSettings: (settings) => {
        set((state) => ({
          receiptSettings: { ...state.receiptSettings, ...settings },
        }));
      },

      updateTaxSettings: (settings) => {
        set((state) => ({
          taxSettings: { ...state.taxSettings, ...settings },
        }));
      },

      updateWholesaleSettings: (settings) => {
        set((state) => ({
          wholesaleSettings: { ...state.wholesaleSettings, ...settings },
        }));
      },

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        }));
      },

      refreshPrinters: async () => {
        try {
          if ('printer' in navigator && 'query' in (navigator as any).printer) {
            const printers = await (navigator as any).printer.query();
            set({ availablePrinters: printers.map((p: any) => p.name) });
          } else {
            console.warn('Printer API not supported');
            set({ availablePrinters: [] });
          }
        } catch (error) {
          console.error('Error accessing printers:', error);
          set({ availablePrinters: [] });
        }
      },
    }),
    {
      name: 'pos-settings-storage',
      version: 1,
      migrate: (persistedState: any) => ({
        ...initialState,
        ...persistedState,
      })
    }
  )
);