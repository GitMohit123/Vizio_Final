import React, { useContext } from "react";
import { IoIosTime } from "react-icons/io";
import { motion } from "framer-motion";
import { useRef } from "react";
import { FaPlay } from "react-icons/fa";
import { useState } from "react";
import { FaPause } from "react-icons/fa";

import { MdOutlineAccountCircle } from "react-icons/md";
import ProjectContext from "../../context/project/ProjectContext";
const VideoBox = ({ file }) => {
    const {getDifferenceText} = useContext(ProjectContext);
  const name = "Anurag";
  const time = `${getDifferenceText(file.LastModified)}`;

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <div className="lg:w-[52rem] lg:ml-24 lg:mt-10">
      <div className=" flex flex-col gap-8 text-white justify-center px-4 mt-4 items-center ">
        {" "}
        <div className="w-full h-full lg:h-[27rem] flex justify-center shadow-lg relative rounded-full">
          <video
            className="w-full h-full object-cover"
            muted
            ref={videoRef}
            onClick={togglePlayPause}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls
          >
            <source src={file?.SignedUrl} type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 flex justify-center items-center cursor-pointer"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <FaPause className="text-white text-5xl" />
            ) : (
              <FaPlay className="text-white text-5xl" />
            )}
          </div>
        </div>
        <div className="bg-gray-700 w-full rounded-md px-2 py-2">
          <div className="flex flex-col gap-10">
            <div className="flex gap-4 items-center">
              <MdOutlineAccountCircle size={30} />
              <span>{name}</span>
              <span>{time}</span>
            </div>
            <div>
              <div className="flex gap-2">
                <MdOutlineAccountCircle size={50} />
                <div className="bg-gray-500 w-full flex items-center gap-4 p-3 rounded-lg">
                  <div className="flex bg-gray-400 px-1 py-[2px] rounded-lg">
                    <IoIosTime size={23} className="text-yellow-300" />
                    <span className="text-blue-700 font-bold">00:55</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Type your Comment"
                    className="w-full bg-transparent border-none focus:outline-none text-black"
                  />
                  <motion.button className="bg-blue-500 px-2  font-bold rounded-lg">
                    Send
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoBox;