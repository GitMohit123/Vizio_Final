import { useContext, useState } from "react";
import ProjectContext from "../../context/project/ProjectContext";
import HomeContext from "../../context/homePage/HomeContext";
import { IoIosTime } from "react-icons/io";
import { motion } from "framer-motion";
import { FaEraser, FaLocationArrow } from "react-icons/fa6";
import { GrPowerReset } from "react-icons/gr";
import { createComment } from "../../api/Comments";
import { FaPaintBrush } from "react-icons/fa";

const CommentForm = ({ file, toolMode, setToolMode, saveDrawing, clearCanvas, setColor }) => {
  const { user, load, setLoad } = useContext(HomeContext);
  const { videoTimeMin, videoTimeSec, getDifferenceText } = useContext(ProjectContext);
  const firstLetterCommenting = user?.name?.charAt(0).toUpperCase();
  const [text, setText] = useState("");
  const [isToolsVisible, setIsToolsVisible] = useState(false); // Toggle state for tool icons
  const isTextAreaDisabled = text.length === 0;

  const handleCreateComment = async () => {
    setLoad(true);
    try {
      const comment = text;
      const userId = user?.uid;
      const territory_id = user?.name;
      const videoName = file?.Key;
      const reply_id = "null";
      const videoTime = videoTimeMin * 60 + videoTimeSec;
      const response = await createComment(comment, userId, territory_id, videoName, reply_id, videoTime);
      console.log("Comment Created : Message from Frontend");
      console.log(response);
      setText("");
    } catch (err) {
      console.log("Unable to create Comment");
    } finally {
      setLoad(false);
    }
  };

  const handleSaveOrComment = () => {
    if (text) {
      handleCreateComment();
    } else {
      saveDrawing();
    }
  };

  const handleColorChange = (color) => {
    setColor(color);
    setToolMode('pencil'); // Ensure pencil mode is activated when changing color
  };

  return (
    <div className="bg-[#242426] w-full rounded-md px-2 py-2">
      <div className="flex flex-col gap-6 p-2">
        <div className="flex flex-row gap-3 items-center justify-start">
          <p className="text-sm text-gray-400">{file?.Metadata?.ownername}</p>
          <p className="text-sm text-gray-400">
            {getDifferenceText(file?.LastModified)}
          </p>
        </div>
        <div>
          <div className="flex gap-4 justify-center items-center">
            <div className="relative w-12 h-12">
              <img
                src="/icons/Profile.png"
                alt="User"
                className="w-full h-full rounded-full"
              />
              {firstLetterCommenting && (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-400 bg-opacity-75 rounded-full">
                  {firstLetterCommenting}
                </div>
              )}
            </div>
            <div className="bg-white w-full flex items-center gap-4 py-1 px-2 rounded-lg justify-center">
              <div className="flex px-1 py-[2px] rounded-lg justify-center items-center gap-2">
                <IoIosTime size={23} className="text-yellow-300" />
                <span className="text-blue-700 font-bold">{`${videoTimeMin}:${videoTimeSec}`}</span>
              </div>
              <input
                type="text"
                placeholder="Type your Comment"
                className="w-full bg-transparent border-none focus:outline-none text-gray-700"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex gap-4 justify-center">
                <FaPaintBrush
                  size={24}
                  onClick={() => setIsToolsVisible(!isToolsVisible)}
                  className={`cursor-pointer ${toolMode === 'pencil' ? 'text-blue-500' : 'text-blue-500'}`}
                />
                {isToolsVisible && (
                  <div className="flex gap-2">
                    <FaEraser
                      size={24}
                      onClick={() => setToolMode('eraser')}
                      className={`cursor-pointer ${toolMode === 'eraser' ? 'text-black' : 'text-blue-500'}`}
                    />
                    <div className="flex gap-2">
                      <div
                        className="h-6 w-6 bg-yellow-400 rounded-full cursor-pointer"
                        onClick={() => handleColorChange('yellow')}
                      />
                      <div
                        className="h-6 w-6 bg-blue-400 rounded-full cursor-pointer"
                        onClick={() => handleColorChange('blue')}
                      />
                      <div
                        className="h-6 w-6 bg-red-400 rounded-full cursor-pointer"
                        onClick={() => handleColorChange('red')}
                      />
                    </div>
                    <GrPowerReset onClick={clearCanvas} size={25} color="blue" />
                  </div>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.2 }}
                className={`${
                  isTextAreaDisabled ? "bg-gray-400" : "bg-blue-400"
                } text-white rounded-md px-4 py-2 transition duration-150 ease-in-out`}
                disabled={load}
                onClick={handleSaveOrComment}
              >
                <FaLocationArrow />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
