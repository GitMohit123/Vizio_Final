import React, { useState } from "react";
import HomeContext from "./HomeContext";
import { useDispatch, useSelector } from "react-redux";
import {
  addTeamState,
  setCurrentTeam,
  renameTeamState,
} from "../../app/Actions/teamActions";
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
  const renameState = useSelector((state) => state.team.renameState);
  const optionState = useSelector((state) => state.team.optionState);
  const folders = useSelector((state) => state.cms.folders);
  const files = useSelector((state) => state.cms.files);
  const path = useSelector((state) => state.cms.path);

  //cms State
  const teamPath = useSelector((state) => state.cms.teamPath);
  const projectState = useSelector((state) => state.cms.projectState);
  //setting current team
  const handleTeamClick = (teamState) => {
    console.log(teamState);
    dispatch(setCurrentTeam(teamState));
    dispatch(setTeamPath(currentTeam.TeamName));
    dispatch(setPathEmpty(""));
  };
  //open team add popup
  const handleAddTeam = () => {
    dispatch(addTeamState(true));
  };

  const handleTeamRename = () => {
    dispatch(renameTeamState(true));
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
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTeamState, setDeleteTeamState] = useState(false);
  const [teamToRename, setTeamToRename] = useState("");
  const [owner_id, setOwner_id] = useState("");

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
    const currentTeamPath = currentTeam?.TeamName;
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
        owner_id,
        setOwner_id,
        load,
        setLoad,
        displayName,
        user,
        team,
        currentTeam,
        teamState,
        teamName,
        isOpenShare,
        searchQuery,
        teamToRename,
        setTeamToRename,
        setSearchQuery,
        setIsOpenShare,
        setIsShareCommentPopup,
        isShareCommentPopup,
        setTeamName,
        teamPath,
        handleTeamRename,
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
        renameState,
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
        deleteTeamState,
        setDeleteTeamState,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export default HomeState;
