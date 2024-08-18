import { addTeam, deleteTeamOperation, getTeamsByOwnerID } from "../database/teamOperations.js";

export const addTeamDetail = async (teamDetails) => {
  const TeamName = teamDetails.TeamName;
  const OwnerId = teamDetails.OwnerId;
  const OwnerName = teamDetails.OwnerName;
  try {
    const teamDetails = {
      OwnerId: OwnerId, // Sort Key
      TeamName: TeamName, // Team's name
      OwnerName: OwnerName, // Owner's name
    };
    // console.log(teamDetails);
    await addTeam(teamDetails);
  } catch (err) {
    console.log(err);
  }
};

export const fetchTeam = async(req,res,next)=>{
  const {OwnerId} = req.params;
  try{
    const response = await getTeamsByOwnerID(OwnerId);
    return res.send({response:response});
  }catch(err){
    console.log(err);
  }
}

export const deleteTeam1 = async(req,res,next)=>{
  const {teamId,ownerId} = req.params;
  try{
    const response = await deleteTeamOperation(teamId,ownerId);
    return res.send({message:"Team deleted successfully"});
  }catch(err){
    console.log(err);
  }
}