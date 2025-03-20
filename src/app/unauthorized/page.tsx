import React from "react";

const Unauthorized: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <h2 className="text-2xl font-bold">
        You dont have access to this page
      </h2>
    </div>
  );
};

export default Unauthorized;
