import React, { useContext, useState } from "react";
import { renameTeamState, setCurrentTeam, setOptionState } from "../../app/Actions/teamActions";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import Input from "../HomeInputs/Input";
import { MdDriveFileRenameOutline } from "react-icons/md";
import HomeContext from "../../context/homePage/HomeContext";
import { renameTeam } from "../../api/s3Objects";
import { userLoading } from "../../app/Actions/userAction";
import { setTeamPath } from "../../app/Actions/cmsAction";

const RenameTeam = () => {
  const dispatch = useDispatch();

  const { user,setLoad,load } = useContext(HomeContext);

  const { teamToRename, setTeamToRename } = useContext(HomeContext);

  const [reName, setReName] = useState("");
  const handleCancelClick = () => {
    dispatch(renameTeamState(false));
  };

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
  }, []);

  const handleRename = async () => {
    const userId = user?.uid;
    dispatch(userLoading(true));
    handleCancelClick();
    setLoad(true);
    try {
      const response = await renameTeam(reName, teamToRename, userId);
      console.log(response);
    } catch (error) {
      console.error("Error renaming team:", error);
    } finally {
      dispatch(userLoading(false));
      dispatch(setTeamPath(reName+"'s Team"));
      dispatch(setOptionState("Team Info"));
      dispatch(setCurrentTeam(reName+"'s Team"))
      setLoad(false);
      setReName("");
    }
  };
  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-30 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div
        ref={popupRef}
        className="popup bg-[#2f2f2f] w-1/3 h-2/7 p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]"
      >
        <div className="flex w-full px-2 mb-6">
          <p className="text-white text-3xl font-bold">Rename Team</p>
        </div>
        <div className="flex w-full px-2 flex-col text-white mb-4">
          <Input
            placeholder={"New Team Name"}
            label={"Rename Team Name"}
            icon={<MdDriveFileRenameOutline />}
            inputState={reName}
            inputStateFunc={setReName}
            type={"text"}
          />
        </div>
        <div className="flex w-full flex-row justify-end items-center px-2 gap-3">
          <motion.div
            className="p-2 px-6 bg-[#8c8c8c] rounded-xl cursor-pointer hover:bg-[#747373] text-white"
            onClick={handleCancelClick}
          >
            Cancel
          </motion.div>
          <motion.button
            disabled={!reName}
            className={`p-2 px-6 rounded-xl ${
              reName
                ? "cursor-pointer bg-[#f8ff2a]"
                : "cursor-not-allowed bg-[#f0e679]"
            }`}
            onClick={handleRename}
          >
            Rename
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RenameTeam;
