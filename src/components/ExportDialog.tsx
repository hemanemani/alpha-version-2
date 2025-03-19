import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, FolderOpen } from "lucide-react";

interface ExportDialogProps {
  modalOpen: boolean;
  handleClose: () => void;
  handleDownload: () => void;
}

export default function ExportDialog({ modalOpen, handleClose, handleDownload }: ExportDialogProps) {
  return (
    <Dialog open={modalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-lg p-5">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold">Export Bulk Upload Template File</DialogTitle>
          {/* <button
            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            onClick={handleClose}
          >
            <X size={16} />
          </button> */}
        </DialogHeader>

        <div className="flex items-center gap-2 mt-2">
          <FolderOpen size={20} />
          <p className="text-sm font-medium">Bulk Upload Template File.xlsx</p>
        </div>

        <DialogFooter className="mt-4 block ml-auto mr-auto">
          <Button onClick={handleDownload} className="bg-black text-white rounded-small text-[11px] px-5 py-1 captitalize border-2 border-[#d9d9d9] cursor-pointer text-center">
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
