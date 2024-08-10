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

export const setPath = (path)=>{
    return{
        type:"SET_PATH",
        path:path
    }
}
export const setPathEmpty = (path)=>{
    return{
        type:"SET_PATH_EMPTY",
        path:path
    }
}

export const routePath = (path)=>{
    return{
        type:"ROUTE_PATH",
        path:path
    }
}
export const popPath = (path)=>{
    const pathSegments = path.split("/");
    pathSegments.pop();
    const newPath = pathSegments.join("/");
    return{
        type:"POP_PATH",
        path:newPath
    }
}