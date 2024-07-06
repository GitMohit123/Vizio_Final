import admin from "../index.js"
export const jwtVerification = async(req,res)=>{
    if (!req.headers.authorization) {
        return res.status(500).send({ msg: "Token Not Found" });
      }
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decodedValue = await admin.auth().verifyIdToken(token);
        if (!decodedValue) {
          res.status(500).json({ success: false, msg: "Unauthorized access" });
        }
        console.log("Verification approved")
        res.status(200).json(decodedValue);
      } catch (err) {
        console.log(err);
        res.send({ success: false, msg: `Error in extracting the token : ${err}` });
      }
}