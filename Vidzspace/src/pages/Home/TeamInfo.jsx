import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { FaUserPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import HomeContext from "../../context/homePage/HomeContext";
import { deleteTeam, fetchTeamsData } from "../../api/s3Objects";
// import { fetchData } from "next-auth/client/_utils";
import CMSLoader from "../../components/CMSLoader";

const TeamInfo = () => {
  const [loading, setLoading] = useState(false);
  const {
    displayName,
    user,
    team,
    currentTeam,
    teamState,
    renameState,
    teamPath,
    handleTeamClick,
    handleAddTeam,
    handleDropDownClick,
    optionState,
    projectState,
    setIsOpenShare,
    isTeamDropDownOpen,
    setIsTeamDropDownOpen,
    path,
    load,
    isOpenShare,
    searchQuery,
    setSearchQuery,
    deleteTeamState,
    setDeleteTeamState,
    handleTeamRename,
    teamToRename,
    setTeamToRename,
  } = useContext(HomeContext);

  console.log("currentTeam ", fetchTeamsData);

  const handleDeleteTeam = () => {
    const userId = user?.uid;
    setLoading(true);
    
    deleteTeam(userId, teamPath)
      .then((data) => {
        console.log(data);
      })
      window.location.reload(false)
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };



console.log("team", currentTeam)
    


  const teamMembers = [
    {
      name: "Adarsh Ramteke",
      email: "interactwithadarsh@gmail.com",
      role: "Viewer",
    },
    {
      name: "Adarsh Ramteke",
      email: "interactwithadarsh@gmail.com",
      role: "Editor",
    },
    {
      name: "Adarsh Ramteke",
      email: "interactwithadarsh@gmail.com",
      role: "Admin",
    },
  ];

  return (
    <div className=" p-6 rounded-lg text-white">
       {loading && <CMSLoader />}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{teamPath}</h2>
        <div className="flex items-center space-x-3">
          <button 
          // onClick={fetchData}          
          className="flex items-center text-sm font-medium bg-[#f8ff2a] text-gray-900 px-3 py-2 rounded-md hover:bg-yellow-300 transition">
         <FaUserPlus className="mr-2" />   Add New Member 
          </button>
          <FaEdit  size={25} 
           onClick={() => {
            handleTeamRename();
            setTeamToRename(currentTeam);
          }}
          className="text-yellow-500 cursor-pointer hover:text-yellow-400 transition" />
          <FaTrashAlt size={22}  onClick={handleDeleteTeam}  className="text-yellow-500 cursor-pointer hover:text-yellow-400 transition" />
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-medium">Team Members</h3>
        <div className="mt-4 space-y-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-700 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-400">{member.email}</p>
                </div>
              </div>
              <select
                className="bg-gray-600 text-white rounded-md px-3 py-1 outline-none"
                defaultValue={member.role}
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamInfo;
