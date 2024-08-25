import { addItemOperation } from "../database/filesOperation.js";

export const createItem = async (req, res, next) => {
  const { ProjectId, ItemName, Size, PresignedUrl, FilePath } = req.body;
  try {
    const item = {
      ProjectId:ProjectId,
      ItemName:ItemName,
      Size:Size,
      SignedUrl:PresignedUrl,
      Progress:"Upcoming",
      FilePath:FilePath || ItemName
    };
    await addItemOperation(item);
    console.log("addded file")
    return res.send({
      success: true,
      message: "Item created successfully",
    });
  } catch (err) {
    res.send({
        message:"Failed to create an item in db"
    })
  }
};
