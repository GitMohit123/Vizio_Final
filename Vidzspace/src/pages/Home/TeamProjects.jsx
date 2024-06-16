import React, { useContext } from 'react'
import { FaPhotoVideo } from 'react-icons/fa'
import HomeContext from '../../context/homePage/HomeContext'
import { TbCloudUpload } from 'react-icons/tb'
import {motion} from "framer-motion"
import { useDispatch } from 'react-redux'
import { setProjectState } from '../../app/Actions/cmsAction'

const TeamProjects = () => {
    const {teamPath} = useContext(HomeContext);
    const dispatch = useDispatch();
  return (
    <>
    <div className="flex flex-row w-full p-2 justify-between items-center">
            <div className="flex flex-row gap-3 items-center  justify-center text-[#9B9DA0]">
              <FaPhotoVideo />
              <p>{teamPath} / Team Projects</p>
            </div>
          </div>

          <div className="h-full w-full flex justify-center items-center">
            <motion.div onClick={()=>dispatch(setProjectState(true))} className="flex flex-col justify-center items-center text-[#9B9DA0] cursor-pointer hover:text-[#f8ff2a]">
              <TbCloudUpload className="text-9xl" />
              <p>Create Your Project</p>
            </motion.div>
          </div>
    </>
  )
}

export default TeamProjects