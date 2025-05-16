// lib/protectedRoutes.ts

const protectedRoutes: Record<string, string[]> = {
  // Dashboard & Analytics
  "/analytics": ["full"],

  // Domestic Inquiries
  "/inquiries/domestic": ["full", "limited", "view"],
  "/inquiries/domestic/create": ["full", "limited"],
  "/inquiries/domestic/edit": ["full", "limited"],
  "/inquiries/domestic/upload": ["full"],
  "/inquiries/domestic/cancellations": ["full","limited","view"],

  // International Inquiries
  "/inquiries/international": ["full", "limited", "view"],
  "/inquiries/international/create": ["full", "limited"],
  "/inquiries/international/edit": ["full", "limited"],
  "/inquiries/international/upload": ["full"],
  "/inquiries/international/cancellations": ["full","limited","view"],

  // Offers
  "/offers/domestic": ["full", "limited", "view"],
  "/offers/international": ["full", "limited", "view"],
  "/offers/domestic/cancellations": ["full", "view"],
  "/offers/international/cancellations": ["full","limited","view"],

  // Orders
  "/orders/domestic": ["full", "limited", "view"],
  "/orders/domestic/create": ["full", "limited"],
  "/orders/domestic/edit": ["full", "limited"],
  "/orders/domestic/cancellations": ["full","limited","view"],

  "/orders/international": ["full", "limited", "view"],
  "/orders/international/create": ["full", "limited"],
  "/orders/international/edit": ["full", "limited"],
  "/orders/international/cancellations": ["full","limited","view"],

  // Ads
  "/sellers/index": ["full", "limited", "view"],
  "/sellers/create": ["full", "limited"],
  "/sellers/edit": ["full", "limited"],

  // Ads
  "/ads": ["full"],
  "/ads/create": ["full"],
  "/ads/edit": ["full"],

  // User Management
  "/users": ["full"],
  "/users/create": ["full"],
  "/users/edit": ["full"],
};

export default protectedRoutes;
