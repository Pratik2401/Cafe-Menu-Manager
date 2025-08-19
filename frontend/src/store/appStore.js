/**
 * @fileoverview Zustand store for lightweight client state management
 * Replaces Context API for frequently changing client-side state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Main application store
export const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      theme: 'light',
      sidebarCollapsed: false,
      loading: false,
      
      // User preferences
      userPreferences: {
        language: 'en',
        currency: 'USD',
        notifications: true
      },
      
      // Cart state (if applicable)
      cart: [],
      cartTotal: 0,
      
      // Search state
      searchQuery: '',
      searchFilters: {},
      
      // Admin state
      selectedItems: [],
      bulkActionMode: false,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setLoading: (loading) => set({ loading }),
      
      updateUserPreferences: (preferences) => 
        set((state) => ({ 
          userPreferences: { ...state.userPreferences, ...preferences } 
        })),
      
      // Cart actions
      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          return {
            cart: state.cart.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),
      
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== itemId)
      })),
      
      clearCart: () => set({ cart: [] }),
      
      // Search actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchFilters: (filters) => set({ searchFilters: filters }),
      
      // Admin actions
      toggleItemSelection: (itemId) => set((state) => {
        const isSelected = state.selectedItems.includes(itemId);
        return {
          selectedItems: isSelected
            ? state.selectedItems.filter(id => id !== itemId)
            : [...state.selectedItems, itemId]
        };
      }),
      
      selectAllItems: (itemIds) => set({ selectedItems: itemIds }),
      clearSelection: () => set({ selectedItems: [] }),
      setBulkActionMode: (mode) => set({ bulkActionMode: mode }),
      
      // Computed values
      getCartItemCount: () => get().cart.reduce((total, item) => total + item.quantity, 0),
      getCartTotal: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        userPreferences: state.userPreferences,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);

// Notification store
export const useNotificationStore = create((set) => ({
  notifications: [],
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] })
}));
