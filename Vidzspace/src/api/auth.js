import axios from "axios";

export const validateUserJWTToken = async (token)=>{
    try {
        const res = await axios.get(`/vidzspaceApi/users/auth/jwtVerification`, {
          headers: { Authorization: "Bearer " + token },
        });
        return res.data;
      } catch (err) {
        return null;
      }
}