const initialState = {
  info: null,
  currentTeam: null,
  teamState: false,
  optionState:"Team Projects"
};
const teamReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_TEAM":
      return {
        ...state,
        info: action.team,
      };
    case "SET_CURRENT_TEAM":
      return {
        ...state,
        currentTeam: action.team,
      };
    case "ADD_TEAM_STATE":
      return {
        ...state,
        teamState: action.value,
      };
      case "SET_OPTION_STATE":
        return{
            ...state,
            optionState:action.optionName
        }
    default:
      return state;
  }
};

export default teamReducer;
