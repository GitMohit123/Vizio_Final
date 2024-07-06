import { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { CommentPage, HomePage, LandingPage, Login, SignUp } from "./pages";
import FirebaseState from "./context/firebase/FirebaseState";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails, userLoading } from "./app/Actions/userAction";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { validateUserJWTToken } from "./api/auth";
import MainLoader from "./components/MainLoader";
import HomeState from "./context/homePage/HomeState";
import ProjectState from "./context/project/ProjectState";

const App = () => {
  const loading = useSelector((state) => state.user.loading);
  const navigate = useNavigate();
  const firebaseAuth = getAuth();
  const dispatch = useDispatch();
  useEffect(() => {
    firebaseAuth.onAuthStateChanged((cred) => {
      if (cred) {
        cred.getIdToken().then((token) => {
          validateUserJWTToken(token).then((data) => {
            dispatch(setUserDetails(data));
            // navigate("/home",{replace:true});
          });
        });
      }
      setTimeout(() => {
        dispatch(userLoading(false));
      }, 3000);
    });
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen h-aut w-screen items-center justify-center bg-black">
        <motion.div className="fixed text-white inset-0 backdrop-blur-md flex items-center justify-center w-full">
          <MainLoader />
        </motion.div>
      </div>
    );
  }
  return (
    <>
      <FirebaseState>
        <HomeState>
          <ProjectState>
            <Routes>
              <Route path="/*" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/feedback" element={<CommentPage/>}/>
            </Routes>
          </ProjectState>
        </HomeState>
      </FirebaseState>
    </>
  );
};

export default App;
