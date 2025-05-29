
import {ProductData}  from "@/types/orderproduct";


export interface OrderItem {
  id: number;
  order_number: number;
  name: string;
  mobile_number: string;
  sellerdetails:ProductData[];
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
  buyer_total_amount:number;
  shipping_estimate_value: number;
  products: {
    product_name: string;
  }[];

  user:{
    name: string | '';
  };
  user_id?: number;
seller_id:number;
  sellers?:{
    seller_address: string | null;
    seller_name: string | null;
    product_name: string | null;
    order_delivery_date:string | null;
    order_dispatch_date:string | null;
  }[];
  offer?:{
    inquiry?:{
      id: number;
      name:string | null;
      mobile_number:string | null;
      user?:{
      name : string | null;
    }
    }
  }
  offers?:{
    order?:{
      order_number: number;
      total_amount:number;
      amount_received_date : string | null;
      user?:{
        name: string | null;
      }
      sellers?:{
        seller_address: string | null;
        seller_name: string | null;
        product_name: string | null;
        order_delivery_date:string | null;
        order_dispatch_date:string | null;    
      }[]
    }
  }[]
  international_sellers?:{
    seller_address: string | null;
    seller_name: string | null;
    product_name: string | null;
    order_delivery_date:string | null;
    order_dispatch_date:string | null;
  }[];
  international_offer?:{
    international_inquiry?:{
      id: number;
      name:string | null;
      mobile_number:string | null;
      user?:{
      name : string | null;
    }
    }
  }
  international_offers?:{
    international_order?:{
      order_number: number;
      total_amount:number;
      amount_received_date : string | null;
      user?:{
        name: string | null;
      }
      international_sellers?:{
        seller_address: string | null;
        seller_name: string | null;
        product_name: string | null;
        order_delivery_date:string | null;
        order_dispatch_date:string | null;    
      }[]
    }
  }[];
  
}
