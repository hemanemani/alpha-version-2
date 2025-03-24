"use client"

import React, { useMemo } from "react";
import { useReactTable, getCoreRowModel, ColumnDef } from "@tanstack/react-table";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Data {
  id: number;
  name: string;
  email: string;
  age: number;
}

const data: Data[] = [
  { id: 1, name: "Alice", email: "alice@example.com", age: 25 },
  { id: 2, name: "Bob", email: "bob@example.com", age: 30 },
  { id: 3, name: "Charlie", email: "charlie@example.com", age: 22 },
];

const columns: ColumnDef<Data>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "age", header: "Age" },
];

export default function TanstackTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Export as CSV
  const exportToCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "data.csv");
  };

  // Export as Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "data.xlsx");
  };

  // Export as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map((col) => col.header as string)],
      body: data.map((row) => [row.id, row.name, row.email, row.age]),
    });
    doc.save("data.pdf");
  };

  // Copy to Clipboard
  const copyToClipboard = () => {
    const text = data.map((row) => Object.values(row).join("\t")).join("\n");
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">TanStack Table with Export</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2 bg-gray-200">
                  {header.column.columnDef.header as string}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2 text-center">
                  {cell.getValue() as string | number}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        <button onClick={exportToCSV} className="px-4 py-2 bg-blue-500 text-white rounded">Export CSV</button>
        <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded">Export Excel</button>
        <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded">Export PDF</button>
        <button onClick={copyToClipboard} className="px-4 py-2 bg-gray-500 text-white rounded">Copy</button>
      </div>
    </div>
  );
}
