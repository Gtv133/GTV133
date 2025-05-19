import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  taxRegime: string;
  invoiceUsage: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomer: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
}

const demoCustomers: Customer[] = [
  {
    id: '1',
    name: 'Cliente General',
    taxId: 'XAXX010101000',
    email: 'general@example.com',
    phone: '555-0000',
    postalCode: '00000',
    address: 'Conocido',
    taxRegime: 'Régimen Simplificado de Confianza',
    invoiceUsage: 'G03 - Gastos en general',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const useCustomerStore = create(
  persist<CustomerState>(
    (set, get) => ({
      customers: demoCustomers,
      
      addCustomer: async (customer) => {
        const now = new Date().toISOString();
        const newCustomer = {
          ...customer,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          customers: [...state.customers, newCustomer],
        }));
      },

      updateCustomer: async (id, updatedCustomer) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id
              ? { 
                  ...customer, 
                  ...updatedCustomer, 
                  updatedAt: new Date().toISOString() 
                }
              : customer
          ),
        }));
      },

      deleteCustomer: async (id) => {
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
        }));
      },

      getCustomer: (id) => {
        return get().customers.find((customer) => customer.id === id);
      },

      searchCustomers: (query) => {
        const searchTerm = query.toLowerCase();
        return get().customers.filter((customer) =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.taxId.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm)
        );
      },
    }),
    {
      name: 'pos-customer-storage',
      version: 1,
    }
  )
);