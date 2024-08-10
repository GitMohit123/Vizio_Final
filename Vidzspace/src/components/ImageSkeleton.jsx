import React from "react"
import { MdOutlineSlowMotionVideo } from "react-icons/md";

const ImageSkeleton = () => {
  return (
    <div className='bg-transparent h-16 w-16 flex justify-center items-center p-4 backdrop-blur-3xl shadow-2xl rounded-md'>
      <MdOutlineSlowMotionVideo className="animate-pulse text-3xl"/>
    </div>
  );
}

export default ImageSkeleton;