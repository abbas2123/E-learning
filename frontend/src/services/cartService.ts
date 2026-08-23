export interface CartItem {
  id: string;
  courseId: string;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  addedAt: string;
}

const CART_KEY = "totc_cart_items";

export const cartService = {
  getCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  addToCart(item: Omit<CartItem, "addedAt">): CartItem[] {
    const current = this.getCart();
    const exists = current.some((c) => c.courseId === item.courseId);
    if (exists) return current;

    const updated = [
      ...current,
      { ...item, addedAt: new Date().toISOString() },
    ];
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    return updated;
  },

  removeFromCart(courseId: string): CartItem[] {
    const current = this.getCart();
    const updated = current.filter((c) => c.courseId !== courseId);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    return updated;
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  getTotalPrice(): number {
    return this.getCart().reduce((sum, item) => sum + item.price, 0);
  },

  getItemCount(): number {
    return this.getCart().length;
  },
};
