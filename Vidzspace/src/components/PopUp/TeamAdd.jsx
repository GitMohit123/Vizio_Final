import React, { useContext, useEffect } from "react";
import Input from "../HomeInputs/Input";
import { MdDriveFileRenameOutline } from "react-icons/md";
import HomeContext from "../../context/homePage/HomeContext";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import {
  addTeamState,
  setCurrentTeam,
  setTeams,
} from "../../app/Actions/teamActions";
import { createTeam, listTeams } from "../../api/s3Objects";
import { setTeamPath } from "../../app/Actions/cmsAction";

const TeamAdd = () => {
  const { teamName, setTeamName, user, currentTeam } = useContext(HomeContext);
  const dispatch = useDispatch();
  const handleCancelClick = () => {
    dispatch(addTeamState(false));
    setTeamName("");
  };
  const fetchTeams = async () => {
    if (user) {
      try {
        const userId = user?.uid;
        await listTeams(userId).then((data) => {
          dispatch(setTeams(data));
        });
      } catch (err) {
        console.log("Not able to fetch data");
      }
    }
  };
  useEffect(() => {
    dispatch(setTeamPath(currentTeam));
  }, [currentTeam]);

  const handleCreateTeamClick = async () => {
    try {
      const userId = user?.uid;
      await createTeam(teamName, userId).then(() => {
        fetchTeams();
        console.log("added");
        dispatch(setCurrentTeam(`${teamName}'s Team`));
      });
      handleCancelClick();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-30 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div className="popup bg-[#2f2f2f] w-2/6 h-2/7 p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]">
        <div className="flex w-full px-2 mb-6">
          <p className="text-white text-3xl font-bold">Create New Team</p>
        </div>
        <div className="flex w-full px-2 flex-col text-white mb-4">
          <Input
            placeholder={"New Team Name"}
            label={"Team Name"}
            icon={<MdDriveFileRenameOutline />}
            inputState={teamName}
            inputStateFunc={setTeamName}
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
            onClick={handleCreateTeamClick}
            disabled={!teamName}
            className={`p-2 px-6 rounded-xl ${
              teamName
                ? "cursor-pointer bg-[#f8ff2a]"
                : "cursor-not-allowed bg-[#f0e679]"
            }`}
          >
            Create Team
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TeamAdd;
