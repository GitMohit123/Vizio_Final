import React, { useState } from "react";
import FirebaseContext from "./FirebaseContext";
import { app } from "../../firebase/firebase.config";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails, userLoadingComponent } from "../../app/Actions/userAction";
import { validateUserJWTToken } from "../../api/auth";

const firebaseAuth = getAuth(app);
const FirebaseState = ({ children }) => {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailAddress, setEmailAdress] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUseName] = useState("");

  const loginWithGoogle = async () => {
    console.log("clicked");
    try{
      dispatch(userLoadingComponent(true))
      await signInWithPopup(firebaseAuth, provider).then((userCred) => {
        firebaseAuth.onAuthStateChanged((cred) => {
          if (cred) {
            cred.getIdToken().then((token) => {
              validateUserJWTToken(token).then((data) => {
                dispatch(setUserDetails(data));
              });
              navigate("/");
            });
          } else {
            console.log("No credentails got");
          }
        });
      });
    }catch(err){
      console.log("Error Login", err)
      dispatch(userLoadingComponent(false))
    }
  };

  const signInWithEmailPass = async () => {
    if (emailAddress !== "" && password !== "") {
      dispatch(userLoadingComponent(true))
      await signInWithEmailAndPassword(
        firebaseAuth,
        emailAddress,
        password
      ).then((userCred) => {
        firebaseAuth.onAuthStateChanged((cred) => {
          if (cred) {
            cred.getIdToken().then((token) => {
              validateUserJWTToken(token).then((data) => {
                console.log(data);
                dispatch(setUserDetails(data));
              });
              navigate("/");
              setEmailAdress("");
              setPassword("");
            });
          }
        });
      });
    } else {
      console.log("Credentials missing");
      dispatch(userLoadingComponent(false))
    }
  };

  const signUpWithEmailPass = async () => {
    try{
      dispatch(userLoadingComponent(true))
      const userCred = await createUserWithEmailAndPassword(
        firebaseAuth,
        emailAddress,
        password
      );
      const newUser = userCred.user;
      await updateProfile(newUser, {
        displayName: userName,
      });
      firebaseAuth.onAuthStateChanged((cred) => {
        if (cred) {
          cred.getIdToken().then((token) => {
            validateUserJWTToken(token).then((data) => {
              dispatch(setUserDetails(data));
              console.log(data);
            });
            navigate("/");
          });
        } else {
          // toast.error("Login Error");
          console.log("No user data")
        }
      });  
    }catch (error) {
      // toast.error(`Signup Error: ${error.message}`);
      console.error("Signup Error: ", error);
      dispatch(userLoadingComponent(false))
    }
    
  };

  return (
    <FirebaseContext.Provider
      value={{
        emailAddress,
        setEmailAdress,
        password,
        setPassword,
        loginWithGoogle,
        signInWithEmailPass,
        firebaseAuth,
        userName,
        setUseName,
        signUpWithEmailPass
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseState;
