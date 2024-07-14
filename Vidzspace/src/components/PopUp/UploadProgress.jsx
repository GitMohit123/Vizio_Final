import React, { useContext } from "react";
import HomeContext from "../../context/homePage/HomeContext";
import ProjectContext from "../../context/project/ProjectContext";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ImCross } from "react-icons/im";
import { FaFolder, FaPhotoVideo } from "react-icons/fa";

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

  const getFolderName = (path) => {
    const parts = path.split("/");
    if (parts.length > 1) {
      return parts.slice(0, -1);
    }
    return path;
  };

  return (
    <div className="absolute w-1/5 max-h-[167.2px] flex flex-col justify-end items-end z-30 right-5 bottom-5 rounded-lg">
      <h3 className="text-lg w-full text-black bg-gray-200 p-2 rounded-tr-lg px-3 rounded-tl-lg">
        Uploading files
      </h3>
      <div className="bg-white popup h-full max-h-[167.2px] overflow-auto no-scrollbar w-full flex flex-col text-black p-2 px-3 rounded-b-lg gap-2">
        {selectedFiles?.map((file, index) => (
          <div
            key={index}
            className="flex flex-row gap-3 items-center justify-between py-1"
          >
            <div className="flex flex-row gap-2 justify-center items-start">
              {file?.path && file.path.includes("/") ? (
                <>
                  <FaFolder />
                  <p className="text-sm truncate max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis">
                    {getFolderName(file.path)}
                  </p>
                </>
              ) : (
                <>
                  <FaPhotoVideo />
                  <p className="text-sm truncate max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis">
                    {file.path}
                  </p>
                </>
              )}
            </div>
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
                      pathColor: videoPercentageUploaded < 50 ? "red" : "black", // Change path color based on percentage
                      textColor: "black", // Text color
                      trailColor: "gray", // Trail color
                      backgroundColor: "blue", // Background color
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
                  <ImCross className="text-xs" />
                </p>
              )
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgress;
