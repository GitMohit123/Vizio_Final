import React, { useContext } from "react";
import HomeContext from "../../context/homePage/HomeContext";
import ProjectContext from "../../context/project/ProjectContext";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const UploadProgress = () => {
  const {
    setSelectedFiles,
    setSelectedFolders,
    selectedFiles,
    selectedFolders,
  } = useContext(HomeContext);

  const {
    selectedFilesWithUrls,
    setSelectedFilesWithUrls,
    videoPercentageUploaded,
  } = useContext(ProjectContext);

  return (
    <div className="absolute w-1/5 max-h-[167.2px] flex justify-end items-end z-20 right-5 bottom-5">
      <div className="popup bg-[#383838] h-full max-h-[167.2px] overflow-auto no-scrollbar w-full p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c] text-white">
        <h3 className="text-lg text-center w-full">Uploading files</h3>
        {selectedFiles?.map((file, index) => (
          <div
            key={index}
            className="flex flex-row gap-3 items-center justify-between py-1"
          >
            <p className="text-sm truncate max-w-[75%]">{file.path}</p>
            {
              //  isUploadingFiles?
              selectedFilesWithUrls.length >= index &&
              selectedFilesWithUrls[index]?.isUploading === true ? (
                <div className="w-6 h-6 text-md">
                  <CircularProgressbar
                    value={videoPercentageUploaded}
                    text={`${videoPercentageUploaded}%`}
                    styles={buildStyles({
                      // textSize: '20px',
                      pathTransition: "none",
                    })}
                  />
                </div>
              ) : (
                <p
                  onClick={() => {
                    setSelectedFiles((currFiles) =>
                      currFiles.filter(
                        (currFile) =>
                          currFile.path !== file.path ||
                          currFile.size !== file.size
                      )
                    );
                  }}
                  className="cursor-pointer"
                >
                  x
                </p>
              )
            }
          </div>
        ))}
        {/* {selectedFolders?.map((folder, index) => (
                  <div
                    key={index}
                    className="flex flex-row gap-3 items-center justify-between py-1"
                  >
                    <p className="text-sm truncate max-w-[75%]">{folder.name}</p>
                    {
                    //  isUploadingFiles?
                    selectedFilesWithUrls.length>=index + selectedFiles.length && selectedFilesWithUrls[index + selectedFiles.length]?.isUploading===true?
                     <div className="w-6 h-6 rounded-full animate-spin border border-solid border-yellow-500 border-t-transparent shadow-md"></div>
                    :
                     <p onClick={()=>{setSelectedFolders((currFiles)=>currFiles.filter((currFile)=>currFile.path !== file.path || currFile.size !== file.size))}} className="cursor-pointer">
                      x</p>
                    }
                  </div>
        ))} */}
      </div>
    </div>
  );
};

export default UploadProgress;
