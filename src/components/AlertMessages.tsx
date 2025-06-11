"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface AlertMessagesProps {
    message: string;
    isSuccess: boolean;
  }
  
const AlertMessages: React.FC<AlertMessagesProps> = ({message,isSuccess}) => {

  return (
    <div
        className={`max-w-md p-4 rounded-lg shadow-lg text-sm transition-all block ml-auto mr-auto mt-3 ${
            isSuccess
            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700"
            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700"
        }`}
        >
        <div className="flex items-center">
            {isSuccess ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 dark:text-white" />
            ) : (
            <XCircle className="h-5 w-5 text-red-600 mr-2 dark:text-white" />
            )}
            <div>
            <p className="font-semibold dark:text-white">
                {isSuccess ? "Success!" : "Error!"}
            </p>
            <p className="dark:text-white">{message}</p>
            </div>
        </div>
    </div>
  );
};

export default AlertMessages;
