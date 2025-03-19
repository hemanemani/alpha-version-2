import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LimitedAccessModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (selectedPages: string[]) => void;
    selectedPages: string[];
  }
  interface TableItem {
    name: string;
    view: { key: string; label: string };
    modify: { key: string; label: string };
  }
  
  interface TableAction {
    action: string;
    items: TableItem[];
  }

  const LimitedAccessModal: React.FC<LimitedAccessModalProps> = ({
    open,
    onClose,
    onSave,
    selectedPages,
  }) => {
    // Define the table data with TypeScript types
    const tableData: TableAction[] = [
      {
        action: "Inquiries",
        items: [
          {
            name: "Domestic Inquiries",
            view: { key: "inquiries/domestic", label: "View Domestic Inquiries" },
            modify: {
              key: "inquiries/domestic/modify",
              label: "Modify Domestic Inquiries",
            },
          },
          {
            name: "International Inquiries",
            view: { key: "inquiries/international", label: "View International Inquiries" },
            modify: {
              key: "inquiries/international/modify",
              label: "Modify International Inquiries",
            },
          },
        ],
      },
      {
        action: "Offers",
        items: [
          {
            name: "Domestic Offers",
            view: { key: "offers/domestic", label: "View Domestic Offers" },
            modify: {
              key: "inquiries/domestic/modify",
              label: "Modify Domestic Inquiries",
            },
          },
          {
            name: "International Offers",
            view: { key: "offers/international", label: "View International Offers" },
            modify: {
              key: "inquiries/international/modify",
              label: "Modify International Inquiries",
            },
          },
        ],
      },
    ];
  
    // Define state with TypeScript types
    const [selected, setSelected] = useState<string[]>(selectedPages || []);
  
    // Update selected state when selectedPages prop changes
    useEffect(() => {
      setSelected(selectedPages);
    }, [selectedPages]);
  
    // Handle checkbox changes
    const handleCheckboxChange = (pageKey: string) => {
      setSelected((prev) =>
        prev.includes(pageKey)
          ? prev.filter((p) => p !== pageKey) // Uncheck the box
          : [...prev, pageKey] // Check the box
      );
    };
  
    // If the modal is not open, return null
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[640px] bg-white rounded-lg shadow-lg p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">User Permissions</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
  
          {/* Modal Body */}
          <div className="mt-4">
            <table className="w-full">
              <thead>
                <tr className="text-gray-600 text-sm">
                  <th className="w-1/2 text-left font-medium py-2">Actions</th>
                  <th className="w-1/4 font-medium py-2">View</th>
                  <th className="w-1/4 font-medium py-2">Modify</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((action) => (
                  <React.Fragment key={action.action}>
                    <tr>
                      <td
                        colSpan={3}
                        className="bg-gray-100 text-sm font-medium text-black border border-gray-200 px-3 py-2"
                      >
                        {action.action}
                      </td>
                    </tr>
                    {action.items.map((item) => (
                      <tr key={item.name} className="border-b border-gray-200">
                        <td className="text-sm font-medium text-black py-2">{item.name}</td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={selected.includes(item.view.key)}
                            onChange={() => handleCheckboxChange(item.view.key)}
                            className="w-4 h-4 accent-black"
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={selected.includes(item.modify.key)}
                            onChange={() => handleCheckboxChange(item.modify.key)}
                            className="w-4 h-4 accent-black"
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Modal Footer */}
          <div className="mt-40 flex justify-center">
            <Button
              onClick={() => onSave(selected)}
              className="w-[65%] bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Update Permission
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  export default LimitedAccessModal;
  
  