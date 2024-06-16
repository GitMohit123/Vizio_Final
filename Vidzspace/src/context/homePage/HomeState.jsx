import React, { useState } from "react";
import HomeContext from "./HomeContext";
import { useDispatch, useSelector } from "react-redux";
import { addTeamState, setCurrentTeam } from "../../app/Actions/teamActions";
import { setTeamPath } from "../../app/Actions/cmsAction";

const HomeState = ({ children }) => {
  const displayName = (teamName) => {
    const firstLetter = teamName.charAt(0);
    const nameDisplayed = `${firstLetter} T`;
    return nameDisplayed;
  };
  const user = useSelector((state) => state.user.info);
  const team = useSelector((state) => state.team.info);
  const currentTeam = useSelector((state) => state.team.currentTeam);
  const teamState = useSelector((state) => state.team.teamState);
  const teamPath = useSelector((state) => state.cms.teamPath);
  const optionState = useSelector((state) => state.team.optionState);
  const projectState = useSelector((state) => state.cms.projectState);
  const dispatch = useDispatch();
  const [teamName, setTeamName] = useState("");

  const handleTeamClick = (currentTeamName) => {
    dispatch(setCurrentTeam(currentTeamName));
    dispatch(setTeamPath(currentTeam));
  };
  const handleAddTeam = () => {
    dispatch(addTeamState(true));
  };

  const handleDropDownClick = () => {
    console.log("Drop down clicked ");
  };

  return (
    <HomeContext.Provider
      value={{
        displayName,
        user,
        team,
        currentTeam,
        teamState,
        teamName,
        setTeamName,
        teamPath,
        handleTeamClick,
        handleAddTeam,
        handleDropDownClick,
        optionState,
        projectState
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export default HomeState;
