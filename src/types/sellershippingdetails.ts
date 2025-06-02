export interface SellerShippingDetailsItem  {
    id:number;
    seller_id: number;
    seller_name: string;
    seller_address: string;
    seller_contact: string;
    shipping_name: string;
    amount_paid: number;
    amount_paid_date: string;
    address_line_1: string;
    address_line_2: string;
    seller_pincode: string;
    seller_contact_person_name: string;
    seller_contact_person_number: string;
    logistics_through: string;
    logistics_agency: string;
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
    order_delivery_date:string;
    delivery_address:string;

    // invoice 

    invoicing_invoice_generate_date: string | undefined;
    invoicing_invoice_number:string;
    invoice_to: string;
    invoice_address: string;
    invoice_gstin: string;
    packaging_expenses: string;
    invoicing_total_amount:string;
    total_amount_in_words: string;
    invoicing_amount: string;
    expenses: string;
  };

 
  