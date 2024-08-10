import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { FaCircle } from "react-icons/fa";
import HomeContext from "../../context/homePage/HomeContext";
import { useDispatch } from "react-redux";
import { RiArrowDropDownLine } from "react-icons/ri";
import { updateProgress } from "../../api/s3Objects";

const RectBar = ({ document }) => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const { teamPath, path, user, fetchData } = useContext(HomeContext);
  const updateMetadata = async (type, name, progress) => {
    console.log(type, name, progress);
    const user_id = user?.uid;
    updateProgress(type, path, teamPath, user_id, name, progress)
      .then((data) => {
        console.log(data);
        fetchData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const progress = document?.Metadata?.progress;
  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-blue-400";
      case "Upcoming":
        return "text-red-400";
      case "Done":
        return "text-green-400";
      default:
        return "";
    }
  };
  const insetBorderStyle = {
    boxShadow: "inset 0 0 0 1px rgba(105, 105, 105, 0.7)",
  };
  return (
    <div>
      <motion.div
        style={insetBorderStyle}
        className="absolute flex gap-2 rounded-md top-[4px] right-2 text-white items-center justify-between px-3 py-1 bg-transparent bg-opacity-90 backdrop-blur-3xl z-10 w-[172px]"
      >
        <div className="flex items-center gap-2 justify-center">
          <FaCircle size={20} className={getStatusColor(progress)} />
          <span>{progress}</span>
        </div>

        <div className="flex items-center justify-center">
          <RiArrowDropDownLine
            size={30}
            onClick={() => {
              setShowDropdown((prev) => !prev);
            }}
          />
        </div>
      </motion.div>
      {showDropdown && (
        <div style={insetBorderStyle} className="absolute top-11 right-2 bg-transparent shadow-md rounded-md z-10 text-white py-1 px-1 bg-opacity-90 backdrop-blur-3xl w-[172px]">
          {["In Progress", "Upcoming", "Done"]
            .filter((item) => item !== document?.Metadata?.progress)
            .map((status) => (
              <div
                key={status}
                className="px-4 py-2 cursor-pointer hover:bg-gray-500 hover:rounded-md text-white flex flex-row items-center justify-start gap-3"
                onClick={() => {
                  setShowDropdown(false);
                  updateMetadata(document?.Type, document?.Key, status);
                }}
              >
                <FaCircle size={20} className={getStatusColor(status)} />
                {status}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default RectBar;
