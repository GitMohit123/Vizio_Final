import React from "react";
import { Triangle } from "react-loader-spinner";

const MainLoader = () => {
  return (
    <div className="flex items-center justify-center container flex-col gap-4">
      <div className="transform rotate-180">
        <Triangle
          type="Triangle"
          color="#EAE00D"
          height={80}
          width={80}
          visible={true}
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
      <p className="text-[#AEA00D] text-xl">Vizio</p>
    </div>
  );
};

export default MainLoader;
