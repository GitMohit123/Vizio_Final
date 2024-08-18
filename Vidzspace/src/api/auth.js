import axios from "axios";
const baseURL = `/vidzspaceApi/users/auth`;
export const validateUserJWTToken = async (token) => {
  try {
    const res = await axios.get(`${baseURL}/jwtVerification`, {
      headers: { Authorization: "Bearer " + token },
    });
    return res.data;
  } catch (err) {
    return null;
  }
};
export const fetchUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${baseURL}/fetchUser/${userId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
export const addUser = async(userId,email,name)=>{
  try{
    const response = await axios.post(`${baseURL}/addUser`,{
      userId:userId,
      email:email,
      name:name
    })
    console.log(response.data);
  }catch(err){
    console.log(err);
  }
}
