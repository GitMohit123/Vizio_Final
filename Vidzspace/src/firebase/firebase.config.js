import {getApp,getApps,initializeApp} from 'firebase/app'
import {getStorage} from "firebase/storage"


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1a4YPtCjXaFfdQWkza4MRehQSHqqiSx8",
  authDomain: "vidzspace.firebaseapp.com",
  projectId: "vidzspace",
  storageBucket: "vidzspace.appspot.com",
  messagingSenderId: "647820050962",
  appId: "1:647820050962:web:1277a0eac9efb9f239cecb",
  measurementId: "G-4EJSYZWC2T"
};

  const app = getApps.length>0 ? getApp() : initializeApp(firebaseConfig)
  const storage = getStorage(app)

  export {app,storage}
  