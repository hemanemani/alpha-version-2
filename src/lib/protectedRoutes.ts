// lib/protectedRoutes.ts

const protectedRoutes: Record<string, string[]> = {
  // Dashboard & Analytics
  "/dashboard": ["master", "full", "limited", "view"],
  "/analytics": ["master"],

  // Domestic Inquiries
  "/inquiries/domestic": ["master", "full", "limited", "view"],
  "/inquiries/domestic/create": ["master","full", "limited"],
  "/inquiries/domestic/edit": ["master","full", "limited"],
  "/inquiries/domestic/upload": ["master"],
  "/inquiries/cancellations": ["master","full","limited","view"],

  // International Inquiries
  "/inquiries/international": ["master","full", "limited", "view"],
  "/inquiries/international/create": ["master","full", "limited"],
  "/inquiries/international/edit": ["master","full", "limited"],
  "/inquiries/international/upload": ["master"],

  // Offers
  "/offers/domestic": ["master","full", "limited", "view"],
  "/offers/international": ["master","full", "limited", "view"],
  "/offers/cancellations": ["master","full","limited","view"],

  // Orders
  "/orders/domestic": ["master","full", "limited", "view"],
  "/orders/domestic/create": ["master","full", "limited"],
  "/orders/domestic/edit": ["master","full", "limited"],
  "/orders/cancellations": ["master","full","limited","view"],

  "/orders/international": ["master","full", "limited", "view"],
  "/orders/international/create": ["master","full", "limited"],
  "/orders/international/edit": ["master","full", "limited"],

  // sellers
  "/sellers/index": ["master","full", "limited", "view"],
  "/sellers/create": ["master","full", "limited"],
  "/sellers/edit": ["master","full", "limited"],
  "/sellers/products": ["master","full", "limited"],
  "/sellers/upload": ["master"],



  // Ads
  "/ads": ["master"],
  "/ads/create": ["master"],
  "/ads/edit": ["master"],
  "/ads/upload": ["master"],


  // User Management
  "/users": ["master"],
  "/users/create": ["master"],
  "/users/edit": ["master"],
};

export default protectedRoutes;
