export interface OrderItem {
  id: number;
  offerId: string;
  order_number: number;
  name: string;
  mobile_number: string;
  seller_assigned: string;
  quantity: number;
  seller_offer_rate: number;
  gst: number;
  buyer_offer_rate: number;
  final_shipping_value: number;
  total_amount: number;
  buyer_gst_number: string;
  buyer_pan: string;
  buyer_bank_details: string;
  amount_received: number;
  amount_received_date: string;
  amount_paid: number;
  amount_paid_date: string;
  logistics_through: string;
  logistics_agency: string;
  buyer_final_shipping_value: number;
  shipping_estimate_value: number;

  sellers?:{
    seller_address: string | null;
    seller_name: string | null;
    product_name: string | null;
    order_delivery_date:string | null;
    order_dispatch_date:string | null;
  }[];
  offer?:{
    inquiry?:{
      name:string | null;
      mobile_number:string | null;
    }
  }
  international_sellers?:{
    seller_address: string | null;
    seller_name: string | null;
    product_name: string | null;
    order_delivery_date:string | null;
    order_dispatch_date:string | null;
  }[];
  international_offer?:{
    international_inquiry?:{
      name:string | null;
      mobile_number:string | null;
    }
  }
}
