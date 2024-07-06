import React, { useContext } from "react";
import ProjectContext from "../../context/project/ProjectContext";
import { motion } from "framer-motion";
import HomeContext from "../../context/homePage/HomeContext";

const Delete = () => {
  const { setDeletePopup, deletedFiles, setDeletedFiles } = useContext(ProjectContext);
  const { handleDelete, handleDeleteFolder } = useContext(HomeContext);

  const handleDeleteClick = () => {
    if (deletedFiles.Type === "folder") {
        handleDeleteFolder(deletedFiles.Key);
        handleCancelClick()
    }else{
        handleDelete(deletedFiles?.SignedUrl);
        handleCancelClick()
    }
  };
  const handleCancelClick = ()=>{
    setDeletePopup(false);
    setDeletedFiles({})
  }
  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-30 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div className="relative popup bg-[#2f2f2f] w-5/12 h-44 p-5 flex flex-col rounded-sm border-2 border-[#4c4c4c]">
        <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2">
          <img
            src="/icons/Mask group.png"
            alt="Dustbin Icon"
            className="h-10 w-10"
          />
        </div>
        <div className="flex w-full px-2 mb-2 mt-3 justify-center">
          <p className="text-white text-xl font-bold">
            You are about to delete a file
          </p>
        </div>
        <div className="flex w-full px-2 justify-center">
          <p className="text-gray-400">
            This will delete your file from the project
          </p>
        </div>
        <div className="flex w-full px-2 mb-4 justify-center">
          <p className="text-gray-400">Are you sure?</p>
        </div>
        <div className="flex w-full flex-row justify-end items-center px-2 gap-2">
          <motion.div
            className="p-1 px-6 bg-[#8c8c8c] rounded-xl cursor-pointer hover:bg-[#747373] text-white"
            onClick={() => handleCancelClick()}
          >
            Cancel
          </motion.div>
          <motion.button
            className="p-1 px-6 rounded-xl bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600"
            onClick={handleDeleteClick}
          >
            Delete
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Delete;
