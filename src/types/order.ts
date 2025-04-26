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
  offers?: {
    sample_received_date: string | undefined;
    sample_dispatched_date: string | undefined;
    order?: {
      order_number: number | null;
      amount_received_date: string | undefined;
      total_amount: number | null;
      sellers?: {
        seller_name: string | null;
        seller_address: string | null;
        product_name: string | null;
      }[];
    };
  }[];
  

}
