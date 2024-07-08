import React, { useContext, useEffect, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { teamProjectsInfoList } from "../../constants/homePage";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  createTeam,
  fetchTeamsData,
  listTeams,
  copyObject,
} from "../../api/s3Objects";
import { CgProfile } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  addTeamState,
  setCurrentTeam,
  setOptionState,
  setTeams,
} from "../../app/Actions/teamActions";
import { Route, Routes, useNavigate } from "react-router-dom";
import HomeContext from "../../context/homePage/HomeContext";
import { FaPlus } from "react-icons/fa";
import TeamAdd from "../../components/PopUp/TeamAdd";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import {
  setCMSData,
  setProjectState,
  setTeamPath,
} from "../../app/Actions/cmsAction";
import TeamProjects from "./TeamProjects";
import TeamInfo from "./TeamInfo";
import UpgradePlan from "./UpgradePlan";
import ProjectAdd from "../../components/PopUp/ProjectAdd";
import FirebaseContext from "../../context/firebase/FirebaseContext";
import ProjectContext from "../../context/project/ProjectContext";
import UploadProgress from "../../components/PopUp/UploadProgress";
import Delete from "../../components/PopUp/Delete";
import FolderAdd from "../../components/PopUp/FolderAdd";

const Homepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    displayName,
    user,
    team,
    currentTeam,
    teamState,
    teamPath,
    handleTeamClick,
    handleAddTeam,
    handleDropDownClick,
    optionState,
    projectState,
    isTeamDropDownOpen,
    setIsTeamDropDownOpen,
    path,
    load,
  } = useContext(HomeContext);
  const {
    isUploadingProgressOpen,
    deletePopup,
    addFolder,
    isPastingObject,
    setIsPastingObject,
    copiedObject,
    setCopiedObject,
  } = useContext(ProjectContext);

  const { handleSignOut } = useContext(FirebaseContext);
  // console.log(path)

  useEffect(() => {
    if (team) {
      if (currentTeam) {
        dispatch(setCurrentTeam(currentTeam));
      } else {
        dispatch(setCurrentTeam(team[0]));
      }
    }
  }, [team]);

  useEffect(() => {
    const currentTeamPath = currentTeam;
    const fetchData = async () => {
      try {
        const userId = user?.uid;
        const response = await fetchTeamsData(
          `${userId}/${currentTeamPath}/${path}`,
          userId
        );
        const filesData = response?.files;
        const folderData = response?.folders;
        dispatch(setCMSData(filesData, folderData));
      } catch (err) {
        console.log("Unable to fetch data");
      }
    };
    fetchData();
  }, [currentTeam, user, path]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (user) {
        try {
          const userId = user?.uid;
          listTeams(userId).then(async (data) => {
            console.log(!data);
            if (!data) {
              try {
                const userName = user?.name;
                await createTeam(userName, userId).then(() => {
                  fetchTeams();
                  console.log("added");
                });
                // handleCancelClick();
              } catch (err) {
                console.log(err);
              }
            } else {
              console.log("Data found", data);
              dispatch(setTeams(data));
            }
          });
        } catch (err) {
          console.log("Not able to fetch data");
        }
      } else {
        navigate("/login");
      }
    };
    fetchTeams();
  }, [user]);

  useEffect(() => {
    dispatch(setTeamPath(currentTeam));
  }, [currentTeam]);

  const handleOptionClick = (optionName) => {
    dispatch(setOptionState(optionName));
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="h-screen w-screen bg-[#1B1B1B] flex flex-row justify-between">
      {/* Section1 */}
      <div className="team-section flex h-full lg:w-[5%] w-[17%] flex-col gap-5 py-3 px-2 items-center">
        <img src="/icons/vizioLogo.png" alt="Vid" className="h-6 w-6" />
        <div className="flex w-full flex-col gap-2">
          {team?.map((team, index) => {
            return (
              <motion.div
                whileHover={{ scale: 1.03 }}
                key={index}
                className={`w-full p-2 flex justify-center items-center cursor-pointer hover:shadow-[#f8ff2a] ${
                  team === currentTeam
                    ? "bg-[#1B1B1B] text-[#f8ff2a] border-2 border-[#f8ff2a]"
                    : "bg-[#2f2f2f] text-[#f8ff2a]"
                }`}
                onClick={() => handleTeamClick(team)}
              >
                <p>{displayName(team)}</p>
              </motion.div>
            );
          })}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className={`w-full h-10 p-2 flex justify-center items-center hover:shadow-[#f8ff2a] hover:text-[#f8ff2a] bg-[#2f2f2f] text-[#bebea9] ${
              projectState ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => handleAddTeam()}
          >
            <FaPlus />
          </motion.div>
        </div>
      </div>

      <div className="flex lg:flex-row md:flex-row flex-col gap-4 lg:gap-0 w-full lg:w-full md:w-full">
        {/* Section 2 */}
        <div
          className={`team-projects-info p-2 lg:p-2 flex bg-[#242426] h-[3rem] lg:h-full lg:w-1/6 w-full rounded-lg flex-row lg:flex-col gap-4 relative ${
            isPastingObject ? "hidden" : ""
          }`}
        >
          <motion.div
            onClick={handleDropDownClick}
            className="bg-[#2f2f2f] flex w-full lg:h-fit h-full lg:p-2 md:p-2 p-1 rounded-lg justify-center items-center text-[#f8ff2a] cursor-pointer "
          >
            {currentTeam ? decodeURIComponent(currentTeam) : "Team"}
            <MdOutlineKeyboardArrowDown />
          </motion.div>
          {isTeamDropDownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="absolute bg-[#2f2f2f] rounded-lg text-[#bbbdc0] shadow-lg h-fit mt-11 px-2 pt-2 mr-2 w-[94%]"
            >
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="flex flex-row gap-3 items-center justify-start px-3 pb-4 border-b border-gray-600"
                  style={{ wordBreak: "break-word" }}
                >
                  <CgProfile className="h-6 w-6" />
                  <p>{user?.email}</p>
                </div>

                <div
                  className="flex flex-row gap-2 items-center justify-start px-3 cursor-pointer hover:text-[#f8ff2a]"
                  style={{ wordBreak: "break-word" }}
                  onClick={handleSignOut}
                >
                  <FiLogOut className="h-6 w-6" />
                  <p>LogOut</p>
                </div>
              </div>
            </motion.div>
          )}
          <div className="lg:hidden flex items-center">
            <GiHamburgerMenu
              className="text-[#f8ff2a] text-3xl cursor-pointer"
              onClick={handleMenuToggle}
            />
          </div>

          {/* Menu for smaller screens */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="absolute lg:hidden top-12 left-0 w-full h-fit flex justify-center items-center z-50"
            >
              <div className="w-72 h-3/4 rounded-lg flex flex-col gap-2 p-4 bg-[#8b8d90]">
                {teamProjectsInfoList.map((option) => (
                  <div
                    key={option.label}
                    onClick={() => {
                      handleOptionClick(option.label);
                      setIsMenuOpen(false); // Close menu after clicking an option
                    }}
                    className={`options flex w-full p-2 h-fit justify-center items-center rounded-xl shadow-2xl hover:bg-[#1B1B1B] hover:text-[#f8ff2a] cursor-pointer ${
                      optionState === option.label
                        ? "bg-[#1B1B1B] text-[#f8ff2a]"
                        : "bg-[#aaacb0] text-[#1B1B1B]"
                    }`}
                  >
                    <div className="flex flex-row gap-2 justify-center items-center">
                      <p className="leading-tight">{option.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="bg-[#8b8d90] lg:flex md:flex hidden w-full h-full px-3 py-1 lg:p-3 md:p-3 rounded-lg text-[#f8ff2a] flex-row lg:flex-col gap-2">
            {/* New Project Section */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="new-project flex w-full p-2 h-fit justify-center items-center bg-[#f8ff2a] rounded-xl shadow-2xl cursor-pointer"
            >
              <motion.div
                onClick={() => dispatch(setProjectState(true))}
                className="flex flex-row- gap-2 justify-center items-center text-[#1B1B1B]"
              >
                <p>New Project</p>
                <FaArrowRightLong />
              </motion.div>
            </motion.div>

            {teamProjectsInfoList.map((option) => {
              return (
                <div
                  key={option.label}
                  onClick={() => handleOptionClick(option.label)}
                  className={`options flex w-full p-2 h-fit justify-center items-center rounded-xl shadow-2xl hover:bg-[#1B1B1B] hover:text-[#f8ff2a]  cursor-pointer ${
                    optionState === option.label
                      ? "bg-[#1B1B1B] text-[#f8ff2a]"
                      : "bg-[#aaacb0] text-[#1B1B1B]"
                  }`}
                >
                  <div className="flex flex-row- gap-2 justify-center items-center">
                    <p>{option.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3 */}
        <div className="projects-section flex h-full w-full p-2 flex-col lg:px-5 md:px-5 px-2 gap-4">
          {/* Header */}
          <div className="flex flex-row w-full bg-[#242426] gap-5 rounded-lg pr-2">
            <div className="w-[88%] flex flex-row gap-4 bg-[#afb1b5] p-2 px-4 justify-center items-center rounded-xl">
              <FaSearch />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-transparent border-none outline-none"
              />
            </div>

            <div className="flex flex-row gap-4 justify-center items-center cursor-pointer ">
              <div className="flex flex-row gap-4 justify-center items-center cursor-pointer">
                <img src="/icons/Share.png" alt="Share" className="h-6 w-10 hidden lg:block" />
                <p className="text-[#f8ff2a]">Share</p>
              </div>
              <div className="bg-[#1B1B1B] text-[#f8ff2a] p-2 rounded-full h-7 w-7 flex justify-center items-center hover:bg-[#242426]">
                ?
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="relative flex flex-col w-full h-full bg-[#242426] rounded-lg p-5 overflow-y-auto">
            {projectState && <ProjectAdd />}
            {deletePopup && <Delete />}
            {isUploadingProgressOpen && <UploadProgress />}
            {addFolder && <FolderAdd />}
            {teamState && <TeamAdd />}
            {optionState === "Team Projects" && <TeamProjects />}
            {optionState === "Team Info" && <TeamInfo />}
            {optionState === "Upgrade the plan" && <UpgradePlan />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
