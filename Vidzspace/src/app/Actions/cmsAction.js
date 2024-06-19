export const setTeamPath = (path)=>{
    return{
        type:"SET_TEAM_PATH",
        path:path
    }
}
export const setProjectState = (value)=>{
    return{
        type:"SET_PROJECT_STATE",
        value:value
    }
}
export const setCMSData = (files,folders)=>{
    return{
        type:"SET_CMS_DATA",
        files:files,
        folders:folders
    }
}