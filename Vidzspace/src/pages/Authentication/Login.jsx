import React, { useContext, useEffect, useState } from "react";
import "../../styles/CSS/Login/login.css";
import Input from "../../components/Auth Inputs/Input";
import { TbMailFilled } from "react-icons/tb";
import { MdLockOutline } from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loginOptions } from "../../constants/authPage";
import FirebaseContext from "../../context/firebase/FirebaseContext";
import { useSelector } from "react-redux";
import InputLoader from "../../components/Auth Inputs/InputLoader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const {emailAddress,setEmailAdress,password,setPassword,loginWithGoogle,signInWithEmailPass} = useContext(FirebaseContext);
  const {componentLoading} = useSelector((state)=>state.user.componentLoading)
  const user = useSelector((state)=>state.user.info)

  const handleLoginOptionClick = (loginOption) => {
    if (loginOption === "Google") {
      loginWithGoogle();
      console.log("Completed api call")
    }else {
      //login using microsoft
    }
  }

  // useEffect(()=>{
  //   navigate("/home")
  // },[user])

  return (
    <div className="login-page">
      <ToastContainer/>
      <div className="header">VidzSpace</div>
      <div className="hero">
        <div className="login-container">
          <div className="left">
            <div className="login-title">
              <p className="title-text">Login</p>
              <p className="subtitle-text">Welcome to VidzSpace</p>
            </div>
            <div className="input-fields">
              <Input
                // placeholder={"Email Address"}
                icon={<TbMailFilled />}
                inputState={emailAddress}
                inputStateFunc={setEmailAdress}
                type={"text"}
                label={"Email"}
              />
              <Input
                // placeholder={"Password"}
                icon={<MdLockOutline />}
                inputState={password}
                inputStateFunc={setPassword}
                type={"password"}
                label={"Password"}
              />
              <motion.div onClick={signInWithEmailPass} className="login-button">
                <p>{!componentLoading? "LOGIN":(<InputLoader/>)}</p>
              </motion.div>
              <p className="text-center">
                Don't have an account ? {"  "}
                <motion.button
                  onClick={() => navigate("/signup")}
                  className="text-black text-lg underline font-black"
                >
                  Sign Up
                </motion.button>
              </p>
              <p style={{ textAlign: "center" }}>Forgot Password?</p>
            </div>
          </div>

          <div className="right">
            <div className="login-options">
              <div className="title"><p>Or using</p></div>
              {loginOptions.map((option) => {
                return (
                  <motion.div
                    key={option.label}
                    className="flex flex-col gap-3 justify-center items-center cursor-pointer hover:shadow-md"
                    whileHover={{scale:1.1}}
                    onClick={() => handleLoginOptionClick(option.label)}
                  >
                    <img
                      src={`${option.icon}`}
                      alt={option.label}
                      className="h-10 w-10"
                    />
                    <p className="text-white">{option.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <div>@ VidzSpace</div>
        <div className="flex flex-row gap-5">
          <div className="hover:text-[#EAE00D] cursor-pointer">
            Privacy Policy
          </div>
          <div className="hover:text-[#EAE00D] cursor-pointer">
            Terms of service
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
