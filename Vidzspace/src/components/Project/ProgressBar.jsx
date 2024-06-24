import React from "react";
import { motion } from "framer-motion";
import { FaCircle } from "react-icons/fa";

const RectBar = () => {
  const progress = "Upcoming";
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'text-blue-400';
      case 'Upcoming':
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
    <motion.div style={insetBorderStyle} className="absolute flex gap-2 rounded-md top-2 right-2 text-black items-center justify-center px-3 py-1 bg-[#7A7B99] bg-opacity-60 backdrop-blur-3xl z-10">
      <FaCircle className={getStatusColor(progress)} size={20} />
      <span>{progress}</span>
    </motion.div>
  );
};

export default RectBar;