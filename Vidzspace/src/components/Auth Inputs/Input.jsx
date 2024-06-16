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
        border: "1px solid #1B1B1B", // Change color if needed
        backgroundColor:"#e1db66",
        marginBottom:"8px"
      };
      const inputStyle = {
        width: "100%",
        height: "100%",
        color:"black",
        backgroundColor: "transparent",
        fontSize: "1.2rem", // Adjust font size as needed
        // fontWeight: "bold",
        border: "none",
        outline: "none",
      };
      const shadowStyle = isFocus
    ? { boxShadow: "0 0 4px black" } // Change color if needed
    : {};

  return (
    <>
    <p>{label}</p>
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
