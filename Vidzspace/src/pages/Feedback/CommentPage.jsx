import React, { useContext, useEffect, useState } from "react";
import VideoBox from "../../components/FeedBack/VideoBox";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaPhotoVideo, FaSearch } from "react-icons/fa";
import CommentSection from "../../components/FeedBack/CommentSection";
import { fetchCommentsApi } from "../../api/Comments";
import HomeContext from "../../context/homePage/HomeContext";
import ProjectContext from "../../context/project/ProjectContext";
import { setCurrentTeam } from "../../app/Actions/teamActions";
import ShareCommentPopup from "../../components/PopUp/ShareCommentPopup";
import { getSharedVideoFromKey, prefix } from "../../api/s3Objects";
import { DrawingProvider } from "../../context/drawing/DrawingContext";

const CommentPage = () => {
  const location = useLocation();
  // const { file } = location.state || null;
  const navigate = useNavigate();
  const { user, isShareCommentPopup, setIsShareCommentPopup } =
    useContext(HomeContext);
  const firstLetter = user?.name.charAt(0).toUpperCase();
  const { load, path, teamPath, handleTeamClick, currentTeam, owner_id, setOwner_id } =
    useContext(HomeContext);
  const [searchParams] = useSearchParams();
  const { extractName,setVideoTimeMin, setVideoTimeSec } = useContext(ProjectContext);
  const encodedKey = searchParams?.get("v");

  const [backendComments, setBackendComments] = useState([]);
  // const [fetchedVideo, setFetchedVideo] = useState();
  const [canWrite, setCanWrite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [file, setFile] = useState(location.state?.file);

  function getOwnerIdFromKey(Key) {
    console.log(Key)
    //key = users/...
    const parts = Key.split("/");
    const prefixLength = prefix.split("/").length - 1;
    // Ensure there are at least 2 parts (users, username)
    if (parts.length > prefixLength) {
      console.log(parts);
      return parts[prefixLength];
    } else {
      return null;
    }
  }
  const setPermissions = (videoData) => {
    console.log(videoData)
    console.log(owner_id);
    var ownerId = getOwnerIdFromKey(videoData?.FullKey);
    console.log(ownerId);
    // if(!ownerId) ownerId = user?.uid;
    setOwner_id(ownerId);
    console.log("owner:",ownerId, " userId:",user?.user_id)
    if(videoData?.Metadata?.sharingtype === "edit" || user?.user_id === ownerId){
      setCanWrite(true);
      console.log("canWrite");
    }
    if(user?.user_id === ownerId){
      setIsOwner(true);
      console.log("isOwner");
    }
  }

  const getVideoFromSharedLink = async(encodedKey) => {
    const Key = atob(encodedKey);
    const response = await getSharedVideoFromKey({Key, requester_id: user?.user_id});
    console.log(response)
    if(response.success === false) navigate('/error', {state: {message: "You dont have access to the file or the link is invalid :("}});
    console.log("current Path = ", Key)
    setPermissions(response?.videoData);
    setFile(response?.videoData);
  }

  useEffect(() => {
    const fetchCommentsData = async () => {
      try {
        if(!file){
          getVideoFromSharedLink(encodedKey).then(console.log("video fetched"));
        }
        else setPermissions(file);
        const videoName = file?.Key;
        const userId = user?.uid;
        const response = await fetchCommentsApi(userId, videoName);
        setBackendComments(response);
        console.log(response);
      } catch (err) {
        console.log("Unable to fetch comments in Api", err);
      }
    };
    fetchCommentsData();
  }, [load]);
  const handleBack = () => {
    navigate("/home");
    setVideoTimeMin(0);
    setVideoTimeSec(0);
    console.log(currentTeam);
    handleTeamClick(currentTeam);
  };
  return (
    <>
    <DrawingProvider>
      <div className=" bg-[#1B1B1B] min-h-screen p-[1px]">
        <div className=" flex h-full w-full p-2 flex-col px-3 gap-4">
          {/* Header */}
          <div className="flex flex-row w-full bg-[#242426] lg:gap-5 md:gap-1 rounded-lg py-1 px-2 justify-between items-center">
            <div className="flex flex-row lg:gap-6 md:gap-5 gap-4 p-2 justify-center items-center rounded-xl text-white text-lg">
              <div className="cursor-pointer" onClick={handleBack}>
                <IoMdArrowRoundBack />
              </div>
              <div>@ {extractName(file?.Key)}</div>
            </div>

            <div className="lg:flex md:flex flex-row gap-3 justify-center items-center text-gray-500 hidden">
              <FaPhotoVideo />
              <p className="cursor-pointer">
                {teamPath} / {path}
              </p>
            </div>

            <div className="flex flex-row gap-4 justify-center items-center cursor-pointer ">
              <p className="text-white border border-yellow-300 font-bold px-4 py-1 rounded-lg hidden lg:block md:block">
                View_Status
              </p>
              { isOwner && <p
                className="text-black font-bold px-4 py-1 rounded-full bg-[#f8ff2a]"
                onClick={() => setIsShareCommentPopup((prev) => !prev)}
              >
                Share
              </p>}

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

        <div className="lg:flex lg:justify-center p-0 h-[100%] relative">
          <div className=" flex-1 overflow-hidden ">
            <VideoBox file={file} />
          </div>
          <div className=" lg:w-96 w-[93%] bg-[#242426] lg:h-[89vh] shadow-lg shadow-black text-gray-300 transform -translate-x-2 py-4 mt-2 ml-5 px-3 mb-2 rounded-md lg:rounded-none">
            <div className="flex flex-col gap-4 items-center h-full w-full px-2">
              <div className="w-full flex flex-row gap-4 bg-[#38383b] p-2 px-4 justify-center items-center rounded-xl">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-transparent border-none outline-none"
                />
              </div>
              <CommentSection backendComments={backendComments} />
            </div>
          </div>
          <div>{isShareCommentPopup && <ShareCommentPopup file={file} />}</div>
        </div>
      </div>
      </DrawingProvider>
    </>
  );
};

export default CommentPage;
