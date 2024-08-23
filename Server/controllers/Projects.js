import { addProjectOperation, getProjectsByTeamId } from "../database/projects.js";

export const addProject = async (req, res, next) => {
  const { TeamId,OwnerId, ProjectName,OwnerName,nestedFiles,nestedFolders } = req.body;
  console.log(nestedFiles,nestedFolders)
  try {
    const project = {
      TeamId: TeamId, // Sort Key
      OwnerId: OwnerId, // Owner's ID
      ProjectName: ProjectName, // Project's name
      Progress: "Upcoming",
      OwnerName:OwnerName,
      nestedFiles:nestedFiles,
      nestedFolders:nestedFolders
    };
    await addProjectOperation(project);
    return res.send({
      success: true,
      message: "Project created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request",
      error: err.message,
    });
  }
};

export const retrieveProjects = async(req,res,next)=>{
    const {TeamId} = req.params;
    try{
    const response = await getProjectsByTeamId(TeamId);
    res.send(response);
    }catch(err){
        console.log(err);
    }
} 
