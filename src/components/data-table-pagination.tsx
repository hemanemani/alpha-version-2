"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  // Get current page index and size
  const { pageIndex, pageSize } = table.getState().pagination
  const currentPage = pageIndex + 1

  // Get total row count from the table
  const totalRowCount = table.getFilteredRowModel().rows.length

  // Calculate total pages
  const totalPages = Math.ceil(totalRowCount / pageSize)

  // Generate page numbers to display
  const generatePaginationNumbers = () => {
    const pages = []

    // For small number of pages, show all page numbers
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    // Always show first page
    pages.push(1)

    // Current page and surrounding pages
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    if (startPage > 2) {
      pages.push("ellipsis-start")
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end")
    }

    // Always show last page if we have more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    // Remove duplicates
    return Array.from(new Set(pages))
  }

  const paginationNumbers = generatePaginationNumbers()

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-[13px] text-muted-foreground">
        Showing {pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, totalRowCount)} of {totalRowCount}{" "}
        records
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8 text-[#7f7f7f] cursor-pointer">
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronLeft className="h-4 w-4 cursor-pointer" />
              <ChevronLeft className="h-4 w-4 cursor-pointer" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4 cursor-pointer" />
            </Button>

            {/* Page number buttons */}
            <div className="flex items-center">
              {paginationNumbers.map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <Button key={`ellipsis-${index}`} variant="ghost" className="h-8 w-8 p-0" disabled>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )
                }

                return (
                  <Button
                    key={index}
                    variant={currentPage === page ? "default" : "outline"}
                    className="h-6 w-6 p-0 bg-transparent text-[#7f7f7f] text-[13px] cursor-pointer"
                    onClick={() => table.setPageIndex(Number(page) - 1)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4 cursor-pointer" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronRight className="h-4 w-4 cursor-pointer" />
              <ChevronRight className="h-4 w-4 cursor-pointer" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
