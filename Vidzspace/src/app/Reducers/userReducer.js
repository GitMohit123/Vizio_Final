const intitialState = {
    loading:true,
    componentLoading:false,
    info:null
}
const userReducer = (state=intitialState, actions)=>{
    switch(actions.type){
        case "GET_USER":
            return {
                ...state,
                componentLoading:false,
                loading:false
            };
        case "SET_USER":
            return {
                ...state,
                componentLoading:false,
                info:actions.user,
                loading:false
            }
        case "SET_USER_NULL":
            return {
                ...state,
                componentLoading:false,
                info:actions.user,
                loading:false
            }
            case "SET_LOADING":
                return {
                    ...state,
                    loading:actions.value
                }
            case "SET_LOADING_COMPONENT":
                return{
                    ...state,
                    componentLoading:actions.value
                }
            case "SET_USER_DETAIL":
                return {
                    ...state,
                    componentLoading: false,
                    info: {
                        ...state.info, // Keep existing info
                        name: actions.name, // Update name
                        ...actions.user // Merge in new user details
                    },
                    loading: false
                };
        default:
            return state;
    }
};

export default userReducer;