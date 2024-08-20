import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { FaUserPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import HomeContext from "../../context/homePage/HomeContext";
import { deleteTeam, fetchTeamsData } from "../../api/s3Objects";
// import { fetchData } from "next-auth/client/_utils";
import CMSLoader from "../../components/CMSLoader";
import ProjectContext from "../../context/project/ProjectContext";

const TeamInfo = () => {
  const {
    currentTeam,
    teamPath,
    handleTeamRename,
    setTeamToRename,
  } = useContext(HomeContext);
  const {setTeamDeletePopup, teamDeletePopup} = useContext(ProjectContext);

  const handleDeleteTeam = () => {
   setTeamDeletePopup(true);
  };

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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h2 className="text-2xl font-semibold text-[#f8ff2a]">{teamPath}</h2>
          <div className="flex items-center space-x-3">
          <FaEdit
            size={22}
            onClick={() => {
              handleTeamRename();
              setTeamToRename(currentTeam.TeamName);
            }}
            className="text-white cursor-pointer hover:text-[#f8ff2a] transition"
          />
          <FaTrashAlt
            size={20}
            onClick={handleDeleteTeam}
            className="text-white cursor-pointer hover:text-[#f8ff2a] transition"
          />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            // onClick={fetchData}
            className="flex items-center text-sm font-medium bg-[#f8ff2a] text-gray-900 px-3 py-2 rounded-md hover:bg-[#f8ff2a] transition"
          >
            <FaUserPlus className="mr-2" /> Add New Member
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-medium">Team Members</h3>
        <div className="mt-4 space-y-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 px-5 bg-gray-800 rounded-md"
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
                className="bg-gray-600 text-white rounded-md px-3 py-2 outline-none"
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
