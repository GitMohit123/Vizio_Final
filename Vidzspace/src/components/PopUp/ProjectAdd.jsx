import React from "react";
import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { TbCloudUpload } from "react-icons/tb";
import { cloudOptions } from "../../constants/homePage";
import { setProjectState } from "../../app/Actions/cmsAction";

const ProjectAdd = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleCloudOptionClick = (cloudName)=>{
    if(cloudName==="Google Drive"){
        console.log("Google Drive")
    }else if(cloudName==="One Drive"){
        console.log("One Drive")
    }
    else{
        console.log("DropBox")
    }
  }

  const handleCancelClick = ()=>{
    dispatch(setProjectState(false))
  }

  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-2 bg-opacity-10 bg-[#2f2f2f]">
      <div className="popup bg-[#383838] w-3/6 h-3/5 p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]">
        {/* Title Section */}
        <div className="flex w-full px-2 mb-8">
          <p className="text-white text-3xl font-bold">Create New Project</p>
        </div>
        {/* Input Section */}
        <div className="flex flex-row gap-8 px-3 w-full mb-7">
          <div className="flex flex-col gap-3 w-[60%] text-white">
            <p>Project Name</p>
            <input
              type="text"
              className="bg-black border-2 border-white rounded-md p-1 "
            />
          </div>
          <div className="flex flex-col gap-3 w-[40%] text-white">
            <p>Visibility</p>
            <div
              onClick={toggleDropdown}
              className="flex w-full relative flex-row justify-between items-center p-1 bg-black border-2 border-white rounded-md pl-3 cursor-pointer"
            >
              <p>Select Members</p>
              <MdOutlineKeyboardArrowDown />
              {isOpen && (
                <ul className="absolute top-full left-0 w-full bg-black shadow-md rounded-md overflow-hidden z-10 cursor-pointer border-2 border-white">
                  {/* List items for dropdown options */}
                  <li className="block px-4 py-2 text-sm  hover:bg-[#2f2f2f]">
                    Member 1
                  </li>
                  <li className="block px-4 py-2 text-sm  hover:bg-[#2f2f2f]">
                    Member 2
                  </li>
                  <li className="block px-4 py-2 text-sm  hover:bg-[#2f2f2f]">
                    Member 3
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Drop Down files section */}
        <div className="flex w-full px-3 mb-5">
          <div className="flex p-3 bg-[#3c3b3b] w-full justify-center items-center rounded-md border-2 border-white border-dashed text-white">
            <div className="flex flex-row gap-3 items-center justify-center">
              <TbCloudUpload className="text-3xl" />
              <p>Drop files here to Upload or</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-[#f8ff2a] underline font-bold cursor-pointer"
                // onClick={}
              >
                Browse
              </motion.div>
            </div>
          </div>
        </div>

        {/* Import from cloud */}
        <div className="flex flex-col gap-3 w-full px-3 text-white text-lg font-bold mb-8">
            <p>Import from cloud</p>
            <div className="w-full flex flex-row py-4 px-10 gap-3 bg-[#4d4b4b] justify-evenly items-center rounded-md">
                {cloudOptions.map((option,index)=>{
                    return (
                        <motion.div whileHover={{scale:1.08}} className="cursor-pointer" key={index} onClick={()=>handleCloudOptionClick(option.label)}>
                            <img src={option.icon} alt={option.label} className="h-14 w-16"/>
                        </motion.div>
                    )
                })}
            </div>
        </div>

        <div className="flex w-full flex-row justify-end items-center px-2 gap-3">
          <motion.div
            className="p-2 px-6 bg-[#3c3b3b] rounded-xl cursor-pointer hover:bg-[#747373] text-white font-bold border-2 border-[#f8ff2a]"
            onClick={handleCancelClick}
          >
            Cancel
          </motion.div>
          <motion.button
            // onClick={handleCreateTeamClick}
            className={`p-2 px-6 rounded-xl bg-[#f8ff2a]`}
          >
            Create
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAdd;
