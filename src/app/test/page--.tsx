// "use client"

// // components/Invoice.tsx
// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import InvoicePDF from "@/components/InvoicePDF";


// type InvoiceItem = {
//   description: string;
//   quantity: number;
//   price: number;
// };

// type InvoiceProps = {
//   invoiceNumber: string;
//   date: string;
//   dueDate: string;
//   clientName: string;
//   clientAddress: string;
//   items: InvoiceItem[];
//   taxRate?: number;
// };

// const Invoice: React.FC<InvoiceProps> = ({
//   invoiceNumber,
//   date,
//   dueDate,
//   clientName,
//   clientAddress,
//   items,
//   taxRate = 0.18,
// }) => {
//     const subtotal = (items ?? []).reduce(
//         (sum, item) => sum + item.quantity * item.price,
//         0
//       );
//         const tax = subtotal * taxRate;
//   const total = subtotal + tax;

//   const dummyItems = [
//     { name: "OF Tea", rate: 170, quantity: 5, hsn: "", amount: 850 },
//     { name: "BP Tea", rate: 160, quantity: 5, hsn: "", amount: 800 },
//     { name: "BOPSM Tea", rate: 150, quantity: 5, hsn: "", amount: 750 },
//   ];

//   const seller = {
//     name: "Mahiya Naturals",
//     email: "mahiya@example.com",
//     address: "Bangalore, India",
//   };



//   const totalAmount = dummyItems.reduce((acc, item) => acc + item.amount, 0);
//   const packagingCharges = 150;
//   const grandTotal = totalAmount + packagingCharges;

  

//   return (
//     <PDFDownloadLink
//   document={<InvoicePDF seller={seller} />}
//   fileName="invoice.pdf"
// >
//   {({ loading }) => (
//     <button className="bg-green-600 text-white px-4 py-2 rounded">
//       {loading ? "Loading..." : "Download Invoice PDF"}
//     </button>
//   )}
// </PDFDownloadLink>

//     // <Card className="max-w-3xl mx-auto border-3 border-black rounded-sm px-3 pb-3">
//     //   <CardContent>
//     //     {/* Header */}
//     //     <div className="mb-2">
//     //         <h2 className="text-[16px] font-inter-bold text-center">Orgenik E-commerce Private Limited </h2>
//     //         <hr className="border-t-3 border-black" />
//     //         <p className="text-[11px] font-inter-medium text-center">A – 401, Panchdhara Complex, Nr. Grand Bhagwati, S.G. Highway, Bodakdev, Ahmedabad - 380054, <br /> Mobile No- 9328819369, email: business@orgenikbulk.com
//     //         <h3>PAN: AADCO2634G</h3>
//     //         <hr className="border-t-3 border-black mt-3" />
//     //         </p>
//     //     </div>

//     //     <div className="mb-4">
//     //         <p className="underline text-center text-sm font-inter-medium">INVOICE</p>
//     //     </div>

//     //     {/* Invoice Details */}
//     //     <div className="grid grid-cols-2 gap-4 text-sm mb-6">
//     //       <div>
//     //         <p className="underline text-[11px] font-inter-bold">Date: {date}</p>
//     //       </div>
//     //       <div>
//     //         <p className="underline text-[11px] font-inter-bold">Bill No: 3/2024-25</p>
//     //       </div>
//     //     </div>
//     //     <div className="grid grid-cols-2 gap-4 text-sm mb-6">
//     //       <div className="border-3 border-black p-1">
//     //         <p className="text-[11px] font-inter-bold uppercase">Bill To</p>
//     //         <address className="text-[11px] font-inter">
//     //             <p className="font-inter-bold">Mahiya Naturals</p>
//     //             <p>No.22, 4th Main, before 5th cross,(below santus gym) Suddagunta Playa, 
//     //             C.V.Raman Nagar, Bangalore - 560093</p>
//     //             <p>E-mail:</p>
//     //             <p>GSTIN: 29DNJPS1495A1ZP</p>
//     //         </address>
//     //       </div>
//     //       <div>
//     //       </div>
//     //     </div>


//     //     {/* Items Table */}
//     //     <div className="max-w-4xl mx-auto mb-3">
//     //         <table className="w-full text-sm border-2 border-black border-collapse text-[11px] font-inter">
//     //             <thead>
//     //             <tr className="border-b-2 border-black">
//     //                 <th className="border border-black p-1 text-left w-[40%]">Particulars</th>
//     //                 <th className="border border-black p-1 text-center">Rate per Kg</th>
//     //                 <th className="border border-black p-1 text-center">Total Kg</th>
//     //                 <th className="border border-black p-1 text-center">HSN</th>
//     //                 <th className="border border-black p-1 text-right">Amount</th>
//     //             </tr>
//     //             </thead>
//     //             <tbody className="border border-black">
//     //             {dummyItems.map((item, index) => (
//     //                 <tr key={index} className="border border-y-black">
//     //                 <td className={`border border-x-black p-1 w-[40%] ${index === dummyItems.length - 1 ? 'pb-12' : ''}`}>
//     //                 {item.name}</td>
//     //                 <td className={`border border-r-black p-1 text-center ${index === dummyItems.length - 1 ? 'pb-12' : ''}`}>{item.rate}/-</td>
//     //                 <td className={`border border-r-black p-1 text-center ${index === dummyItems.length - 1 ? 'pb-12' : ''}`}>{item.quantity}</td>
//     //                 <td className={`border border-r-black p-1 text-center" ${index === dummyItems.length - 1 ? 'pb-12' : ''}`}>{item.hsn}</td>
//     //                 <td className={`border border-x-black p-1 text-right" ${index === dummyItems.length - 1 ? 'pb-12' : ''}`}>{item.amount.toFixed(2)}</td>
//     //                 </tr>
//     //             ))}

//     //             {/* Row: Subtotal */}
//     //             <tr className="border-t-2 border-black">
//     //                 <td className="border border-x-black p-1 font-semibold" colSpan={4}>Amount</td>
//     //                 <td className="border border-r-black p-1 text-right">{totalAmount.toFixed(2)}</td>
//     //             </tr>
//     //             {/* Row: Other Expenses */}
//     //             <tr>
//     //                 <td className="border border-x-black p-1" colSpan={4}>Other Exps:- Packaging Charges</td>
//     //                 <td className="border border-r-black p-1 text-right">{packagingCharges.toFixed(2)}</td>
//     //             </tr>
//     //             {/* Row: Total */}
//     //             <tr>
//     //                 <td className="border border-black p-1 font-semibold" colSpan={4}>Total Amount :-</td>
//     //                 <td className="border border-black p-1 font-bold text-right">{grandTotal.toFixed(2)}</td>
//     //             </tr>
//     //             </tbody>
//     //         </table>
//     //         </div>

//     //     {/* Footer */}
//     //     <div className="text-[11px] font-inter-semibold">
//     //       <p>Amounts in words: Two Thousand Five Hundred Fifty only</p>
//     //     </div>

//     //     <div className="mt-6 flex justify-between items-end gap-4">
//     //         <div>
//     //             <p className="text-[11px] underline font-inter-semibold">Bank Details</p>
//     //             <p className="text-[11px] font-inter-semibold">Name: Orgenik E-commerce Pvt. Ltd.</p>
//     //             <p className="text-[11px] font-inter-semibold">Account No: 50200053047210</p>
//     //             <p className="text-[11px] font-inter-semibold">Branch: Ahmedabad - Ambawadi</p>
//     //             <p className="text-[11px] font-inter-semibold">UPI ID: 8238820675@hdfcbank</p>
//     //         </div>
//     //         <div>
//     //             <p className="text-[11px] font-inter-semibold">Orgenik E-commerce Pvt. Ltd. </p>
//     //             <p className="text-[11px] font-inter-semibold text-center">P.K. Das</p>
//     //             <p className="text-[10px] text-gray-400 font-inter-semibold text-center">Authorized Persion</p>
//     //         </div>
//     //     </div>
//     //   </CardContent>
//     // </Card>
//   );
// };

// export default Invoice;