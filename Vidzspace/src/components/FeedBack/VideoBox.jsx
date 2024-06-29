import React, { useContext } from "react";
import { IoIosTime } from "react-icons/io";
import { motion } from "framer-motion";
import { useRef } from "react";
import { FaPlay } from "react-icons/fa";
import { useState } from "react";
import { FaPause } from "react-icons/fa";

import { MdOutlineAccountCircle } from "react-icons/md";
import ProjectContext from "../../context/project/ProjectContext";
import CommentForm from "./CommentForm";
const VideoBox = ({ file }) => {
  // const video = document.getElementById("myVideo")
  const {setVideoTimeMin,setVideoTimeSec} = useContext(ProjectContext);
    const video = document.getElementById('myVideo');
  
    video?.addEventListener('seeked', () => {
      const currentTime = Math.floor(video?.currentTime);
      const mins = Math.floor(currentTime/60);
      const seconds = currentTime%60;
      setVideoTimeSec(seconds);
      setVideoTimeMin(mins);
    });

  return (
    <div className="lg:w-[56rem] lg:ml-24 lg:mt-10">
      <div className=" flex flex-col gap-8 text-white justify-center px-4 mt-4 items-center ">
        {" "}
        <div className="w-full h-full lg:h-[27rem] flex justify-center shadow-lg relative rounded-full">
          <video
            className="w-full h-full object-cover"
            id="myVideo"
            src={file?.SignedUrl}
            type="video/mp4"
            controls
          />
        </div>
        {/* Comment Form */}
        <CommentForm file={file}/>
      </div>
    </div>
  );
};

export default VideoBox;
