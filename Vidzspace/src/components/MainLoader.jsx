import React from "react";
import { Triangle } from "react-loader-spinner";

const MainLoader = () => {
  return (
    <div className="flex items-center justify-center container flex-col gap-4">
      <Triangle
        visible={true}
        height="80"
        width="80"
        color="#EAE00D"
        ariaLabel="triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
      <p className="text-[#AEA00D] text-xl">Vidzspace</p>
    </div>
  );
};

export default MainLoader;
