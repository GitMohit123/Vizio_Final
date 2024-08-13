import React, { useState } from "react";
import Comment from "./Comment";
import { MdOutlineCommentsDisabled } from "react-icons/md";
import { FaPaintBrush } from "react-icons/fa";
import { useDrawing} from "../../context/drawing/DrawingContext"

const CommentSection = ({ backendComments }) => {
  const [activeComments, setActiveComments] = useState(null);
  const {showDrawing} = useDrawing();

  const rootComments = backendComments?.filter(
    (backendComment) => backendComment.reply_id === "null"
  );

  const getReplies = (selectedCommentId) => {
    const checkId = selectedCommentId.slice(-1);
    return backendComments
      ?.filter((comment) => comment.reply_id === checkId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  };

  return (
    <div className="px-3 flex w-full flex-col overflow-auto gap-4 h-full">
      <div className="flex flex-row gap-3 w-full justify-start items-center">
        <p className="text-xl">Comments</p>
        <p className="text-[#f8ff2a]">{backendComments?.length}</p>
      </div>

      {rootComments.length > 0 ? (
        rootComments
          .sort((a, b) => a.time - b.time)
          .map((commentObject, index) => {
            const hasDrawing = commentObject.drawings?.length > 0;
            const cleanedDrawing = hasDrawing
              ? commentObject.drawings.replace(/^\"|\"$/g, "")
              : null;

            return (
              <div key={commentObject.video_comment_id} className="flex items-center gap-2" >
                <Comment
                  commentObject={commentObject}
                  index={index}
                  replies={getReplies(commentObject.video_comment_id)}
                  activeComments={activeComments}
                  setActiveComments={setActiveComments}
                />
                {hasDrawing && (
                  <img
                  src="/images/paint-palette.png"
                  alt=""
                  onClick={() => showDrawing(cleanedDrawing)}
                  className={`w-10 h-7 cursor-pointer `}
                />
                )}
              </div>
            );
          })
      ) : (
        <div className="flex flex-col justify-center items-center mt-auto mb-auto gap-3">
          <MdOutlineCommentsDisabled className="text-5xl" />
          <p className="text-xl text-center text-gray-600 font-medium">
            No Comments Available
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
