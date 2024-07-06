import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./Reducers/userReducer";
import teamReducer from "./Reducers/teamReducer"
import cmsReducer from "./Reducers/cmsReducer";

const appReducer = combineReducers({
    user:userReducer,
    team:teamReducer,
    cms:cmsReducer
})

export default appReducer;