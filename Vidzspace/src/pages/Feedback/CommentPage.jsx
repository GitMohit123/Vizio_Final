import React from "react";
import VideoBox from "../../components/FeedBack/VideoBox";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";

const CommentPage = () => {
  const location = useLocation();
  const { file } = location.state || {};
  const navigate = useNavigate()
  return (
    <>
      <div className=" bg-[#1B1B1B] min-h-screen p-[1px]">
        <div className=" flex h-full w-full p-2 flex-col px-3 gap-4">
          {/* Header */}
          <div className="flex flex-row w-full bg-[#242426] gap-5 rounded-lg py-1 px-2 justify-between items-center">
            <div className="flex flex-row gap-6 p-2 justify-center items-center rounded-xl text-white text-lg">
                <div className="cursor-pointer" onClick={()=>navigate("/home")}><IoMdArrowRoundBack/></div>
                <div>@ {file.Key}</div>
            </div>

            <div className="flex flex-row gap-4 justify-center items-center cursor-pointer ">
              <p className="text-white border border-yellow-300 font-bold px-4 py-1 rounded-lg">
                View_Status
              </p>
              <p className="text-black font-bold px-4 py-1 rounded-full bg-[#f8ff2a]">
                Share
              </p>

              <MdOutlineAccountCircle size={30} className="text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="lg:flex lg:justify-center p-0 min-h-[100%]">
          <div className=" flex-1 overflow-hidden ">
            <VideoBox file={file} />
          </div>
          <div className=" lg:w-96 bg-[#242426] lg:h-[100%] shadow-lg shadow-black text-gray-300 transform -translate-x-2">
            fgh
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentPage;
