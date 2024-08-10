import React, { useCallback, useContext, useRef, useState } from "react";
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
import { IoPerson } from "react-icons/io5";
import { useEffect } from "react";
import {
  deleteVideo,
  deleteVideoFolder,
  download,
  fetchTeamsData,
  copyObject,
  getUploadPresignedUrl,
} from "../../api/s3Objects";
import Rename from "../../components/PopUp/Rename";
import ProjectContext from "../../context/project/ProjectContext";
import SidebarComponent from "../../components/Project/SidebarComponent";
import axios from "axios";
import _ from "lodash";

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
    selectedFiles,
    selectedFolders,
    setSelectedFolders,
    setSelectedFiles,
    searchQuery,
    setSearchQuery,
    setIsOpenShare,
  } = useContext(HomeContext);
  const {
    deletePopup,
    setDeletePopup,
    deletedFiles,
    setDeletedFiles,
    getDifferenceText,
    addPopUp,
    setAddPopUp,
    setAddFolder,
    isPastingObject,
    setIsPastingObject,
    copiedObject,
    setCopiedObject,
    extractName,
    convertBytesToGB,
    setSelectedFilesWithUrls,
    selectedFilesWithUrls,
    setIsUploadingProgressOpen,
    setVideoPercentageUploaded,
    setIsUploadingFiles,
  } = useContext(ProjectContext);
  const display = path.split("/");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchData = async (query = "") => {
    const currentTeamPath = currentTeam;
    try {
      const userId = user?.uid;
      const response = await fetchTeamsData(
        `${userId}/${currentTeamPath}/${path}`,
        userId
      );
      let filesData = response?.files || [];
      let folderData = response?.folders || [];

      if (query != "") {
        filesData = filesData.filter((file) =>
          file.Key.toLowerCase().startsWith(query.toLowerCase())
        );
        folderData = folderData.filter((folder) =>
          folder.Key.toLowerCase().startsWith(query.toLowerCase())
        );
      }
      dispatch(setCMSData(filesData, folderData));
    } catch (err) {
      console.log("Unable to fetch data");
    }
  };

  const debounceFetchData = useCallback(
    _.debounce((query) => fetchData(query), 1000)
  );

  useEffect(() => {
    debounceFetchData(searchQuery);
  }, [searchQuery]);

  const handlePasteObject = async () => {
    setLoad(true);
    setIsPastingObject(false);
    const ownerId = user?.uid; //for testing only
    console.log("pasting object at: ", ownerId + "/" + teamPath + "/" + path);
    try {
      const response = await copyObject({
        srcKey: copiedObject?.key,
        destPath: `${ownerId}/${teamPath}/${path}`,
        type: copiedObject?.type,
        user_id: user?.uid,
      });
      console.log(response);
      await fetchData();
      setLoad(false);
      setCopiedObject({});
    } catch (error) {
      console.log("error during pasting: ", error);
    }
  };
  const handleCopy = ({ name, type }) => {
    const ownerId = user?.uid; //for testing only
    const fullSrcKey =
      ownerId + "/" + teamPath + "/" + (path ? path + "/" : "") + name;
    console.log("fullsrcpath: ", fullSrcKey);
    setCopiedObject({ key: fullSrcKey, type: type });
    setIsPastingObject(true);
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

  const handleThreeDotFileClick = (option_passed, file, index) => {
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
      setIsOpenShare((prev) => !prev);
      closeSidebar();
    }
    if (option_passed === "Copy") {
      handleCopy({ name: file?.Key, type: "file" });
      closeSidebar();
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
      handleCopy({ name: folder?.Key, type: "folder" });
      closeSidebar();
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
    // handleMouseLeave();
    setTimeout(() => {
      setVideoContainer(false);
    }, 2000);
  };

  const handleNewFolderClick = () => {
    console.log("clicked");
    setAddFolder((prev) => !prev);
    // setAddPopUp(false);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log(files);
    setSelectedFiles((prev) => [...prev, ...files]);
    setIsUploadingProgressOpen(true);
    const uploadPromises = files.map(async (file) => {
      try {
        const id = Date.now();
        const fileName = `video_${id}_${file.name}`;
        const contentType = file.type;
        const user_id = user?.uid;
        const fullPath = `${user_id}/${teamPath}/${path}`;
        //
        const result = await getUploadPresignedUrl({
          fileName,
          contentType,
          user_id,
          fullPath,
        });
        console.log(result.url);
        return { file, presignedUrl: result.url };
      } catch (error) {
        console.log("Error uploading file", error);
        return null;
      }
    });
    try {
      const validFilesWithUrls = (await Promise.all(uploadPromises)).filter(
        (fileWithUrl) => fileWithUrl !== null
      );
      console.log("va;lid", validFilesWithUrls);
      const filesWithUrls = [...validFilesWithUrls, ...selectedFilesWithUrls];
      setSelectedFilesWithUrls((prevSelectedFiles) => [
        ...prevSelectedFiles,
        ...validFilesWithUrls,
      ]);
      console.log("All files uploaded successfully");
      uploadFile(filesWithUrls);
    } catch (error) {
      console.log("Error uploading files", error);
    }
  };
  const uploadToPresignedUrl = async (
    //direct api call
    presignedUrl,
    file
  ) => {
    console.log("in apii: ", presignedUrl, file);
    // Upload file to pre-signed URL
    const uploadResponse = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": "video/mp4",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
        setVideoPercentageUploaded(percentCompleted);
      },
    });
    return uploadResponse.status;
  };
  const uploadFile = async (filesWithUrls) => {
    const sharing = "none";
    const sharing_type = "none";
    const sharing_with = [];
    const progress = "Upcoming";
    for (let i = 0; i < filesWithUrls.length; i++) {
      const { file, presignedUrl } = filesWithUrls[i];
      setSelectedFilesWithUrls((files) => {
        files[i].isUploading = true;
        return files;
      });
      try {
        const data = await uploadToPresignedUrl(presignedUrl, file);
        console.log("File uploaded successfully", data);
        setSelectedFilesWithUrls((files) => {
          files[i].isUploading = false;
          return files;
        });
      } catch (error) {
        console.log("Error uploading file", file.name, error);
        // Handle error if required
      }
    }
    if (!selectedFilesWithUrls) {
      console.log("Files not found");
    }
    setIsUploadingFiles(false);
    setLoad(false);
    setIsUploadingProgressOpen(false);
    setSelectedFilesWithUrls([]);
    setSelectedFiles([]);
    setVideoPercentageUploaded(0);
    setAddPopUp(false);
    await fetchData();
  };
  const handleFolderChange = async (e) => {
    console.log(e.target.files);
    const listedFiles = Array.from(e.target.files);
    setIsUploadingProgressOpen(true);
    setSelectedFiles(listedFiles);
    const user_id = user?.uid;
    const firstFilePath = listedFiles[0].webkitRelativePath;
    const folderName = firstFilePath.split("/")[0];

    await getUploadPresignedUrl({
      fullPath: `${user_id}/${teamPath}/${path}/${folderName}`,
    });
    const uploadPromises = listedFiles.map(async (file) => {
      const id = Date.now();
      const fileName = `video_${id}_${file.name}`;
      const contentType = file.type;
      const fullPath = `${user_id}/${teamPath}/${path}/${file?.webkitRelativePath?.substring(
        0,
        file?.webkitRelativePath.lastIndexOf("/")
      )}`;
      console.log("fup", fullPath);
      try {
        const result = await getUploadPresignedUrl({
          fileName,
          contentType,
          user_id,
          fullPath,
        });
        console.log(result.url);
        return {
          file,
          presignedUrl: result.url,
          lastModified: file.lastModified,
        };
      } catch (error) {
        console.log("Error uploading file", error);
        return null;
      }
    });
    //
    try {
      const validFilesWithUrls = (await Promise.all(uploadPromises)).filter(
        (fileWithUrl) => fileWithUrl !== null
      );
      const filesWithUrls = [...validFilesWithUrls, ...selectedFilesWithUrls];
      setSelectedFilesWithUrls((prevSelectedFolder) => [
        ...prevSelectedFolder,
        ...validFilesWithUrls,
      ]);
      console.log("All files uploaded successfully");
      console.log("fileswithurl", filesWithUrls);
      uploadFile(filesWithUrls);
    } catch (error) {
      console.log("Error uploading files", error);
    }
  };

  const popupRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setAddPopUp(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [addPopUp]);

  const isMetaDataJson = (folders) => {
    return folders?.some((folder) =>
      folder.innerFiles.some((file) => file.Key.endsWith("metadata.json"))
    );
  };
  console.log(isMetaDataJson(folders));

  const displayFileName = (file)=>{
    if(file.length>8){
      return file.substring(0,8)+".mp4";
    }
    return file;
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
          <div className="flex flex-row gap-3 justify-center items-center">
            {isPastingObject && (
              <div
                className="bg-[#f8ff2a] text-black rounded-xl p-1 px-4 z-20 cursor-pointer"
                onClick={() => handlePasteObject()}
              >
                Paste
              </div>
            )}
            {path !== "" && (
              <div className="flex justify-center items-center px-2 gap-3">
                <motion.button className="p-1 px-4 rounded-xl text-black bg-[#f8ff2a] relative">
                  <div
                    className="flex flex-row w-full justify-center items-center gap-2"
                    onClick={() => setAddPopUp((prev) => !prev)}
                  >
                    <FaPlus />
                    <p className="cursor-pointer">Add</p>
                  </div>
                  {addPopUp && (
                    <div
                      ref={popupRef}
                      className="dropdown absolute w-36 top-10 -right-8 bg-white rounded-lg shadow-lg z-20"
                    >
                      {/* Dropdown content */}
                      <ul className="py-1">
                        <li
                          onClick={handleNewFolderClick}
                          className="cursor-pointer text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Create Folder
                        </li>
                        <li className="cursor-pointer text-left px-4 py-2 hover:bg-gray-100">
                          <label>
                            Upload Files
                            <input
                              type="file"
                              name="upload-video"
                              accept="video/*"
                              onChange={handleFileChange}
                              className="hidden"
                              multiple
                            />
                          </label>
                        </li>
                        <li className="cursor-pointer text-left px-4 py-2 hover:bg-gray-100">
                          <label>
                            Upload Folder
                            <input
                              type="file"
                              webkitdirectory="true"
                              mozdirectory="true"
                              directory=""
                              multiple
                              onChange={handleFolderChange}
                              className="hidden"
                            />
                          </label>
                        </li>
                      </ul>
                    </div>
                  )}
                </motion.button>
              </div>
            )}
          </div>
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
        <div
          className={`h-full w-full p-4 ${
            isPastingObject ? "filter brightness-75" : ""
          }`}
        >
          {(files?.length === 0 && folders?.length === 0 && path !== "") ||
          (files?.length === 1 && !isMetaDataJson(folders)) ? (
            <div className="w-full h-full justify-center items-center flex">
              <div className="flex flex-col justify-center items-center gap-3 text-gray-400">
                <ImFilesEmpty className="text-5xl" />
                <p>Empty Folder</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {folders?.map((folder, index) => (
                <div
                  key={index}
                  className={`p-4 bg-[#35353a] rounded-lg text-white relative cursor-pointer ${
                    path == "" ? "backdrop-blur-3xl" : ""
                  }`}
                >
                  <ProgressBar document={folder} />
                  <div className="flex flex-col gap-2 w-full px-2 rounded-md">
                    {(folder?.innerFiles.length !== 0 ||
                      folder?.innerFolders.length !== 0) &&
                    folder?.innerFiles.length !== 1 ? (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 h-40 overflow-y-auto no-scrollbar"
                        key={folder.Key}
                        onClick={() => handleRoute(folder.Key)}
                      >
                        {folder?.innerFiles &&
                          folder?.innerFiles
                            ?.filter((file) => !file?.Key.endsWith(".json"))
                            .map((file, index) => (
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
                                className="lg:h-16 md:h-16 h-16 lg:w-20 md:w-20 w-20"
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
                    <div className="flex flex-col items-center w-full gap-1">
                      <div className="flex w-full">
                        <div className="flex flex-row gap-4 justify-start items-center">
                          <p className="text-xl font-bold">{folder.Key}</p>
                          <p className="text-[#f8ff2ad1] text-base">
                            {convertBytesToGB(folder.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-between w-full">
                        <div className="text-base text-gray-400 flex flex-col gap-1 w-full justify-center items-start">
                          <div className="flex flex-row items-center gap-2">
                            <IoPerson className="text-[#f8ff2a]"/>
                          <p>{folder?.Metadata?.ownername}</p>
                          </div>
                          <p className="text-[#f8ff2ac7]">{folder.LastModified
                            ? getDifferenceText(folder.LastModified)
                            : "Unknown"}</p>
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
                              <SidebarComponent
                                folderfile={folder}
                                closeSidebar={closeSidebar}
                                handleThreeDotClick={handleThreeDotFolderClick}
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {files
                ?.filter((file) => !file.Key.endsWith(".json"))
                .map((file, index) => (
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
                          muted
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
                      <div className="flex flex-col items-center w-full gap-1">
                      <div className="flex w-full">
                        <div className="flex flex-row gap-4 justify-start items-center">
                          <p className="text-xl font-bold">{displayFileName(file?.Key)}</p>
                          <p className="text-[#f8ff2ad1] text-base">
                            {convertBytesToGB(file?.Size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-between w-full">
                        <div className="text-base text-gray-400 flex flex-col gap-1 w-full justify-center items-start">
                          <div className="flex flex-row items-center gap-2">
                            <IoPerson className="text-[#f8ff2a]"/>
                          <p>{file?.Metadata?.ownername}</p>
                          </div>
                          <p className="text-[#f8ff2ac7]">{file?.LastModified
                            ? getDifferenceText(file?.LastModified)
                            : "Unknown"}</p>
                        </div>
                        <div className="flex justify-center items-center relative">
                          <BsThreeDotsVertical
                            onClick={() => {
                              setSelectedItem({
                                type: "file",
                                index: `file-${index}`,
                                path: file?.Key,
                              });
                            }}
                            className="font-black text-3xl cursor-pointer"
                          />
                          {selectedItem?.type === "file" &&
                            selectedItem?.index === `file-${index}` &&
                            selectedItem?.path === file?.Key && (
                              <SidebarComponent
                                folderfile={file}
                                closeSidebar={closeSidebar}
                                handleThreeDotClick={handleThreeDotFolderClick}
                              />
                            )}
                        </div>
                      </div>
                    </div>
                    </motion.div>

                    {videoPreview === index && videoContainer && (
                      <VideoContainer url={file?.SignedUrl} index={index} />
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TeamProjects;
