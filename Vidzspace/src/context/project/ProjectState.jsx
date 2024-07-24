import React, { useState } from "react";
import ProjectContext from "./ProjectContext";

const ProjectState = ({ children }) => {
  const [isUploadingProgressOpen, setIsUploadingProgressOpen] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [selectedFilesWithUrls, setSelectedFilesWithUrls] = useState([]);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [currUploadingFile, setCurrUploadingFile] = useState(null);
  const [deletePopup, setDeletePopup] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState({});
  const [videoPercentageUploaded, setVideoPercentageUploaded] = useState(0);
  const [addPopUp, setAddPopUp] = useState(false);
  const [addFolder,setAddFolder] = useState(false);
  const [newFolderName,setNewFolderName] = useState("");
  const getDifferenceText = (pastTimeString) => {
    const currentDate = new Date();
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
      if(days===1){
        return `${days} day ago`;
      }else{
        return `${days} days ago`;
      }
    } else if (hours > 0) {
      if(hours===1){
        return `${hours} hour ago`;
      }else{
        return `${hours} hours ago`;
      }
    } else if (minutes > 0) {
      return `${minutes} mins ago`;
    } else {
      return "now";
    }
  };
  const getDifferenceTextFromTimestamp = (pastTimestamp) => {
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - pastTimestamp;
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
      if(hours===1){
        return `${hours} hour ago`;
      }
      else{
        return `${hours} hours ago`;
      }
    } else if (minutes > 0) {
      return `${minutes} mins ago`;
    } else {
      return "now";
    }
  };
  const [isPastingObject, setIsPastingObject] = useState(false);
  const [copiedObject, setCopiedObject] = useState({});
  const [videoTimeSec, setVideoTimeSec] = useState(0);
  const [videoTimeMin, setVideoTimeMin] = useState(0);
  const extractName = (filename) => {
    const match = filename?.match(/.*_(.+)$/);
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

  return (
    <ProjectContext.Provider
      value={{
        isUploadingProgressOpen,
        setIsUploadingProgressOpen,
        isUploadingFiles,
        setIsUploadingFiles,
        selectedFilesWithUrls,
        setSelectedFilesWithUrls,
        projectName,
        setProjectName,
        currUploadingFile,
        setCurrUploadingFile,
        deletePopup,
        setDeletePopup,
        deletedFiles,
        setDeletedFiles,
        videoPercentageUploaded,
        setVideoPercentageUploaded,
        getDifferenceText,
        addPopUp,
        setAddPopUp,
        addFolder,
        setAddFolder,
        newFolderName,
        setNewFolderName,
        isPastingObject,
        setIsPastingObject,
        copiedObject,
        setCopiedObject,
        getDifferenceTextFromTimestamp,
        videoTimeMin,
        videoTimeSec,
        setVideoTimeMin,
        setVideoTimeSec,
        extractName,
        convertBytesToGB
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectState;
