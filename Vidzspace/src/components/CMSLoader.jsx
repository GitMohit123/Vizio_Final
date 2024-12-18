import React from "react";
import { Triangle } from "react-loader-spinner";

const CMSLoader = () => {
  return (
    <div className="absolute top-0 right-0 h-full w-full z-20 backdrop-blur-md ">
      <div className="flex items-center justify-center flex-col gap-4 h-full ">
        <div className="transform rotate-180">
          <Triangle
            type="Triangle"
            color="#EAE00D"
            height={80}
            width={80}
            visible={true} // Assuming you want it visible by default
          />
        </div>
        <p className="text-[#AEA00D] text-xl">Vizio</p>
      </div>
    </div>
  );
};

export default CMSLoader;
