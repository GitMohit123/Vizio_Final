import { addProjectOperation } from "../database/projects.js";

export const addProject = async (req, res, next) => {
  const { TeamId,OwnerId, ProjectName,OwnerName } = req.body;
  try {
    const project = {
      TeamId: TeamId, // Sort Key
      OwnerId: OwnerId, // Owner's ID
      ProjectName: ProjectName, // Project's name
      Progress: "Upcoming",
      OwnerName:OwnerName
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
