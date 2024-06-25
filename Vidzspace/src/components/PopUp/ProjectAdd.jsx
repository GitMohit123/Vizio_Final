import React, { useCallback, useContext, useEffect } from "react";
import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { TbCloudUpload } from "react-icons/tb";
import { cloudOptions } from "../../constants/homePage";
import { setProjectState } from "../../app/Actions/cmsAction";
import { useDropzone } from "react-dropzone";
import HomeContext from "../../context/homePage/HomeContext";
import useDrivePicker from "react-google-drive-picker";
import ProjectContext from "../../context/project/ProjectContext";
import axios from "axios";
import { getUploadPresignedUrl } from "../../api/s3Objects";

const ProjectAdd = () => {
  const dispatch = useDispatch();
  const {
    isOpenVisibility,
    setIsOpenVisibility,
    isUploadDropdownOpen,
    setIsUploadDropdownOpen,
    setSelectedFiles,
    selectedFiles,
    selectedFolders,
    setSelectedFolders,
    isDragging,
    setIsDragging,
    teamPath,
    path,
    user,
    setLoad,
  } = useContext(HomeContext);
  const {
    setIsUploadingProgressOpen,
    setIsUploadingFiles,
    selectedFilesWithUrls,
    setSelectedFilesWithUrls,
    projectName,
    setProjectName,
  } = useContext(ProjectContext);

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
      },
    });
    return uploadResponse.status;
  };

  const [openPicker, authResponse] = useDrivePicker();

  const handleOpenPicker = () => {
    openPicker({
      clientId:
        "112355236362-jv377gl5mau1ucsf0mghe9h96tfcefj3.apps.googleusercontent.com",
      developerKey: "AIzaSyB2FDWk9GwFLGsGsFrnpCvh2nzByI73W8o",
      viewId: "DOCS",
      // token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === "cancel") {
          console.log("User clicked cancel/close button");
        }
        console.log(data.docs);
      },
    });
  };

  const handleCloudOptionClick = (cloudName) => {
    if (cloudName === "Google Drive") {
      handleOpenPicker();
    } else {
      openOneDrivePicker();
    }
  };

  const toggleDropdown = () => {
    setIsOpenVisibility(!isOpenVisibility);
  };
  const handleCancelClick = () => {
    dispatch(setProjectState(false));
    setIsUploadingProgressOpen(false);
    setSelectedFiles([]);
    setSelectedFolders([]);
  };

  const toggleFilesDropdown = () => {
    setIsUploadDropdownOpen(!isUploadDropdownOpen);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const filesList = [];
    const foldersList = [];

    acceptedFiles.forEach((file) => {
      console.log("path", file.path);
      if (file.path && file.path.includes("/")) {
        foldersList.push(file);
      } else {
        filesList.push(file);
      }
    });

    const videoFiles = filesList.filter((file) =>
      file.type.startsWith("video/")
    );
    const folderFiles = foldersList.filter((file) =>
      file.type.startsWith("video/")
    );
    setSelectedFiles((prevFiles) => [...prevFiles, ...videoFiles]);
    setSelectedFolders((prevFolders) => [...prevFolders, ...folderFiles]);
    setIsDragging(false);
  }, []);

  const {
    getRootProps,
    getInputProps: getFilesInputProps,
    open: openFilesPicker,
  } = useDropzone({
    onDrop,
    accept: "video/*",
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const { getInputProps: getFoldersInputProps, open: openFoldersPicker } =
    useDropzone({
      onDrop,
      accept: "video/*",
      multiple: true,
      noClick: true,
      noKeyboard: true,
      webkitdirectory: true,
      onDragEnter: () => setIsDragging(true),
      onDragLeave: () => setIsDragging(false),
    });

  // files to add using one drive
  const clientId = "5835f2c3-7c48-4ba8-8b72-a95e71c04d46";
  const redirectUri = "http://localhost:3000";

  const openOneDrivePicker = () => {
    const odOptions = {
      clientId: clientId,
      action: "query", // or "download" to download the file directly
      multiSelect: false,
      advanced: {
        redirectUri: redirectUri,
        filter: ".docx,.pptx,.xlsx,.txt,.pdf,.jpg,.png", // Example filter for specific file types
      },
      success: (files) => {
        console.log("Files selected:", files);
        // Handle the selected files here
      },
      cancel: () => {
        console.log("User canceled the picker.");
      },
      error: (error) => {
        console.error("Error picking files:", error);
      },
    };

    OneDrive.open(odOptions);
  };

  const handleCreateProjectClick = async () => {
    dispatch(setProjectState(false));
    setIsUploadingFiles(true);
    setLoad(true);

    const ownerId = user?.uid; //for testing only
    // const response = await generate(`${ownerId}/${teamPath}/${path}`)
    const files =
      selectedFiles.length > 0
        ? [...selectedFiles, ...selectedFolders]
        : selectedFolders;
    const uploadPromises = files.map(async (file) => {
      const id = Date.now();
      const videoFileName = `video_${id}_${file.name}`;
      const contentType = file.type;
      const isInAFolder = file.path && file.path.includes("/");
      const fullPath = isInAFolder
        ? `${ownerId}/${teamPath}/${projectName}/${file.path.slice(
            1,
            file.name.length * -1 - 1
          )}`
        : `${ownerId}/${teamPath}/${projectName}`;
      // const fullPath = `${ownerId}/${teamPath}/${path}/${projectName}`; //if want nested projects
      try {
        const result = await getUploadPresignedUrl(
          videoFileName,
          contentType,
          ownerId,
          fullPath
        );
        console.log(result.url);
        return { file, presignedUrl: result.url, isUploading: false };
      } catch (error) {
        console.log("Error generating urls", error);
        return null;
      }
    });

    // Wait for all uploads to finish
    try {
      const validFilesWithUrls = (await Promise.all(uploadPromises)).filter(
        (fileWithUrl) => fileWithUrl !== null
      );
      const filesWithUrls = [...validFilesWithUrls, ...selectedFilesWithUrls];
      setSelectedFilesWithUrls((prevSelectedFiles) => [
        ...prevSelectedFiles,
        ...validFilesWithUrls,
      ]);
      console.log("All files url generated successfully");
      uploadFile(filesWithUrls);
    } catch (error) {
      console.log("Error generating urls", error);
    }
  };
  const uploadFile = async (filesWithUrls) => {
    console.log("hi");
    const sharing = "none";
    const sharing_type = "none";
    const sharing_with = [];
    const progress = "upcoming";
    for (let i = 0; i < filesWithUrls.length; i++) {
      const { file, presignedUrl } = filesWithUrls[i];
      setSelectedFilesWithUrls((files) => {
        files[i].isUploading = true;
        return files;
      });

      try {
        const data = await uploadToPresignedUrl(presignedUrl, file);
        // toast.success("Uploaded successful");
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
    // dispatch(setLoader(false));
    setLoad(false);
    setIsUploadingProgressOpen(false);
    setSelectedFilesWithUrls([]);
    setSelectedFiles([])
    setSelectedFolders([])
    // setRefresh((prev) => !prev);
  };

  useEffect(() => {
    if (selectedFiles.length > 0 || selectedFolders.length > 0) {
      setIsUploadingProgressOpen(true);
    } else setIsUploadingProgressOpen(false);
    console.log(selectedFiles, selectedFolders);
  }, [selectedFiles, selectedFolders]);

  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-10 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div className="popup bg-[#383838] w-3/6 h-3/5 p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]">
        {/* Title Section */}
        <div className="flex w-full px-2 mb-8">
          <p className="text-white text-3xl font-bold">Create New Project</p>
        </div>
        {/* Input Section */}
        <div className="flex flex-row gap-8 px-3 w-full mb-7">
          <div className="flex flex-col gap-3 w-[60%] text-white">
            <p>Project Name</p>
            <input
              type="text"
              className="bg-black border-2 border-white rounded-md p-1 "
              onChange={(e)=>{setProjectName(e.target.value)}}
            />
          </div>
          <div className="flex flex-col gap-3 w-[40%] text-white">
            <p>Visibility</p>
            <div
              onClick={toggleDropdown}
              className="flex w-full relative flex-row justify-between items-center p-1 bg-black border-2 border-white rounded-md pl-3 cursor-pointer"
            >
              <p>Select Members</p>
              <MdOutlineKeyboardArrowDown />
              {isOpenVisibility && (
                <ul className="absolute top-full left-0 w-full bg-black shadow-md rounded-md overflow-hidden z-10 cursor-pointer border-2 border-white">
                  {/* List items for dropdown options */}
                  <li className="block px-4 py-2 text-sm  hover:bg-[#2f2f2f]">
                    Member 1
                  </li>
                  <li className="block px-4 py-2 text-sm  hover:bg-[#2f2f2f]">
                    Member 2
                  </li>
                  <li className="block px-4 py-2 text-sm  hover:bg-[#2f2f2f]">
                    Member 3
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Drop Down files section */}
        <div className="flex flex-row w-full px-3 mb-5 gap-6 justify-center items-center">
          <motion.div
            {...getRootProps()}
            className="flex p-3 py-5 bg-[#3c3b3b] w-full justify-center items-center rounded-md border-2 border-white border-dashed text-white"
            animate={
              isDragging
                ? { scale: 1.05, z: -10, borderColor: "#f8ff2a" }
                : { scale: 1, y: 0 }
            }
          >
            <div className="flex flex-row gap-3 items-center justify-center">
              <TbCloudUpload className="text-3xl" />
              <p>Drop files here to Upload </p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex w-[25%] relative text-[#f8ff2a] underline font-bold cursor-pointer mr-4"
            onClick={toggleFilesDropdown}
          >
            Browse
            {isUploadDropdownOpen && (
              <ul className="absolute top-full left-0 w-full bg-black shadow-md rounded-md overflow-hidden z-10 cursor-pointer">
                <li
                  onClick={openFilesPicker}
                  className="block px-1 py-2 text-sm  hover:bg-[#2f2f2f]"
                >
                  Upload Files
                </li>
                <li
                  onClick={openFoldersPicker}
                  className="block px-1 py-2 text-sm  hover:bg-[#2f2f2f]"
                >
                  Upload Folders
                </li>
              </ul>
            )}
            <input
              {...getFilesInputProps()}
              type="file"
              accept="video/*"
              multiple
              style={{ display: "none" }}
            />
            <input
              {...getFoldersInputProps()}
              type="file"
              accept="video/*"
              multiple
              webkitdirectory="true"
              style={{ display: "none" }}
            />
          </motion.div>
        </div>

        {/* Import from cloud */}
        <div className="flex flex-col gap-3 w-full px-3 text-white text-lg font-bold mb-8">
          <p>Import from cloud</p>
          <div className="w-full flex flex-row py-4 px-10 gap-3 bg-[#4d4b4b] justify-evenly items-center rounded-md">
            {cloudOptions.map((option, index) => {
              return (
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="cursor-pointer"
                  key={index}
                  onClick={() => handleCloudOptionClick(option.label)}
                >
                  <img
                    src={option.icon}
                    alt={option.label}
                    className="h-14 w-16"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-row justify-end items-center px-2 gap-3">
          <motion.div
            className="p-2 px-6 bg-[#8c8c8c] rounded-xl cursor-pointer hover:bg-[#747373] text-white"
            onClick={handleCancelClick}
          >
            Cancel
          </motion.div>
          <motion.button
            // onClick={handleCreateTeamClick}
            onClick={handleCreateProjectClick}
            className={`p-2 px-6 rounded-xl bg-[#f8ff2a]`}
          >
            Create
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAdd;
