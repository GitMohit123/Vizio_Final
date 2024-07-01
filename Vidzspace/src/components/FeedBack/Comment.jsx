import React, { useContext, useState } from "react";
import ProjectContext from "../../context/project/ProjectContext";
import { FaCheck, FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaPencil } from "react-icons/fa6";
import { deleteComment, editComment, likeComment, updateProgress } from "../../api/Comments";
import HomeContext from "../../context/homePage/HomeContext";
const Comment = ({
  commentObject,
  replies,
  index,
  activeComments,
  setActiveComments,
}) => {
  const { load, setLoad, user } = useContext(HomeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(commentObject?.comment);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleCommentChange = (e) => {
    setEditedComment(e.target.value);
  };

  const handleCommentClick = (videoTime) => {
    const video = document.getElementById("myVideo");
    console.log("clicked");
    if (video) {
      video.currentTime = parseInt(videoTime); // Optional: play the video after setting the time
    }
  };
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
  const convertVideoTimeDisplay = (timeString) => {
    const seconds = parseInt(timeString);
    const mins = Math.floor(seconds / 60);
    const secondsInMins = seconds % 60;
    return `${mins}:${secondsInMins}`;
  };
  const handleEditComment = async (video_comment_id) => {
    handleEditClick();
    setLoad(true);
    try {
      const userId = user?.uid;
      const commentId = video_comment_id;
      const response = await editComment(userId, commentId, editedComment);
      const progressResponse = await updateProgress(userId,commentId,false);
      console.log(response,progressResponse);
      setLoad(false);
    } catch (err) {
      console.log("Error in editing comment", err);
      setLoad(false);
    }
  };
  const handleLike = async (video_comment_id, visibility) => {
    setLoad(true);
    try {
      const userId = user?.uid;
      const commentId = video_comment_id;
      const response = await likeComment(userId, commentId, visibility);
      console.log(response);
      setLoad(false);
    } catch (err) {
      console.log("Error in liking comment", err);
      setLoad(false);
    }
  };
  const handleProgress = async (video_comment_id, progress) => {
    setLoad(true);
    try {
      const userId = user?.uid;
      const commentId = video_comment_id;
      const response = await updateProgress(userId, commentId, progress);
      console.log(response);
      setLoad(false);
    } catch (err) {
      console.log("Error in progress comment", err);
      setLoad(false);
    }
  };

  const firstLetter = commentObject?.territory_id?.charAt(0).toUpperCase();
  const { getDifferenceTextFromTimestamp } = useContext(ProjectContext);
  return (
    <div key={index} className="flex flex-col w-full gap-1">
      <p>{convertVideoTimeDisplay(commentObject?.videoTime)}</p>
      <div
        onClick={() => handleCommentClick(commentObject?.videoTime)}
        className="cursor-pointer flex flex-col w-full bg-gray-800 h-fit p-3 rounded-lg gap-2 relative"
      >
        <div className="absolute -top-0 right-2 transform translate-x-1/2 -translate-y-1/2">
          {commentObject?.progress === true ? (
            <div onClick={() => handleProgress(commentObject?.video_comment_id, false)} className="w-4 h-4 bg-gray-700 border border-gray-600 flex items-center justify-center">
              <FaCheck className="text-green-500" />
            </div>
          ) : (
            <div onClick={() => handleProgress(commentObject?.video_comment_id, true)} className="w-4 h-4 bg-gray-700 border border-gray-600"></div>
          )}
        </div>
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
              <div
                onClick={() =>
                  handleLike(commentObject?.video_comment_id, true)
                }
              >
                <FaRegHeart />
              </div>
            ) : (
              <div
                onClick={() =>
                  handleLike(commentObject?.video_comment_id, false)
                }
              >
                <FaHeart className="text-red-600" />
              </div>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="flex w-full justify-start items-center px-10">
          {isEditing ? (
            <input
              type="text"
              value={editedComment}
              onChange={handleCommentChange}
              disabled={!isEditing}
              className={`px-1 bg-gray-700 rounded-md`}
            />
          ) : (
            <p className="px-1">{editedComment}</p>
          )}
        </div>

        <div className="flex flex-row justify-between items-center w-full px-2 pt-3">
          <p className="text-sm text-gray-400">Reply</p>
          <div className="flex flex-row gap-4 justify-center items-center">
            {/* <FaPencil className="cursor-pointer text-sm text-gray-400" /> */}
            {isEditing ? (
              <FaCheck
                onClick={() =>
                  handleEditComment(commentObject?.video_comment_id)
                }
                className="cursor-pointer text-sm text-gray-400"
              />
            ) : (
              <FaPencil
                onClick={handleEditClick}
                className="cursor-pointer text-sm text-gray-400"
              />
            )}
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
