import React, { useCallback, useContext } from "react";
import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { TbCloudUpload } from "react-icons/tb";
import { cloudOptions } from "../../constants/homePage";
import { setProjectState } from "../../app/Actions/cmsAction";
import { useDropzone } from "react-dropzone";
import HomeContext from "../../context/homePage/HomeContext";
import useDrivePicker from 'react-google-drive-picker'

const ProjectAdd = () => {
  const dispatch = useDispatch();
  const {
    isOpenVisibility,
    setIsOpenVisibility,
    isUploadDropdownOpen,
    setIsUploadDropdownOpen,
    setSelectedFiles,
    setSelectedFolders,
    isDragging,
    setIsDragging,
  } = useContext(HomeContext);
  const [openPicker, authResponse] = useDrivePicker(); 

  const handleOpenPicker = () => {
    openPicker({
      clientId: "112355236362-jv377gl5mau1ucsf0mghe9h96tfcefj3.apps.googleusercontent.com",
      developerKey: "AIzaSyB2FDWk9GwFLGsGsFrnpCvh2nzByI73W8o",
      viewId: "DOCS",
      // token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }
        console.log(data.docs)
      },
    })
  }

  const handleCloudOptionClick = (cloudName) => {
    if (cloudName === "Google Drive") {
      handleOpenPicker()
    } else {
      console.log("One Drive");
    }
  };
  
  const toggleDropdown = () => {
    setIsOpenVisibility(!isOpenVisibility);
  };
  const handleCancelClick = () => {
    dispatch(setProjectState(false));
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

  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-2 bg-opacity-10 bg-[#2f2f2f]">
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
            className="p-2 px-6 bg-[#3c3b3b] rounded-xl cursor-pointer hover:bg-[#747373] text-white font-bold border-2 border-[#f8ff2a]"
            onClick={handleCancelClick}
          >
            Cancel
          </motion.div>
          <motion.button
            // onClick={handleCreateTeamClick}
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
