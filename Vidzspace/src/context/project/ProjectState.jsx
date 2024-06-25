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
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectState;
