import axios from "axios"

export const fetchCommentsApi = async(userId,videoName)=>{
    try{
        const response = await axios.post("/vidzspaceApi/users/comments/fetchComments",
            {
                userId:userId,
                videoName:videoName
            }
        )
        const data = response.data.data;
        return data;
    }catch(err){
        console.log("Unable to fetch Comments", err);
    }
} 

export const deleteComment = async(userId,commentId)=>{
    try{
      const response = await axios.post(`/vidzspaceApi/users/comments/deleteComment`,
        {
          userId:userId,
          commentId:commentId
        },
        // {
        //   headers:{
        //     Authorization:`Bearer ${idToken}`
        //   }
        // }
      )
      console.log(response.data)
      return response
    }catch(err){
      console.log(err)
    }
  };

  export const createComment = async(comment,userId,territory_id,videoName,reply_id,videoTime)=>{
    try{
      const response = await axios.post(`/vidzspaceApi/users/comments/createComment`,
        {
          text:comment,
          userId:userId, 
          userName:territory_id, 
          videoName:videoName, 
          reply_id:reply_id,
          videoTime:videoTime
        }
      );
      console.log(response.data)
      return response.data
    }catch(err){
      console.log("Error : ", err)
    }
  }

  export const editComment = async(userId,video_comment_id,newMessage)=>{
    try{
      const response = await axios.post(`/vidzspaceApi/users/comments/editComment`,
        {
          userId:userId,
          commentId:video_comment_id,
          newMessage:newMessage
        }
      );
      console.log(response.data);
      return response.data;
    }catch(err){
      console.log("Unable to edit the comment",err);
    }
  }

  export const likeComment = async(userId,video_comment_id,visibility)=>{
    try{
      const response = await axios.post(`/vidzspaceApi/users/comments/likeComment`,
        {
          userId:userId,
          commentId:video_comment_id,
          visibility:visibility
        }
      );
      console.log(response.data);
      return response.data;
    }catch(err){
      console.log("Unable to like the comment",err);
    }
  }
  export const updateProgress = async(userId,video_comment_id,progress)=>{
    try{
      const response = await axios.post(`/vidzspaceApi/users/comments/updateCommentProgress`,
        {
          userId:userId,
          commentId:video_comment_id,
          progress:progress
        }
      );
      console.log(response.data);
      return response.data;
    }catch(err){
      console.log("Unable to update the comment progress",err);
    }
  }