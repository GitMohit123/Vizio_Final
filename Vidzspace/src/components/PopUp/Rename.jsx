import React, { useContext } from "react";
import Input from "../HomeInputs/Input";
import { MdDriveFileRenameOutline } from "react-icons/md";
import HomeContext from "../../context/homePage/HomeContext";
import { motion } from "framer-motion";
import { fileFolderRename } from "../../api/s3Objects";
import { fetchTeamsData } from "../../api/s3Objects";
import { setCMSData } from "../../app/Actions/cmsAction";
import { useDispatch } from "react-redux";

const Rename = () => {
  const dispatch = useDispatch();
  const {
    reName,
    setReName,
    currentTeam,
    setRenamePopup,
    itemToRename,
    teamPath,
    user,
    path,
    load,
    setLoad,
  } = useContext(HomeContext);

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

  const handleRename = () => {
    setRenamePopup(false);
    setLoad(true);
    fileFolderRename(
      itemToRename?.type,
      itemToRename?.path,
      reName,
      teamPath,
      user?.uid,
      itemToRename?.name
    )
      .then((data) => {
        console.log(data);
        fetchData();
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      });
  };

  const getName = (item)=>{
    if (item.type === 'file') {
        return 'New File Name';
      } else if(item.type === 'folder') {
        return 'New Folder Name';
      }
  }
  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-10 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div className="popup bg-[#2f2f2f] w-2/6 h-2/7 p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]">
        <div className="flex w-full px-2 mb-6">
          <p className="text-white text-3xl font-bold">Rename</p>
        </div>
        <div className="flex w-full px-2 flex-col text-white mb-4">
          <Input
            placeholder={getName(itemToRename)}
            label={itemToRename?.type==="file"?"File":"Folder"}
            icon={<MdDriveFileRenameOutline />}
            inputState={reName}
            inputStateFunc={setReName}
            type={"text"}
          />
        </div>
        <div className="flex w-full flex-row justify-end items-center px-2 gap-3">
          <motion.div
            className="p-2 px-6 bg-[#8c8c8c] rounded-xl cursor-pointer hover:bg-[#747373] text-white"
            onClick={() => setRenamePopup(false)}
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
            New Name
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Rename;
