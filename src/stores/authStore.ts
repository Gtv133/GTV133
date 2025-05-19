import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const initialState: Partial<AuthState> = {
  user: null,
  loading: false,
  initialized: true
};

// Simulated user database - in a real app, you'd want to store this securely
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@pos.com',
    password: 'admin123',
    fullName: 'Administrador',
    role: 'admin'
  },
  {
    id: '2',
    email: 'cajero@pos.com',
    password: 'cajero123',
    fullName: 'Cajero Demo',
    role: 'cashier'
  }
];

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      loading: false,
      initialized: true,

      signIn: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = DEMO_USERS.find(u => 
            u.email === email && u.password === password
          );
          
          if (!user) {
            throw new Error('Credenciales inválidas');
          }
          
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signOut: () => {
        set({ user: null });
      },
    }),
    {
      name: 'pos-auth-storage',
      version: 1,
      migrate: (persistedState: any) => ({
        ...initialState,
        ...persistedState,
      })
    }
  )
);