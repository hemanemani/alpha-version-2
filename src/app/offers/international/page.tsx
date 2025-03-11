"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Upload } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const TruncatedCell = ({ content, limit = 10 }: { content: string; limit?: number }) => {
  const shouldTruncate = content.length > limit
  const displayContent = shouldTruncate ? `${content.slice(0, limit)}...` : content

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{displayContent}</span>
        </TooltipTrigger>
        {shouldTruncate && (
          <TooltipContent>
            <p>{content}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

const inquiries = [
  {
    id: "001",
    date: "12/08/2024",
    products: "Natural Honey: Sundarbans, Organic",
    category: "Honey, Waffers, Organic Products",
    name: "Anant Parekh",
    location: "Ahmedabad",
    firstContact: "02/11/2024",
    secondContact: "05/11/2024",
    thirdContact: "-",
    notes: "The customer is not picking up the phone. Try contacting via email.",
  },
  {
    id: "002",
    date: "11/10/2024",
    products: "Turmeric Bulb, Organic Turmeric Powder",
    category: "Spices, Vegetables, Organic Products",
    name: "Rahul Patel",
    location: "Rajkot",
    firstContact: "12/11/2024",
    secondContact: "-",
    thirdContact: "-",
    notes: "Customer wants discount on bulk order. Discuss with management.",
  },
  {
    id: "003",
    date: "03/01/2025",
    products: "Natural Lemon",
    category: "Fruits",
    name: "Hema Nemani",
    location: "Andhra",
    firstContact: "04/01/2025",
    secondContact: "07/01/2025",
    thirdContact: "-",
    notes: "Vendor not answering calls. Try reaching out via email or alternative contact.",
  },
  {
    id: "004",
    date: "01/01/2025",
    products: "Organic Green Tea, Natural Flavored Tea",
    category: "Tea, Coffee",
    name: "Gurpreet K",
    location: "Andhra",
    firstContact: "04/01/2025",
    secondContact: "-",
    thirdContact: "-",
    notes: "Customer wants to talk about potential partnership. Schedule a call with the sales team.",
  },
]

type SortConfig = {
  key: keyof (typeof inquiries)[0] | null
  direction: "asc" | "desc" | null
}

export default function InternationalInquiriesDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })

  const filteredAndSortedInquiries = useMemo(() => {
    const result = inquiries.filter(
      (inquiry) =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (sortConfig.key !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [searchTerm, sortConfig])

  const requestSort = (key: keyof (typeof inquiries)[0]) => {
    let direction: "asc" | "desc" | null = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <a href="#" className="text-black underline underline-offset-2 font-[500] text-[14px]">
            View Analytics
          </a>
        </div>
        <div className="flex space-x-2 justify-end items-center">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
            <Input
              className="w-64 bg-white"
              placeholder="Search International offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
            <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9]">
              <Upload className="w-4 h-4 text-[13px]" />
              Export
            </Button>
        </div>
      </div>

      <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px]">Total: {filteredAndSortedInquiries.length}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#7f7f7f] text-[13px] font-[500]">Rows per page:</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-[65px] h-[25px] text-[13px] font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      <div className="bg-transparent rounded-lg border-2 border-[#d9d9d9]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("id")}>
                Inquiry Number
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("date")}>
                Inquiry Date
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("products")}>
                Specific Products
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("category")}>
                Product Categ.
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("name")}>
                Name
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("location")}>
                Location (City)
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("firstContact")}>
                1st Contact Date
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("secondContact")}>
                2nd Contact Date
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("thirdContact")}>
                3rd Contact Date
              </TableHead>
              <TableHead className="cursor-pointer py-6" onClick={() => requestSort("notes")}>
                Notes
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedInquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.id}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.date}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <TruncatedCell content={inquiry.products} />
                </TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <TruncatedCell content={inquiry.category} />
                </TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.name}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.location}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.firstContact}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.secondContact}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.thirdContact}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <TruncatedCell content={inquiry.notes} />
                </TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 text-[#7f7f7f] text-[13px] font-[500]">
          Showing: {filteredAndSortedInquiries.length} of {inquiries.length}
        </div>

    </div>
  )
}

