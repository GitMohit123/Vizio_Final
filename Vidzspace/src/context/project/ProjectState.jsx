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
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return "now";
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
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectState;
