export const setUserDetails = (user)=>{
    return {
        type:"SET_USER",
        user:user
    }
}
export const getUserDetails = (user)=>{
    return {
        type:"GET_USER",
    }
}

export const setUserNULL = ()=>{
    return {
        type:"SET_USER_NULL",
        user:null
    }
}

export const userLoading =(value)=>{
    return{
        type:"SET_LOADING",
        value:value
    }
}
export const userLoadingComponent =(value)=>{
    return{
        type:"SET_LOADING_COMPONENT",
        value:value
    }
}