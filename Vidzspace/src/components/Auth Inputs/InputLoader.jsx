import React from "react";
import { RotatingLines } from "react-loader-spinner";

const InputLoader = () => {
  return (
    <div className="flex items-center justify-center container ">
      <RotatingLines
        visible={true}
        height="30"
        width="30"
        color="#AEA00D"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default InputLoader;
