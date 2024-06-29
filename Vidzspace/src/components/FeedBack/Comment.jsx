import React, { useContext } from "react";
import ProjectContext from "../../context/project/ProjectContext";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaPencil } from "react-icons/fa6";
import { deleteComment } from "../../api/Comments";
import HomeContext from "../../context/homePage/HomeContext";
const Comment = ({ commentObject, replies, index,activeComments,setActiveComments }) => {
    const {load,setLoad,user} = useContext(HomeContext);
  const handleDeleteComment = async (video_comment_id) => {
    setLoad(true);
    try {
      const userId = user?.uid;
      const response = await deleteComment(userId, video_comment_id);
      console.log(response);
      setLoad(false);
    } catch (err) {
      console.log("Comment Not deleted", err);
    }
  };
  const convertVideoTimeDisplay = (timeString)=>{
    const seconds = parseInt(timeString);
    const mins = Math.floor(seconds/60);
    const secondsInMins = seconds%60;
    return `${mins}:${secondsInMins}`
  }

  const firstLetter = commentObject?.territory_id?.charAt(0).toUpperCase();
  const { getDifferenceTextFromTimestamp } = useContext(ProjectContext);
  return (
    <div key={index} className="flex flex-col w-full gap-1">
      <p>{convertVideoTimeDisplay(commentObject?.videoTime)}</p>
      <div className="flex flex-col w-full bg-gray-800 h-fit p-3 rounded-md gap-2">
        {/* Subheading */}
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center justify-center">
            <div className="relative w-8 h-8">
              <img
                src="/icons/Profile.png"
                alt="User"
                className="w-full h-full rounded-full"
              />
              {firstLetter && (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-400 bg-opacity-75 rounded-full">
                  {firstLetter}
                </div>
              )}
            </div>
            <p>{commentObject?.territory_id}</p>
          </div>

          <div className="flex flex-row gap-3 items-center justify-center">
            <p className="text-sm text-gray-400">
              {getDifferenceTextFromTimestamp(commentObject?.timestamp)}
            </p>
            {commentObject?.visibility === false ? (
              <FaRegHeart />
            ) : (
              <FaHeart className="text-red-600" />
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="flex w-full justify-start items-center px-10">
          <p className="px-1">{commentObject?.comment}</p>
        </div>

        <div className="flex flex-row justify-between items-center w-full px-2 pt-3">
          <p className="text-sm text-gray-400">Reply</p>
          <div className="flex flex-row gap-4 justify-center items-center">
            <FaPencil className="cursor-pointer text-sm text-gray-400" />
            <MdDelete
              onClick={() =>
                handleDeleteComment(commentObject?.video_comment_id)
              }
              className="cursor-pointer text-sm text-gray-400"
            />
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-10 my-1">
          {replies.map((reply, index) => (
            <Comment
              commentObject={reply}
              replies={[]}
              //   currentUserId={currentUserId}
              //   activeComments={activeComments}
              //   setActiveComments={setActiveComments}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
