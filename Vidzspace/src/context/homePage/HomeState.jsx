import React, { useState } from "react";
import HomeContext from "./HomeContext";
import { useDispatch, useSelector } from "react-redux";
import { addTeamState, setCurrentTeam } from "../../app/Actions/teamActions";
import {
  setCMSData,
  setPath,
  setPathEmpty,
  setTeamPath,
} from "../../app/Actions/cmsAction";
import {
  deleteVideo,
  deleteVideoFolder,
  fetchTeamsData,
} from "../../api/s3Objects";

const HomeState = ({ children }) => {
  // user state
  const user = useSelector((state) => state.user.info);

  //team state

  const team = useSelector((state) => state.team.info);
  const currentTeam = useSelector((state) => state.team.currentTeam);
  const teamState = useSelector((state) => state.team.teamState);
  const optionState = useSelector((state) => state.team.optionState);
  const folders = useSelector((state) => state.cms.folders);
  const files = useSelector((state) => state.cms.files);
  const path = useSelector((state) => state.cms.path);

  //cms State
  const teamPath = useSelector((state) => state.cms.teamPath);
  const projectState = useSelector((state) => state.cms.projectState);
  //setting current team
  const handleTeamClick = (currentTeamName) => {
    dispatch(setCurrentTeam(currentTeamName));
    dispatch(setTeamPath(currentTeam));
    dispatch(setPathEmpty(""));
  };
  //open team add popup
  const handleAddTeam = () => {
    dispatch(addTeamState(true));
  };

  //profile team dropdown
  const handleDropDownClick = () => {
    console.log("Drop down clicked ");
    setIsTeamDropDownOpen((prev) => !prev);
  };

  //diplay team Name
  const displayName = (teamName) => {
    const firstLetter = teamName.charAt(0);
    const nameDisplayed = `${firstLetter} T`;
    return nameDisplayed;
  };

  const [isOpenVisibility, setIsOpenVisibility] = useState(false);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();
  const [teamName, setTeamName] = useState("");
  const [isShareCommentPopup, setIsShareCommentPopup] = useState(false);
  const [isOpenShare, setIsOpenShare] = useState(false);
  const [isTeamDropDownOpen, setIsTeamDropDownOpen] = useState(false);
  const [videoContainer, setVideoContainer] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  const [load, setLoad] = useState(false);
  const [reName, setReName] = useState("");
  const [renamePopup, setRenamePopup] = useState(false);
  const [itemToRename, setItemToRename] = useState({});

  const [selectedItem, setSelectedItem] = useState({});
  const handleDelete = (url) => {
    setLoad(true);
    setSelectedItem(null);
    deleteVideo(url)
      .then(async (data) => {
        console.log(data);
        await fetchData();
        setLoad(false);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      });
  };

  const handleDeleteFolder = (folderKey) => {
    const userId = user?.uid;
    console.log(userId, folderKey);
    setSelectedItem(null);
    setLoad(true);
    deleteVideoFolder(folderKey, userId, teamPath, path)
      .then(async (data) => {
        console.log(data);

        await fetchData();
        setLoad(false);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      });
  };
  const fetchData = async () => {
    const currentTeamPath = currentTeam;
    console.log(currentTeamPath);
    try {
      const userId = user?.uid;
      const response = await fetchTeamsData(
        `${userId}/${currentTeamPath}/${path}`,
        userId
      );
      const filesData = response?.files || [];
      const folderData = response?.folders || [];
      console.log(filesData, folderData);
      dispatch(setCMSData(filesData, folderData));
    } catch (err) {
      console.log("Unable to fetch data");
    }
  };

  return (
    <HomeContext.Provider
      value={{
        itemToRename,
        setItemToRename,
        renamePopup,
        setRenamePopup,
        reName,
        setReName,
        load,
        setLoad,
        displayName,
        user,
        team,
        currentTeam,
        teamState,
        teamName,
        isOpenShare,
        setIsOpenShare,
        setIsShareCommentPopup,
        isShareCommentPopup,
        setTeamName,
        teamPath,
        handleTeamClick,
        handleAddTeam,
        handleDropDownClick,
        optionState,
        projectState,
        isOpenVisibility,
        setIsOpenVisibility,
        isUploadDropdownOpen,
        setIsUploadDropdownOpen,
        selectedFiles,
        setSelectedFiles,
        selectedFolders,
        setSelectedFolders,
        isDragging,
        setIsDragging,
        isTeamDropDownOpen,
        setIsTeamDropDownOpen,
        files,
        folders,
        path,
        videoContainer,
        setVideoContainer,
        videoPreview,
        setVideoPreview,
        selectedItem,
        setSelectedItem,
        handleDelete,
        handleDeleteFolder,
        fetchData,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export default HomeState;
