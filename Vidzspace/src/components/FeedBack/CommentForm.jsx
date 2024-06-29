import React, { useContext, useState } from "react";
import ProjectContext from "../../context/project/ProjectContext";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoIosTime } from "react-icons/io";
import { motion } from "framer-motion";
import HomeContext from "../../context/homePage/HomeContext";
import { FaLocationArrow } from "react-icons/fa6";
import { createComment } from "../../api/Comments";

const CommentForm = ({ file }) => {
  const { user,load,setLoad } = useContext(HomeContext);
  const {videoTimeMin,videoTimeSec} = useContext(ProjectContext);
  const firstLetter = file?.Metadata?.ownername?.charAt(0).toUpperCase();
  const firstLetterCommenting = user?.name?.charAt(0).toUpperCase();
  const [text,setText] = useState("")
  const isTextAreaDisabled = text.length===0;

  const handleCreateComment = async()=>{
    setLoad(true);
    try{
        const comment = text;
        const userId = user?.uid;
        const territory_id = user?.name;
        const videoName = file?.Key;
        const reply_id = "null";
        const videoTime = videoTimeMin*60 + videoTimeSec;
        const response = await createComment(comment,userId,territory_id,videoName,reply_id,videoTime);
        console.log("Comment Created : Message from Frontend");
        console.log(response);
        setText("");
        setLoad(false);
    }catch(err){
        console.log("Unable to create Comment");
    }
  }

  const { getDifferenceText } = useContext(ProjectContext);
  return (
    <div className="bg-[#242426] w-full rounded-md px-2 py-2">
      <div className="flex flex-col gap-8 p-2">
        <div className="flex flex-row gap-3 items-center justify-start">
          <div className="relative w-8 h-8">
            <img
              src="/icons/Profile.png"
              alt="User"
              className="w-full h-full rounded-full"
            />
            {firstLetter && (
              <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-400 bg-opacity-75 rounded-full">
                {firstLetter}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400">{file?.Metadata?.ownername}</p>
          <p className="text-sm text-gray-400">
            {getDifferenceText(file?.LastModified)}
          </p>
        </div>
        <div>
          <div className="flex gap-4 justify-center items-center">
            <div className="relative w-12 h-12">
              <img
                src="/icons/Profile.png"
                alt="User"
                className="w-full h-full rounded-full"
              />
              {firstLetterCommenting && (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-400 bg-opacity-75 rounded-full">
                  {firstLetterCommenting}
                </div>
              )}
            </div>
            <div className="bg-gray-800 w-full flex items-center gap-4 p-3 rounded-lg justify-center">
              <div className="flex px-1 py-[2px] rounded-lg justify-center items-center gap-2">
                <IoIosTime size={23} className="text-yellow-300" />
                <span className="text-blue-700 font-bold">{`${videoTimeMin}:${videoTimeSec}`}</span>
              </div>
              <input
                type="text"
                placeholder="Type your Comment"
                className="w-full bg-transparent border-none focus:outline-none text-gray-300"
                value={text}
                onChange={(e)=>setText(e.target.value)}
                onKeyDown={(e)=>{if(e.key==="Enter"){
                    handleCreateComment()
                }}}
              />
              <motion.button
                className=" p-2 rounded-full"
                disabled={isTextAreaDisabled}
                onClick={handleCreateComment}
              >
                <FaLocationArrow className="text-xl text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
