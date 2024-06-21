import React, { useContext } from "react";
import { FaPhotoVideo } from "react-icons/fa";
import HomeContext from "../../context/homePage/HomeContext";
import { TbCloudUpload } from "react-icons/tb";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { routePath, setPath, setPathEmpty, setProjectState } from "../../app/Actions/cmsAction";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ImFilesEmpty } from "react-icons/im";
import ProgressBar from "../../components/Project/ProgressBar";
import "../../styles/CSS/Scrollbar/projectScrollbar.css";

const TeamProjects = () => {
  const { teamPath, files, folders, path } = useContext(HomeContext);
  const display = path.split("/")
  const dispatch = useDispatch();
  const extractName = (filename) => {
    const match = filename.match(/-(\w+)\./);
    return match ? match[1] : filename;
  };
  const convertBytesToGB = (bytes) => {
    const gigabyte = 1024 * 1024 * 1024; // One gigabyte in bytes
    const convertedValue = bytes / gigabyte;
    return convertedValue.toFixed(2) + " GB"; // Format to two decimal places and add unit
  };
  const getDifferenceText = (pastTimeString) => {
    const currentDate = new Date()
    const timeDifference =
      currentDate.getTime() - new Date(pastTimeString).getTime();
    const millisecondsInSecond = 1000;
    const secondsInMinute = 60;
    const minutesInHour = 60;
    const hoursInDay = 24;

    const seconds = Math.floor(timeDifference / millisecondsInSecond);
    const minutes = Math.floor(seconds / secondsInMinute);
    const hours = Math.floor(minutes / minutesInHour);
    const days = Math.floor(hours / hoursInDay);

    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return "now";
    }
  };
  const handleRoute = async (file_path) => {
    dispatch(setPath(file_path));
  };
  const handleRouteClick = (display_path) => {
    console.log("route")
    dispatch(routePath(display_path));
  };
  return (
    <>
      <div className="flex flex-row w-full p-2 justify-between items-center">
        <div className="flex flex-row gap-3 items-center  justify-center text-[#9B9DA0]">
          <FaPhotoVideo />
          <p className="text-[#f8ff2a] cursor-pointer" onClick={()=>dispatch(setPathEmpty(""))}>
            {teamPath}
          </p>
          {display.map((part, index) => (
            <div
              key={index}
              onClick={() => handleRouteClick(display.slice(0, index + 1).join("/"))}
              className="flex flex-row gap-2"
            >
              {index < path.length - 1 && (
                <span className="separator">{" / "}</span>
              )}
              <div className="cursor-pointer">{part}</div>
            </div>
          ))}
        </div>
      </div>

      {files.length === 0 && folders.length === 0 && !path ? (
        <div className="h-full w-full flex justify-center items-center">
          <motion.div
            onClick={() => dispatch(setProjectState(true))}
            className="flex flex-col justify-center items-center text-[#9B9DA0] cursor-pointer hover:text-[#f8ff2a]"
          >
            <TbCloudUpload className="text-9xl" />
            <p>Create Your Project</p>
          </motion.div>
        </div>
      ) : (
        <div className="h-full w-full p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {folders?.map((folder, index) => (
              <div
                key={index}
                className="p-4 bg-[#35353a] rounded-lg text-white relative cursor-pointer"
                onClick={()=>handleRoute(folder.Key)}
              >
                <ProgressBar />
                <div className="flex flex-col gap-2 w-full px-2 rounded-md">
                  {folder?.innerFiles.length !== 0 ||
                  folder?.innerFolders.length !== 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 h-40 overflow-y-auto no-scrollbar">
                      {folder?.innerFiles &&
                        folder?.innerFiles.map((file, index) => (
                          <div className="rounded-lg" key={index}>
                            <video
                              className="rounded-lg object-cover aspect-square w-full"
                              key={index}
                              src={file?.SignedUrl}
                            ></video>
                          </div>
                        ))}
                      {folder?.innerFolders &&
                        folder.innerFolders.map((inFolder, index) => (
                          <div className="flex flex-col justify-start items-center gap-1">
                            <img
                              src="/icons/Folder.png"
                              alt="Folder"
                              className="h-20 w-24"
                            />
                            <p className="text-sm text-gray-200">
                              {inFolder.Key}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="h-40 w-full flex justify-center items-center">
                      <div className="flex flex-col justify-center items-center gap-3 text-gray-400">
                        <ImFilesEmpty className="text-5xl" />
                        <p>Empty Folder</p>
                      </div>
                    </div>
                  )}

                  {/* Meta data of the folder */}
                  <div className="flex flex-row items-center w-full ">
                    <div className="flex flex-col gap-1 w-[91%]">
                      <div className="flex flex-row gap-4 justify-start items-center">
                        <p className="text-xl font-bold">{folder.Key}</p>
                        <p>{convertBytesToGB(folder.size)}</p>
                      </div>
                      <div className="text-lg text-gray-400">
                        Mohit -{" "}
                        {folder.LastModified
                          ? getDifferenceText(folder.LastModified)
                          : "Unknown"}
                      </div>
                    </div>

                    <div className="flex justify-center items-center">
                      <BsThreeDotsVertical className="font-black text-3xl" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {files?.map((file, index) => (
              <div
                key={index}
                className="p-4 bg-[#35353a] rounded-lg text-white relative"
              >
                <ProgressBar/>
                <div className="flex flex-col h-full w-full gap-2">
                  <video
                    className="rounded-lg object-cover aspect-square w-full h-40"
                    key={index}
                    src={file?.SignedUrl}
                  ></video>
                  <div className="flex flex-row items-center w-full ">
                    <div className="flex flex-col gap-1 w-[91%]">
                      <div className="flex flex-row gap-4 justify-start items-center">
                        <p className="text-xl font-bold">
                          {extractName(file.Key)}
                        </p>
                        <p>{convertBytesToGB(file.Size)}</p>
                      </div>
                      <div className="text-lg text-gray-400">
                        Mohit -{" "}
                        {file.LastModified
                          ? getDifferenceText(file.LastModified)
                          : "Unknown"}
                      </div>
                    </div>

                    <div className="flex justify-center items-center">
                      <BsThreeDotsVertical className="font-black text-3xl" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TeamProjects;
