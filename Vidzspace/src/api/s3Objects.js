import axios from "axios";

export const listTeams = async (userId) => {
  try {
    const response = await axios.get("/vidzspaceApi/users/s3/listTeams", {
      params: {
        user_id: userId,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
        // Successful response, process the data as needed
        if(response.data.length===0){
          return null; 
        }
        else if(!response.data){
          return null;
        }
        else{
          return response.data;
        }
      } else {
        // Handle non-200 status codes (errors)
        throw new Error(`API request failed with status code: ${response.status}`);
      }
  } catch (err) {
    console.log(err);
  }
};

export const createTeam = async (teamName, userId) => {

    try {
      const encodedTeamName = teamName.includes('/')
      ? teamName.split('/')[0] // Extract the first part before the first slash
      : teamName;
      if(encodedTeamName===""){
        encodedTeamName = "Demo"
      }
      const response = await axios.post('/vidzspaceApi/users/s3/createTeam', {
        teamName:`${encodedTeamName}'s Team`,
        user_id: userId,
      });
  
      if (response.status === 200) {
        console.log("Team created successfully:", response.data);
      } else {
        console.error("Error creating team:", response.data);
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      // Handle errors generically (e.g., display a generic error message)
      throw err; // Re-throw the error for handling in the calling component
    }
};

export const fetchTeamsData = async(path,user_id)=>{
  try{
    const response = await axios.get(`/vidzspaceApi/users/s3/fetchTeamsData`,{
      params:{
        requester_id: user_id,
        path:path
      }
    })
    console.log(response.data);
    return response.data
  }catch(err){
    console.log(err)
  }
}
