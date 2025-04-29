export interface SellerShippingDetailsItem  {
    seller_id: number;
    seller_name: string;
    seller_address: string;
    seller_contact: string;
    shipping_name: string;
    address_line_1: string;
    address_line_2: string;
    seller_pincode: string;
    seller_contact_person_name: string;
    seller_contact_person_number: string;
    no_of_boxes: number;
    weight_per_unit: number;
    length: number;
    width: number;
    height: number;
    dimension_unit: string;
    invoice_generate_date: string;
    invoice_value: number;
    invoice_number: string;
    order_ready_date: string;
    order_dispatch_date:string;
    order_delivery_date:string

    // invoice 

    invoicing_invoice_generate_date: string | undefined;
    invoicing_invoice_number:string;
    invoice_to: string;
    invoice_address: string;
    invoice_gstin: string;
    packaging_expenses: number;
    invoicing_total_amount:number;
    total_amount_in_words: string;
    product_name: string;
    rate_per_kg: number;
    total_kg: number;
    hsn: string;
    invoicing_amount: number;
    expenses: number;
  };
  