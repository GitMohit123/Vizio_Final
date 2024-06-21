const initialState = {
  teamPath: "",
  error: null,
  path: "",
  projectState: false,
  files: [],
  folders: [],
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

    case "SET_CMS_DATA":
      return {
        ...state,
        files: action.files,
        folders: action.folders,
      };
    case "SET_PATH":
      return {
        ...state,
        path: state.path ? `${state.path}/${action.path}` : action.path,
      };
    case "SET_PATH_EMPTY":
      return {
        ...state,
        path: action.path,
      };
    case "ROUTE_PATH":
      return {
        ...state,
        path: action.path,
      };
    default:
      return state;
  }
};

export default cmsReducer;
