import React, { useContext, useEffect, useState } from "react";
import VideoBox from "../../components/FeedBack/VideoBox";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import CommentSection from "../../components/FeedBack/CommentSection";
import { fetchCommentsApi } from "../../api/Comments";
import HomeContext from "../../context/homePage/HomeContext";

const CommentPage = () => {
  const location = useLocation();
  const { file } = location.state || {};
  const navigate = useNavigate();
  const {user} = useContext(HomeContext);
  const firstLetter = user?.name.charAt(0).toUpperCase();
  const {load} = useContext(HomeContext);

  const [backendComments,setBackendComments] = useState([]);

  useEffect(()=>{
   const fetchCommentsData = async()=>{
    try{
      const videoName = file?.Key;
      const userId = user?.uid;
      const response = await fetchCommentsApi(userId,videoName);
      setBackendComments(response);
      console.log(response);
    }catch(err){
      console.log("Unable to fetch comments in Api",err);
    }
   }
   fetchCommentsData();
  },[load])
  return (
    <>
      <div className=" bg-[#1B1B1B] min-h-screen p-[1px]">
        <div className=" flex h-full w-full p-2 flex-col px-3 gap-4">
          {/* Header */}
          <div className="flex flex-row w-full bg-[#242426] gap-5 rounded-lg py-1 px-2 justify-between items-center">
            <div className="flex flex-row gap-6 p-2 justify-center items-center rounded-xl text-white text-lg">
              <div className="cursor-pointer" onClick={() => navigate("/home")}>
                <IoMdArrowRoundBack />
              </div>
              <div>@ {file.Key}</div>
            </div>

            <div className="flex flex-row gap-4 justify-center items-center cursor-pointer ">
              <p className="text-white border border-yellow-300 font-bold px-4 py-1 rounded-lg">
                View_Status
              </p>
              <p className="text-black font-bold px-4 py-1 rounded-full bg-[#f8ff2a]">
                Share
              </p>

              <div className="relative w-8 h-8">
              <img
                src="/icons/Profile.png"
                alt="User"
                className="w-full h-full rounded-full"
              />
              {firstLetter && (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-400 bg-opacity-75 rounded-full">
                  {firstLetter}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        <div className="lg:flex lg:justify-center p-0 min-h-[100%]">
          <div className=" flex-1 overflow-hidden ">
            <VideoBox file={file} />
          </div>
          <div className=" lg:w-96 bg-[#242426] lg:h-[89vh] shadow-lg shadow-black text-gray-300 transform -translate-x-2 p-2 py-4">
            <div className="flex flex-col gap-4 items-center h-full w-full px-2">
              <div className="w-full flex flex-row gap-4 bg-[#38383b] p-2 px-4 justify-center items-center rounded-xl">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-transparent border-none outline-none"
                />
              </div>
              <CommentSection backendComments={backendComments}/> 
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentPage;
