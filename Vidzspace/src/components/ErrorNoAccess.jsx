import React from 'react'
import { useLocation } from 'react-router-dom'

const ErrorNoAccess = () => {

    const location = useLocation();
    const message = location?.state?.message;
  return (
    <div className='w-full h-screen flex justify-center items-center text-center text-red-400 text-xl bg-gray-600'>
        <h1>{message}</h1>
    </div>
  )
}

export default ErrorNoAccess