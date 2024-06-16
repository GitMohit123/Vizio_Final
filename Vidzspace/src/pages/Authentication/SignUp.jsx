import React, { useContext, useState } from "react";
import "../../styles/CSS/Signup/signUp.css"
import Input from "../../components/Auth Inputs/Input";
import { TbMailFilled } from "react-icons/tb";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { MdLockOutline } from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loginOptions } from "../../constants/authPage";
import FirebaseContext from "../../context/firebase/FirebaseContext";
import InputLoader from "../../components/Auth Inputs/InputLoader";
import { useSelector } from "react-redux";

const SignUp = () => {
  const navigate = useNavigate();
  const {emailAddress,setEmailAdress,password,setPassword,loginWithGoogle,userName, setUseName,signUpWithEmailPass} = useContext(FirebaseContext);
  const {componentLoading} = useSelector((state)=>state.user.componentLoading);
  const user = useSelector((state)=>state.user.info)

  const handleLoginOptionClick = (loginOption) => {
    if (loginOption === "Google") {
      loginWithGoogle();
      console.log("Completed api call")
    } else if (loginOption === "Apple") {
      //login using apple
    } else {
      //login using microsoft
    }
  };

  // useEffect(()=>{
  //   navigate("/home")
  // },[user])

  return (
    <div className="signUp-page">
      <div className="header">VidzSpace</div>
      <div className="hero">
        <div className="signUp-container">
          <div className="left-signUp">
            <div className="signUp-title">
              <p className="title-text">SignUp</p>
              <p className="subtitle-text">Getting started with Vidzspace !!</p>
            </div>
            <div className="input-fields">
            <Input
                // placeholder={"Password"}
                icon={<MdDriveFileRenameOutline />}
                inputState={userName}
                inputStateFunc={setUseName}
                type={"text"}
                label={"Name"}
              />
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
            
              <motion.div onClick={signUpWithEmailPass} className="signUp-button hover:bg-gray-900">
                <p>{!componentLoading ? "SIGN UP":(<InputLoader/>)}</p>
              </motion.div>
              <p className="text-center">
                Already have an account ? {"  "}
                <motion.button
                  onClick={() => navigate("/login")}
                  className="text-black text-lg underline font-black"
                >
                  Login
                </motion.button>
              </p>
              <p style={{ textAlign: "center" }}>Forgot Password?</p>
            </div>
          </div>

          <div className="right-signUp">
            <div className="signUp-options">
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

export default SignUp;
