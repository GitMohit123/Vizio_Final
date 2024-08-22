import axios from "axios";

export const prefix = "users/";

export const listTeams = async (userId) => {
  try {
    const response = await axios.get(`/vidzspaceApi/users/s3/fetch/${userId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const createTeam = async (teamName, userId,owner_name) => {
  try {
    let encodedTeamName = teamName.includes("/")
      ? teamName.split("/")[0] // Extract the first part before the first slash
      : teamName;
    if (encodedTeamName === "") {
      encodedTeamName = "Demo";
    }
    const response = await axios.post("/vidzspaceApi/users/s3/createTeam", {
      teamName: `${encodedTeamName}'s Team`,
      user_id: userId,
      ownerName:owner_name
    });

    if (response.status === 200) {
      console.log("Team created successfully:", response.data);
    } else {
      console.error("Error creating team:", response.data);
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.error("Error:", err);
    // Handle errors generically (e.g., display a generic error message)
    throw err; // Re-throw the error for handling in the calling component
  }
};

export const fetchTeamsData = async (path, user_id) => {
  try {
    console.log("in fetch teams data with path", path, ", requestorid: ", user_id);
    const response = await axios.get(`/vidzspaceApi/users/s3/fetchTeamsData`, {
      params: {
        requester_id: user_id,
        path: path,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const deleteVideo = async (url, idToken) => {
  try {
    const { data } = await axios.delete(`/vidzspaceApi/users/s3/delete`, {
      data: {
        url,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const deleteVideoFolder = async (folderKey, userId, teamPath, path) => {
  try {
    console.log(userId, teamPath, folderKey);
    const { data } = await axios.post(
      `/vidzspaceApi/users/s3/deletefolder`,
      {
        folderKey,
        teamPath,
        path,
      },

      {
        params: {
          userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fileFolderRename = async (
  type,
  path,
  newName,
  teamPath,
  userId,
  filefoldername
) => {
  try {
    console.log(type, path, newName, teamPath, userId, filefoldername);
    const { data } = await axios.post(
      `/vidzspaceApi/users/s3/rename`,
      {
        type,
        path,
        newName,
        teamPath,
        filefoldername,
      },

      {
        params: {
          userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const download = async (filePath, teamPath, userId, fileName, type) => {
  try {
    console.log("filepath", filePath);

    const response = await axios.post(
      `/vidzspaceApi/users/s3/download`,
      {
        filePath,
        teamPath,
        fileName,
        type,
      },

      {
        params: {
          userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          //const total = progressEvent.total;
          console.log(loaded);
          // const percentage = Math.round((loaded / total) * 100);
          // console.log(`Download progress: ${percentage}%`);
          // You can update a progress bar here
        },
      }
    );

    console.log(response);

    console.log("Download response:", response?.data);

    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = downloadUrl;

    if (type === "folder") {
      link.setAttribute("download", `${fileName}.zip`);
    } else if (type === "file") {
      link.setAttribute("download", fileName);
    }

    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

    return "download initiaed";
  } catch (error) {
    throw error;
  }
};

export const getUploadPresignedUrl = async ({
  fileName,
  contentType,
  user_id,
  fullPath,
}) => {
  try {
    const path = fullPath || "";
    console.log("in api: ", fileName, contentType, user_id, path);
    const response = await axios.post(
      `/vidzspaceApi/users/s3/generateUploadUrl`,
      {
        fileName,
        contentType,
        user_id,
        path,
      }
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${idToken}`,
      //     ...Object.keys(metaData).reduce((acc, key) => {
      //       acc[`x-amz-meta-${key.toLowerCase()}`] = JSON.stringify(metaData[key]);
      //       return acc;
      //     }, {}),
      //   },
      //   withCredentials: true,
      // }
    );
    return response.data; // Returning the response data
  } catch (error) {
    console.error("Error:", error);
    throw error; // Re-throwing the error for handling elsewhere if needed
  }
};

export const updateProgress = async (
  type,
  path,
  teamPath,
  userId,
  filefoldername,
  newProgress
) => {
  console.log(type, path, teamPath, userId, filefoldername, newProgress);
  try {
    const { data } = await axios.post(
      `/vidzspaceApi/users/s3/updateprogress`,
      {
        type,
        path,
        newProgress,
        teamPath,
        filefoldername,
      },

      {
        params: {
          userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createFolder = async (
  folderPath,
  teamPath,
  userId,
  folderName
) => {
  try {
    const { data } = await axios.post(
      "/vidzspaceApi/users/s3/createFolder",
      {
        folderPath,
        teamPath,
        folderName,
      },
      {
        params: {
          userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const copyObject = async ({ srcKey, destPath, type, user_id }) => {
  try {
    const response = await axios.post(`/vidzspaceApi/users/s3/copyObject`, {
      requester_id: user_id,
      srcKey,
      destPath,
      type,
    });
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

const frontendURL = "http://localhost:3000/home";
const frontendURLFeedback = "http://localhost:3000/feedback";

function getSharingLinkFromKey(Key) {
  console.log("key in url = " + Key);
  const sharingLink = frontendURLFeedback + `/?v=${btoa(Key)}`;
  return sharingLink;
}
function getSharingLinkFromPath(path, userId, teamPath) {
  console.log("path in url = " + path);
  let fullPath;
  fullPath = `users/${userId}/${teamPath}/${path}`;
  const sharingLink = frontendURL + `/?v=${btoa(fullPath)}`;
  const sharingLi = frontendURL + `/${fullPath}`;
  console.log(sharingLi);
  return sharingLink;
}

export const shareVideo = async ({
  url,
  requester_id,
  sharing,
  sharingType,
  sharingWith,
  type,
}) => {
  try {
    const getKeyFromSignedUrl = (signedUrl) => {
      const urlObj = new URL(signedUrl);
      return decodeURIComponent(urlObj.pathname.slice(1)); // Remove leading slash and decode URI
    };

    const Key = getKeyFromSignedUrl(url);
    console.log(Key);

    const response = await axios.post(
      "/vidzspaceApi/users/s3/updateVideoMetadata",
      {
        Key,
        requester_id,
        sharing,
        sharingType,
        sharingWith,
        type,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const sharingLink = getSharingLinkFromKey(Key);

    return {
      response: response.data,
      sharingLink: sharingLink,
    };
  } catch (error) {
    console.log(error);
  }
};

export const shareVideoFolder = async ({
  requester_id,
  sharing,
  sharingType,
  sharingWith,
  path,
  userId,
  teamPath,
}) => {
  try {
    console.log("in share api with path, uid, team:",path,
      userId,
      teamPath)
    const response = await axios.post(
      "/vidzspaceApi/users/s3/updateVideoMetadataFolder",
      {
        requester_id,
        sharing,
        sharingType,
        sharingWith,
        path,
        userId,
        teamPath,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const sharingLink = getSharingLinkFromPath(path, userId, teamPath);

    console.log(response);

    return {
      response: response.data,
      sharingLink: sharingLink,
    };
  } catch (error) {
    console.log(error);
  }
};

export const getSharedVideoFromKey = async ({Key, requester_id}) => {
  try {
    console.log("key:", Key);
    const response = await axios.post(
      `/vidzspaceApi/users/s3/getSharedVideoFromKey`,
      {
        Key,
        requester_id
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};


export const deleteTeam = async (userId, teamPath,teamID) => {
  try {
    console.log(userId, teamPath,teamID);
    const { data } = await axios.post(
      `/vidzspaceApi/users/s3/deleteteam`,
      {
        teamPath,
      },

      {
        params: {
          userId,
          teamId:teamID
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const renameTeam = async (newName, oldName, userId,teamID) => {
  try {
    console.log(userId, newName, oldName,teamID);
    const { data } = await axios.post(
      `/vidzspaceApi/users/s3/renameteam`,
      {
        newName,
        oldName,
        teamID
      },

      {
        params: {
          userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
