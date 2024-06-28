import React, { useContext, useRef, useState } from "react";
import { FaPhotoVideo, FaPlus } from "react-icons/fa";
import HomeContext from "../../context/homePage/HomeContext";
import { TbCloudUpload } from "react-icons/tb";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import {
  routePath,
  setCMSData,
  setPath,
  setPathEmpty,
  setProjectState,
} from "../../app/Actions/cmsAction";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ImFilesEmpty } from "react-icons/im";
import ProgressBar from "../../components/Project/ProgressBar";
import "../../styles/CSS/Scrollbar/projectScrollbar.css";
import CMSLoader from "../../components/CMSLoader";
import { useNavigate } from "react-router-dom";
import { threeDotsMenuList } from "../../constants/projectsPage";
import VideoContainer from "../../components/Project/VideoContainer";
import {
  deleteVideo,
  deleteVideoFolder,
  download,
  fetchTeamsData,
} from "../../api/s3Objects";
import Rename from "../../components/PopUp/Rename";
import ProjectContext from "../../context/project/ProjectContext";

const TeamProjects = () => {
  const {
    teamPath,
    files,
    folders,
    path,
    videoPreview,
    setVideoPreview,
    videoContainer,
    setVideoContainer,
    user,
    itemToRename,
    setItemToRename,
    renamePopup,
    setRenamePopup,
    reName,
    setReName,
    load,
    setLoad,
    currentTeam,
    selectedItem,
    setSelectedItem,
    handleDelete,
    handleDeleteFolder,
  } = useContext(HomeContext);
  const {
    deletePopup,
    setDeletePopup,
    deletedFiles,
    setDeletedFiles,
    getDifferenceText,
    addPopUp,setAddPopUp,
    setAddFolder
  } = useContext(ProjectContext);
  const display = path.split("/");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const extractName = (filename) => {
    const match = filename.match(/.*_(.+)$/);
    return match ? match[1] : filename;
  };
  const convertBytesToGB = (bytes) => {
    const megabyte = 1024 * 1024;
    const gigabyte = 1024 * 1024 * 1024;
    const convertedGB = bytes / gigabyte;

    if (convertedGB < 0.1) {
      const convertedMB = bytes / megabyte;
      return convertedMB.toFixed(2) + " MB";
    } else {
      return convertedGB.toFixed(2) + " GB";
    }
  };
  const handleRoute = async (file_path) => {
    setLoad(true);
    dispatch(setPath(file_path));
    setTimeout(() => {
      setLoad(false);
    }, 1000);
  };
  const handleRouteClick = (display_path) => {
    console.log("route");
    setLoad(true);
    dispatch(routePath(display_path));
    setTimeout(() => {
      setLoad(false);
    }, 1000);
  };
  const handleVideoDoubleClick = () => {
    navigate("/feedback");
  };

  const handleMouseEnter = (e) => {
    e.target.play();
  };

  const handleMouseLeave = (e) => {
    e.target.pause();
    e.target.currentTime = 0;
  };

  const closeSidebar = () => {
    setSelectedItem(null);
  };

  const handleThreeDotClick = (option_passed, file, index) => {
    if (option_passed === "Delete") {
      // handleDelete(file?.SignedUrl);
      // setSelectedItem(null);
      setDeletePopup(true);
      setDeletedFiles(file);
      closeSidebar();
    }
    if (option_passed === "Rename") {
      closeSidebar();
      setRenamePopup(true);
      setItemToRename({
        type: "file",
        index: `file-${index}`,
        path: path,
        name: file?.Key,
      });
    }
    if (option_passed === "Share") {
    }
    if (option_passed === "Copy") {
    }
    if (option_passed === "Download") {
      handleDownload(path, file?.Key, "file");
    }
  };
  const handleThreeDotFolderClick = (option_passed, folder, index) => {
    if (option_passed === "Delete") {
      // handleDeleteFolder(folder?.Key);
      // setSelectedItem(null);
      closeSidebar();
      setDeletePopup(true);
      setDeletedFiles(folder);
    }
    if (option_passed === "Rename") {
      closeSidebar();
      setRenamePopup(true);
      setItemToRename({
        type: "folder",
        index: `folder-${index}`,
        path: path,
        name: folder?.Key,
      });
    }
    if (option_passed === "Share") {
    }
    if (option_passed === "Copy") {
    }
    if (option_passed === "Download") {
      handleDownload(path, folder?.Key, "folder");
    }
  };

  const handleDownload = (filePath, fileName, type) => {
    const userId = user?.uid;
    setSelectedItem(null);
    setLoad(true);
    download(filePath, teamPath, userId, fileName, type)
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoad(false);
      });
  };

  const handleDoubleClick = (file) => {
    navigate("/feedback", { state: { file: file } });
    setTimeout(() => {
      setVideoContainer(false);
    }, 2000);
  };

  const handleNewFolderClick =()=>{
    console.log("clicked")
    setAddFolder((prev)=>!prev);
    // setAddPopUp(false);
  }

  return (
    <>
      <div className="flex flex-row w-full p-2 justify-between items-center">
        <div className="flex flex-row gap-3 items-center justify-between text-[#9B9DA0] w-full">
          <div className="flex flex-row gap-3 justify-center items-center">
            <FaPhotoVideo />
            <p
              className="text-[#f8ff2a] cursor-pointer"
              onClick={() => dispatch(setPathEmpty(""))}
            >
              {teamPath}
            </p>
            {display.map((part, index) => (
              <div
                key={index}
                onClick={() =>
                  handleRouteClick(display.slice(0, index + 1).join("/"))
                }
                className="flex flex-row gap-2"
              >
                {index < path.length - 1 && (
                  <span className="separator">{" / "}</span>
                )}
                <div className="cursor-pointer">{part}</div>
              </div>
            ))}
          </div>
          {path!=="" && (
            <div className="flex justify-center items-center px-2 gap-3">
            <motion.button
              className={`p-1 px-4 rounded-xl text-black bg-[#f8ff2a]`}
            >
              <div className="flex relative flex-row w-full justify-center items-center gap-2" onClick={()=>setAddPopUp((prev)=>!prev)}>
                <FaPlus />
                <p className="cursor-pointer" >
                  Add
                </p>

                {addPopUp && (
                  <div className="dropdown absolute w-36 top-10 bg-white rounded-lg shadow-lg z-20">
                    {/* Dropdown content */}
                    <ul className="py-1">
                      <li onClick={handleNewFolderClick} className="cursor-pointer text-left px-4 py-2 hover:bg-gray-100">
                        Create Folder
                      </li>
                      <li className="cursor-pointer text-left px-4 py-2 hover:bg-gray-100">
                        Upload Files
                      </li>
                      <li className="cursor-pointer text-left px-4 py-2 hover:bg-gray-100">
                        Upload Folder
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </motion.button>
          </div>
          )}
        </div>
      </div>
      {load && <CMSLoader />}
      {renamePopup && <Rename />}
      {files?.length === 0 && folders?.length === 0 && !path ? (
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
              >
                <ProgressBar document={folder} />
                <div className="flex flex-col gap-2 w-full px-2 rounded-md">
                  {folder?.innerFiles.length !== 0 ||
                  folder?.innerFolders.length !== 0 ? (
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 h-40 overflow-y-auto no-scrollbar"
                      key={folder.Key}
                      onClick={() => handleRoute(folder.Key)}
                    >
                      {folder?.innerFiles &&
                        folder?.innerFiles.map((file, index) => (
                          <div className="rounded-lg" key={file?.SignedUrl}>
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
                    <div
                      className="h-40 w-full flex justify-center items-center"
                      onClick={() => handleRoute(folder.Key)}
                    >
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

                    <div className="flex justify-center items-center relative">
                      <BsThreeDotsVertical
                        onClick={() => {
                          setSelectedItem({
                            type: "folder",
                            index: `folder-${index}`,
                            path: folder.Key,
                          });
                        }}
                        className="font-black text-3xl cursor-pointer"
                      />
                      {selectedItem?.type === "folder" &&
                        selectedItem?.index === `folder-${index}` &&
                        selectedItem?.path === folder?.Key && (
                          <div className="absolute left-2 top-10 h-50 bg-gray-900 z-30 py-1 rounded-xl">
                            <div className="flex flex-col text-left">
                              <p
                                className="text-[#f8ff2a] hover:bg-slate-800 py-1 px-6 rounded-xl"
                                onClick={closeSidebar}
                              >
                                Close
                              </p>
                              {threeDotsMenuList.map((option, index) => {
                                return (
                                  <p
                                    onClick={() =>
                                      handleThreeDotFolderClick(
                                        option.option,
                                        folder,
                                        index
                                      )
                                    }
                                    className="text-white hover:bg-slate-800 py-1 px-6 rounded-xl"
                                  >
                                    {option.option}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {files?.map((file, index) => (
              <div
                key={index}
                className="p-4 bg-[#35353a] rounded-lg text-white relative cursor-pointer"
                onDoubleClick={() => {
                  console.log("DOUBLE");
                  handleDoubleClick(file);
                }}
              >
                <ProgressBar document={file} />
                <motion.div className="flex flex-col h-full w-full gap-2">
                  <motion.div whileHover={{ scale: 1.03 }}>
                    <video
                      className="rounded-lg object-cover aspect-square w-full h-40"
                      key={index}
                      src={file?.SignedUrl}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        setVideoPreview(index);
                        setTimeout(() => {
                          setVideoContainer(true);
                        }, 1000);
                      }}
                    ></video>
                  </motion.div>
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

                    <div className="flex justify-center items-center relative">
                      <BsThreeDotsVertical
                        onClick={() => {
                          setSelectedItem({
                            type: "file",
                            index: `file-${index}`,
                            path: file.Key,
                          });
                        }}
                        className="font-black text-3xl cursor-pointer"
                      />
                      {selectedItem?.type === "file" &&
                        selectedItem?.index === `file-${index}` &&
                        selectedItem?.path === file.Key && (
                          <div className="absolute left-2 top-10 h-50 bg-gray-900 z-30 py-1 rounded-xl">
                            <div className="flex flex-col text-left">
                              <p
                                className="text-[#f8ff2a] hover:bg-slate-800 py-1 px-6 rounded-xl"
                                onClick={closeSidebar}
                              >
                                Close
                              </p>
                              {threeDotsMenuList.map((option, index) => {
                                return (
                                  <p
                                    onClick={() =>
                                      handleThreeDotClick(
                                        option.option,
                                        file,
                                        index
                                      )
                                    }
                                    className="text-white hover:bg-slate-800 py-1 px-6 rounded-xl"
                                  >
                                    {option.option}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </motion.div>

                {videoPreview === index && videoContainer && (
                  <VideoContainer url={file?.SignedUrl} index={index} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TeamProjects;
