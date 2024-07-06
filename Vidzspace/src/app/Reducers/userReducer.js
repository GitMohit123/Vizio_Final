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
        default:
            return state;
    }
};

export default userReducer;