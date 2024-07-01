import React, { useState } from 'react'
import { FaLocationArrow } from 'react-icons/fa';
import {motion} from "framer-motion";


const ReplyForm = ({handleReply,parentId}) => {
    const [text,setText] = useState("");
    const isTextAreaDisabled = text.length===0;
  return (
    <div className="bg-white w-full flex items-center gap-4 px-3 py-2 rounded-lg justify-center">
    <input
      type="text"
      placeholder="Reply"
      className="w-full bg-transparent border-none focus:outline-none text-gray-800"
      value={text}
      onChange={(e)=>setText(e.target.value)}
      onKeyDown={(e)=>{if(e.key==="Enter"){
          handleReply(text,parentId)
      }}}
    />
    <motion.button
      className=" p-2 rounded-full"
      disabled={isTextAreaDisabled}
      onClick={()=>handleReply(text,parentId)}
    >
      <FaLocationArrow className="text-xl text-black" />
    </motion.button>
  </div>
  )
}

export default ReplyForm
