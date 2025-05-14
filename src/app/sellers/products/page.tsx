"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search,ArrowUp, ArrowDown  } from "lucide-react"
import axiosInstance from "@/lib/axios";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel,getSortedRowModel,SortingState } from "@tanstack/react-table";
import { DataTablePagination } from "@/components/data-table-pagination"
import { SkeletonCard } from "@/components/SkeletonCard"


type Seller = {
    id: number;
    name: string;
  };
  
interface Product{
  id: number;
  name: string;
  price: number;
  seller_price:number;
  seller_id:number;
  seller?: Seller;
  moq:string;
  remarks:string;
  rate:number;

}




const SellersProductDashboard:React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const fetchProducts = async () => {
      // setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("Product is not authenticated.");
      // setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<{products:Product[]}>('/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productList = response.data.products;
        setProducts(productList);
        setFilteredData(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
        setIsLoading(false);
    }
  }
      
  fetchProducts();
  }, []);



  

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => { 
      const value = event.target.value.toLowerCase();
      setSearchQuery(value);
    
      if (!value) {
        setFilteredData(products); // Restore full data when search is cleared
        return;
      }
    
      const filtered = products.filter((row) =>
        Object.values(row).some(
          (field) => field && String(field).toLowerCase().includes(value) // Check if field is not null
        )
      );
    
      setFilteredData(filtered);
    };

    const columns: ColumnDef<Product>[] = [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: "Product Name",
      },
      {
        accessorFn: (row) => row.seller_price,
        id: "seller_price",
        header: "Seller Price",
      },
      {
        accessorFn: (row) => row.price,
        id: "price",
        header: "Our Price",
      },
      {
        accessorFn: (row) => row.rate,
        id: "rate",
        header: "Rate of",
      },
      {
        accessorFn: (row) => row.moq,
        id: "moq",
        header: "MOQ",
      },
      {
        accessorFn: (row) => row.price,
        id: "remarks",
        header: "Remarks",
      },
      {
        accessorFn: (row) => row.seller?.name ?? "-"        ,
        id: "seller_id",
        header: "Seller Name",
      },
    ];

    const table = useReactTable({
      data: filteredData,
      columns,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      state: {
        sorting,
      },  
      initialState: { pagination: { pageSize,pageIndex:0 } }, 
    });
    
  

  return (
    <div>
        <div className="ml-[20px] -mt-[30px] mb-[20px]">
          {isLoading ? <SkeletonCard height="h-[40px]" className="w-[40px]" />
            :
          <p className="text-[28px] text-[#000] mt-[5px] font-inter-bold">{products.length}</p>
          }
        </div>
        
        <div className="flex justify-end items-center mb-4 gap-4">
            <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
            <Input
                className="w-64 bg-white font-inter-light"
                placeholder="Search product..."
                value={searchQuery}
                onChange={handleSearch}
            />
            </div>
          
        </div>

      

        <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Total: {products.length}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                table.setPageSize(Number(value))
              }}
              defaultValue="10"
            >
              <SelectTrigger className="w-[60px] h-[25px] text-[13px] p-2 font-inter-semibold cursor-pointer">                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 15, 20, 25].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="cursor-pointer">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      <div className="bg-transparent rounded-lg border-2 border-[#d9d9d9]">
      {/* {loading ? (
        <p>Loading...</p>
      ) : ( */}
        <Table>
          <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none py-4 font-inter-medium"
                      >
                        <div className="flex flex-col items-center gap-1 justify-center relative float-start">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                            {header.column.getCanSort() && (
                            <span className="absolute -bottom-3">
                            {isSorted === "asc" && <ArrowUp className="w-3 h-3" />}
                            {isSorted === "desc" && <ArrowDown className="w-3 h-3" />}
                            </span>
                            
                            )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          <TableBody className="font-inter-medium">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading && <SkeletonCard height="h-[64px]" />}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      {/* )} */}
      </div>
        <div className="mt-6">
          <DataTablePagination table={table} />
        </div>
    </div>
  )
}

export default SellersProductDashboard;

