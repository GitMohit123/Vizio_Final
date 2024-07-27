export const setTeams = (team) => {
  return {
    type: "SET_TEAM",
    team: team,
  };
};
export const setCurrentTeam = (team) => {
  return {
    type: "SET_CURRENT_TEAM",
    team: team,
  };
};
export const addTeamState = (value) => {
  return {
    type: "ADD_TEAM_STATE",
    value: value,
  };
};

export const renameTeamState = (value) => {
  return {
    type: "RENAME_TEAM_STATE",
    value: value,
  };
};

export const setOptionState = (optionName) => {
  return {
    type: "SET_OPTION_STATE",
    optionName: optionName,
  };
};
