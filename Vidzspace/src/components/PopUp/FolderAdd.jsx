import React, { useContext, useEffect } from "react";
import Input from "../HomeInputs/Input";
import { MdDriveFileRenameOutline } from "react-icons/md";
import HomeContext from "../../context/homePage/HomeContext";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { createFolder, createTeam, fetchTeamsData } from "../../api/s3Objects";
import { setCMSData, setTeamPath } from "../../app/Actions/cmsAction";
import { useRef } from "react";
import ProjectContext from "../../context/project/ProjectContext";

const FolderAdd = () => {
  const { user, currentTeam, path, teamPath, setLoad } =
    useContext(HomeContext);
  const {
    addFolder,
    setAddFolder,
    newFolderName,
    setNewFolderName,
    setAddPopUp,
  } = useContext(ProjectContext);
  const dispatch = useDispatch();
  const handleCancelClick = () => {
    setAddFolder(false);
    setNewFolderName("");
  };
  const fetchData = async () => {
    const currentTeamPath = currentTeam;
    try {
      const userId = user?.uid;
      const response = await fetchTeamsData(
        `${userId}/${currentTeamPath}/${path}`,
        userId
      );
      const filesData = response?.files || [];
      const folderData = response?.folders || [];
      dispatch(setCMSData(filesData, folderData));
    } catch (err) {
      console.log("Unable to fetch data");
    }
  };

  const handleCreateFolderClick = async () => {
    setAddFolder(false);
    setLoad(true);
    try {
      const userId = user?.uid;
      const response = await createFolder(
        path,
        teamPath,
        userId,
        newFolderName
      );
      await fetchData();
      setAddPopUp(false);
      setLoad(false);
      setNewFolderName("");
      console.log(response);
    } catch (err) {
      console.log(err);
      setLoad(false);
    }
    console.log("created");
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
  }, [addFolder]);

  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-30 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div
        ref={popupRef}
        className="popup bg-[#2f2f2f] w-2/6 h-2/7 p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]"
      >
        <div className="flex w-full px-2 mb-6">
          <p className="text-white text-3xl font-bold">Create New Folder</p>
        </div>
        <div className="flex w-full px-2 flex-col text-white mb-4">
          <Input
            placeholder={"New Folder Name"}
            label={"Folder Name"}
            icon={<MdDriveFileRenameOutline />}
            inputState={newFolderName}
            inputStateFunc={setNewFolderName}
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
            onClick={handleCreateFolderClick}
            disabled={!newFolderName}
            className={`p-2 px-6 rounded-xl ${
              newFolderName
                ? "cursor-pointer bg-[#f8ff2a]"
                : "cursor-not-allowed bg-[#f0e679]"
            }`}
          >
            Create Folder
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FolderAdd;
