import React from "react";
import { useState } from "react";
import {color, motion} from "framer-motion"

const Input = ({ placeholder, label,icon, inputState, inputStateFunc, type }) => {
    const [isFocus,setIsFocus] = useState(false)
    const inputContainerStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        borderRadius: "6px",
        padding: "8px 6px", // Adjust padding as needed
        border: "1px solid #f8ff2a", // Change color if needed
        backgroundColor:"transparent",
        marginTop:"10px"
      };
      const inputStyle = {
        width: "100%",
        height: "100%",
        color:"white",
        backgroundColor: "transparent",
        fontSize: "1.2rem", // Adjust font size as needed
        border: "none",
        outline: "none",
      };
      const shadowStyle = isFocus
    ? { boxShadow: "0 0 4px black" } // Change color if needed
    : {};

  return (
    <>
    <p className="text-xl">{label} <span className="text-red-600">*</span></p>
    <motion.div
      style={{ ...inputContainerStyle, ...shadowStyle }}
    >
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        style={{ ...inputStyle }}
        value={inputState}
        onChange={(e) => inputStateFunc(e.target.value)}
        onFocus={()=>setIsFocus(true)}
        onBlur={()=>setIsFocus(false)}
      />
    </motion.div>
    </>
  )
};

export default Input;
