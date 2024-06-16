const initialState = {
  teamPath: "",
  error: null,
  path: "",
  projectState: false,
};

const cmsReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_TEAM_PATH":
      return {
        ...state,
        teamPath: action.path,
      };
    case "SET_PROJECT_STATE":
      return {
        ...state,
        projectState: action.value,
      };
    default:
      return state;
  }
};

export default cmsReducer;
