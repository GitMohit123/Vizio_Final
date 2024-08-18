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
import {
  setUserDetails,
  setUserDetailsWithName,
  setUserNULL,
  userLoadingComponent,
} from "../../app/Actions/userAction";
import {
  addUser,
  fetchUserDetails,
  validateUserJWTToken,
} from "../../api/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    try {
      dispatch(userLoadingComponent(true));
      await signInWithPopup(firebaseAuth, provider).then((userCred) => {
        firebaseAuth.onAuthStateChanged((cred) => {
          if (cred) {
            cred.getIdToken().then((token) => {
              validateUserJWTToken(token).then(async (data) => {
                const validUser = await fetchUserDetails(data?.user_id);
                if (validUser.message == "Not found") {
                  await addUser(data?.user_id, data?.email, data?.name);
                }
                console.log(validUser);
                console.log(data);
                dispatch(setUserDetails(data));
              });
              navigate("/");
            });
          } else {
            console.log("No credentails got");
          }
        });
      });
    } catch (err) {
      console.log("Error Login", err);
      toast.error("Error login");
      dispatch(userLoadingComponent(false));
    }
  };

  const signInWithEmailPass = async () => {
    if (emailAddress !== "" && password !== "") {
      dispatch(userLoadingComponent(true));
      try {
        await signInWithEmailAndPassword(
          firebaseAuth,
          emailAddress,
          password
        ).then((userCred) => {
          firebaseAuth.onAuthStateChanged((cred) => {
            if (cred) {
              cred.getIdToken().then((token) => {
                validateUserJWTToken(token).then(async (data) => {
                  const validUser = await fetchUserDetails(data?.user_id);
                  if (validUser.message == "Not found") {
                    await addUser(
                      data?.user_id,
                      data?.email,
                      validUser.data?.name
                    );
                  }
                  console.log(validUser);
                  console.log(data);
                  dispatch(setUserDetailsWithName(data, validUser?.data.name));
                });
                navigate("/");
                setEmailAdress("");
                setPassword("");
              });
            }
          });
        });
      } catch (err) {
        toast.error("Try Again !! Wrong Credentials");
      }
    } else {
      console.log("Credentials missing");
      toast.error("Credentials Missing");
      dispatch(userLoadingComponent(false));
    }
  };

  const signUpWithEmailPass = async () => {
    try {
      dispatch(userLoadingComponent(true));
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
            validateUserJWTToken(token).then(async (data) => {
              const validUser = await fetchUserDetails(data?.user_id);
              if (validUser.message == "Not found") {
                await addUser(data?.user_id, data?.email, userName);
              }
              console.log(validUser);
              console.log(data);
              dispatch(setUserDetailsWithName(data, userName));
            });
            setEmailAdress("");
            setPassword("");
            setUseName("");
            navigate("/");
          });
        } else {
          toast.error("Login details not found");
          console.log("No user data");
        }
      });
    } catch (error) {
      // toast.error(`Signup Error: ${error.message}`);
      console.error("Signup Error: ", error);
      toast.error("SignUp failed");
      setEmailAdress("");
      setPassword("");
      setUseName("");
      dispatch(userLoadingComponent(false));
    }
  };

  const handleSignOut = () => {
    firebaseAuth
      .signOut()
      .then(() => {
        navigate("/login");
        dispatch(setUserNULL());
      })
      .catch((err) => [console.log(err)]);
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
        signUpWithEmailPass,
        handleSignOut,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseState;
