import React, { useContext } from "react";
import ProjectContext from "../../context/project/ProjectContext";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import HomeContext from "../../context/homePage/HomeContext";
import { deleteTeam } from "../../api/s3Objects";

const TeamDelete = () => {
  const { setTeamDeletePopup, teamDeletePopup } =
    useContext(ProjectContext);
    const {user,setLoad,load,teamPath,currentTeam} = useContext(HomeContext);

  const handleDeleteClick = () => {
    const userId = user?.uid;
    const teamID = currentTeam?.TeamId;
    setLoad(true);
    console.log("deleting");
    deleteTeam(userId, teamPath,teamID).then((data) => {
      console.log(data);
    });
    window.location
      .reload(false)
      .catch((error) => console.log(error))
      .finally(() => setLoad(false));
    handleCancelClick();
  };
  const handleCancelClick = () => {
    setTeamDeletePopup(false);
  };
  console.log("Current Team",currentTeam);
  const popupRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      handleCancelClick();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [teamDeletePopup]);
  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-30 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div
        ref={popupRef}
        className="relative popup bg-[#2f2f2f] w-5/12 h-48 p-5 flex flex-col rounded-md border-2 border-[#4c4c4c]"
      >
        <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2">
          <img
            src="/icons/Mask group.png"
            alt="Dustbin Icon"
            className="h-10 w-10"
          />
        </div>
        <div className="flex w-full px-2 mb-2 mt-3 justify-center">
          <p className="text-white text-xl font-bold">
            You are about to delete the team
          </p>
        </div>
        <div className="flex w-full px-2 justify-center">
          <p className="text-gray-400">
            This will delete the entire content of a Team
          </p>
        </div>
        <div className="flex w-full px-2 mb-4 justify-center">
          <p className="text-red-600">Are you sure?</p>
        </div>
        <div className="flex w-full flex-row justify-end items-center px-2 gap-2">
          <motion.div
            className="p-1 px-6 bg-[#8c8c8c] rounded-xl cursor-pointer hover:bg-[#747373] text-white"
            onClick={() => handleCancelClick()}
          >
            Cancel
          </motion.div>
          <motion.button
            className="p-1 px-6 rounded-xl bg-red-600 text-white cursor-pointer hover:bg-red-700"
            onClick={handleDeleteClick}
          >
            Delete
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TeamDelete;
