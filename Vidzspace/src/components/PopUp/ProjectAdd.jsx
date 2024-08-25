import React, { useCallback, useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { TbCloudUpload } from "react-icons/tb";
import { cloudOptions } from "../../constants/homePage";
import {
  setCMSData,
  setProjects,
  setProjectState,
} from "../../app/Actions/cmsAction";
import { useDropzone } from "react-dropzone";
import HomeContext from "../../context/homePage/HomeContext";
import useDrivePicker from "react-google-drive-picker";
import ProjectContext from "../../context/project/ProjectContext";
import axios from "axios";
import {
  createItem,
  createProject,
  fetchTeamsData,
  getUploadPresignedUrl,
} from "../../api/s3Objects";
import { loadGapiInsideDOM } from "gapi-script";
import { useGoogleLogin } from "@react-oauth/google";
import { v4 as uuidv4 } from "uuid";

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
    currentTeam,
    projectState,
  } = useContext(HomeContext);
  const {
    setIsUploadingProgressOpen,
    setIsUploadingFiles,
    selectedFilesWithUrls,
    setSelectedFilesWithUrls,
    projectName,
    setProjectName,
    setVideoPercentageUploaded,
  } = useContext(ProjectContext);

  //////////////////////////////////////// Google Drive Api ////////////////////////////////////////////////////////////
  const [openPicker, authResponse] = useDrivePicker();
  const loadGapiInsideDOM = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const handleOpenPicker = async () => {
    try {
      await loadGapiInsideDOM();
      const clientId =
        "112355236362-jv377gl5mau1ucsf0mghe9h96tfcefj3.apps.googleusercontent.com";
      const apiKey = "AIzaSyB2FDWk9GwFLGsGsFrnpCvh2nzByI73W8o";
      const scope = "https://www.googleapis.com/auth/drive.readonly";
      const ownerId = user?.uid;
      const userId = user?.uid;
      window.gapi.load("client:picker", async () => {
        try {
          await window.gapi.client.init({
            apiKey: apiKey,
          });

          await window.gapi.client.load("drive", "v3");

          const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: scope,
            callback: (tokenResponse) => {
              const picker = new window.google.picker.PickerBuilder()
                .addView(
                  new window.google.picker.DocsView()
                    .setIncludeFolders(true)
                    .setMimeTypes(
                      "video/mp4,video/webm,video/ogg,video/quicktime"
                    )
                    .setSelectFolderEnabled(false)
                )
                .setOAuthToken(tokenResponse.access_token)
                .setDeveloperKey(apiKey)
                .setCallback(async (data) => {
                  if (
                    data[window.google.picker.Response.ACTION] ===
                    window.google.picker.Action.PICKED
                  ) {
                    const selectedDocs =
                      data[window.google.picker.Response.DOCUMENTS];

                    if (
                      Array.isArray(selectedDocs) &&
                      selectedDocs.length > 0
                    ) {
                      const videoFiles = [];

                      for (const doc of selectedDocs) {
                        try {
                          const response = await fetch(
                            `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
                            {
                              headers: {
                                Authorization: `Bearer ${tokenResponse.access_token}`,
                              },
                            }
                          );

                          const blob = await response.blob();
                          const file = new File([blob], doc.name, {
                            type: blob.type || doc.mimeType,
                            lastModified: new Date(doc.lastEditedUtc).getTime(),
                          });
                          videoFiles.push(file);
                        } catch (error) {
                          console.error(
                            `Error downloading file ${doc.name}:`,
                            error
                          );
                        }
                      }
                      setSelectedFiles((prev) => [...prev, ...videoFiles]);
                      console.log("Downloaded video files:", videoFiles);
                    } else {
                      console.error(
                        "No documents selected or documents array is empty"
                      );
                    }
                  } else {
                    console.error("Action was not PICKED");
                  }
                })
                .build();
              picker.setVisible(true);
            },
          });

          tokenClient.requestAccessToken();
        } catch (error) {
          console.error("Error initializing gapi client:", error);
        }
      });
    } catch (error) {
      console.error("Error loading GAPI script:", error);
    }
  };

  /////////////////////////////////////// Dropzone /////////////////////////////////////////////////////////////
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
    setSelectedFiles((prevFiles) => [
      ...prevFiles,
      ...videoFiles,
      ...folderFiles,
    ]);
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

  ////////////////////////////////////////////// Button Click //////////////////////////////////////////////////
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

  const handleCloudOptionClick = (cloudName) => {
    if (cloudName === "Google Drive") {
      handleOpenPicker();
    } else {
      openOneDrivePicker();
    }
  };

  ////////////////////////////////////////////////// Project Creation api ////////////////////////////////////////////////////////////

  const handleCreateProjectClick = async () => {
    dispatch(setProjectState(false));
    setIsUploadingFiles(true);
    setLoad(true);
    const ownerId = user?.uid; //for testing only
    const user_id = user?.uid;
    const files = selectedFiles;
    await getUploadPresignedUrl({
      fullPath: `${ownerId}/${teamPath}/${projectName}`,
    });

    var folderName = "";
    const createFoldersPromises = selectedFolders.map(async (folder) => {
      var folderName1 = folder.path.split("/")[1];
      console.log(folderName1);
      if (folderName1 !== folderName) {
        folderName = folderName1;
        await getUploadPresignedUrl({
          fullPath: `${ownerId}/${teamPath}/${projectName}/${folderName}`,
        });
      }
    });
    await Promise.all(createFoldersPromises);

    const uploadPromises = files.map(async (file) => {
      const id = Date.now();
      const fileName = `video_${id}_${file.name}`;
      const contentType = file.type;
      const isInAFolder = file.path && file.path.includes("/");
      const fullPath = isInAFolder
        ? `${ownerId}/${teamPath}/${projectName}/${file.path.slice(
            1,
            file.name.length * -1 - 1
          )}`
        : `${ownerId}/${teamPath}/${projectName}`;
      try {
        const metadataUrlResult = await getUploadPresignedUrl({
          fileName: "metadata.json",
          contentType: "application/json",
          user_id,
          fullPath: `${fullPath}`,
        });
        const metadata = {
          fullPath,
          createdAt: new Date().toISOString(),
          sharing: "none",
          sharing_type: "none",
          progress: "Upcoming",
        };
        await uploadToPresignedUrl(
          metadataUrlResult.url,
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        const result = await getUploadPresignedUrl({
          fileName,
          contentType,
          user_id,
          fullPath,
        });
        return { file, presignedUrl: result.url, isUploading: false };
      } catch (error) {
        console.log("Error generating urls", error);
        return null;
      }
    });
    try {
      const validFilesWithUrls = (await Promise.all(uploadPromises)).filter(
        (fileWithUrl) => fileWithUrl !== null
      );
      const filesWithUrls = [...validFilesWithUrls, ...selectedFilesWithUrls];
      setSelectedFilesWithUrls((prevSelectedFiles) => [
        ...prevSelectedFiles,
        ...validFilesWithUrls,
      ]);
      // console.log("All files url generated successfully");
      uploadFile(filesWithUrls);
    } catch (error) {
      console.log("Error generating urls", error);
    }
  };
  const uploadToPresignedUrl = async (presignedUrl, file) => {
    const uploadResponse = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file?.type,
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
    const filesArray = transformFileArray(filesWithUrls);
    const folderArray = transformFileNames(selectedFolders);
    const teamID = currentTeam?.TeamId;
    const user_id = user?.uid;
    const user_name = user?.name;
    const projectId = uuidv4();
    await createProject(
      projectId,
      teamID,
      user_id,
      projectName,
      user_name,
      filesArray,
      folderArray
    );
    for (let i = 0; i < filesWithUrls.length; i++) {
      const { file, presignedUrl } = filesWithUrls[i];

      setSelectedFilesWithUrls((files) => {
        files[i].isUploading = true;
        return files;
      });

      try {
        const data = await uploadToPresignedUrl(presignedUrl, file);
        if (file instanceof File) {
          await createItem(
            projectId,
            file?.name,
            file?.size,
            presignedUrl,
            file?.path || file?.name
          );
        }
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
    setSelectedFiles([]);
    setSelectedFolders([]);
    setVideoPercentageUploaded(0);
    await fetchData();
    // setRefresh((prev) => !prev);
  };

  //////////////////////////////////////////////// Display names /////////////////////////////////////////////////////////////
  const transformFileArray = (files) => {
    return files.map(({ file, presignedUrl }) => {
      // Create a URL object
      const url = new URL(presignedUrl);
      // Extract the pathname (base URL without query parameters)
      const baseUrl = url.origin + url.pathname;
      return {
        file: file.name,
        signedUrl: baseUrl,
      };
    });
  };
  const transformFileNames = (files) => {
    return files.map(({ name }) => ({
      folder: name,
    }));
  };
  const fetchData = async () => {
    const TeamId = currentTeam?.TeamId;
    try {
      const response = await fetchTeamsData(TeamId);
      dispatch(setProjects(response));
    } catch (err) {
      console.log("Unable to fetch data");
    }
  };

  useEffect(() => {
    if (selectedFiles.length > 0 || selectedFolders.length > 0) {
      setIsUploadingProgressOpen(true);
    } else setIsUploadingProgressOpen(false);
    console.log(selectedFiles, selectedFolders, selectedFilesWithUrls);
  }, [selectedFiles, selectedFolders, selectedFilesWithUrls]);

  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-30 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div className="popup bg-[#383838] w-3/6 h-auto p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]">
        {/* Title Section */}
        <div className="flex w-full px-2 mb-4">
          <p className="text-white text-3xl font-bold">Create New Project</p>
        </div>
        {/* Input Section */}
        <div className="flex flex-row gap-8 px-3 w-full mb-4">
          <div className="flex flex-col gap-3 w-[60%] text-white">
            <p>Project Name</p>
            <input
              type="text"
              className="bg-black border-2 border-white rounded-md p-1 "
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
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
        <div className="flex flex-col gap-3 w-full px-3 text-white text-lg font-bold mb-4">
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
