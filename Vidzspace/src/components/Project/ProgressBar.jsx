import React, { useContext } from "react";
import { motion } from "framer-motion";
import { FaCircle } from "react-icons/fa";
import HomeContext from "../../context/homePage/HomeContext";

const RectBar = ({document}) => {

  const getProgressForFolder = (innerFiles) => {
    // Check if any file in the folder has a progress of 'pending'
    if (innerFiles && innerFiles.some(file => file?.Metadata?.progress === 'pending')) {
      return 'pending';
    }
    // If no file has 'pending' progress, return the progress of the first file (or any other logic you prefer)
    return innerFiles && innerFiles[0]?.Metadata?.progress;
  };

  const progress = document.Type === 'file'
    ? document?.Metadata?.progress
    : getProgressForFolder(document?.innerFiles);
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'text-blue-400';
      case 'upcoming':
        return 'text-red-400';
      case 'Done':
        return 'text-green-400';
      default:
        return '';
    }
  };
  const insetBorderStyle = {
    boxShadow: 'inset 0 0 0 2px rgba(105, 105, 105, 0.7)',
  };
  return (
    <motion.div style={insetBorderStyle} className="absolute flex gap-2 rounded-md top-2 right-2 text-black items-center justify-center px-3 py-1 bg-[#7A7B99] bg-opacity-60 backdrop-blur-3xl z-4">
      <FaCircle className={getStatusColor(progress)} size={20} />
      <span>{progress}</span>
    </motion.div>
  );
};

export default RectBar;