import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectTaggingCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import archiver from "archiver";
import { s3Client } from "../s3config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import admin from "../index.js";
import { params } from "firebase-functions";
import { PassThrough } from "stream";
import { addTeamDetail } from "./Team.js";
import {
  deleteTeamOperation,
  renameTeamDB,
} from "../database/teamOperations.js";

const prefix = "users/";

export const listTeams = async (req, res, next) => {
  const { user_id } = req.query;
  // console.log(user_id)
  try {
    const params = {
      Bucket: "vidzspace",
      Prefix: prefix + `${user_id}/`,
    };

    const data = await s3Client.send(new ListObjectsV2Command(params));

    if (data.KeyCount === 0) {
      // No teams found for the user
      return res.status(204).json({ message: "No content found" });
    }
    const teamNames = data.Contents.map((obj) => {
      const keyParts = obj.Key.split("/");
      // console.log(keyParts)
      if (keyParts.length === 4) {
        return keyParts[keyParts.length - 2];
      }
    });
    const filteredTeamNames = teamNames.filter(
      (teamName) => teamName !== null && teamName !== undefined
    );
    const uniqueTeamNames = [...new Set(filteredTeamNames)];

    return res.status(200).json(uniqueTeamNames); // Send OK (200) with the list of teams
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" }); // Send Internal Server Error (500) with a generic message
  }
};

export const createTeam = async (req, res, next) => {
  const { teamName, user_id, ownerName } = req.body;
  if (!teamName || !user_id || !ownerName) {
    return res
      .status(400)
      .json({ message: "Missing required fields: teamName and user_id" });
  } else {
    try {
      const userParams = {
        Bucket: "vidzspace",
        Prefix: prefix + `${user_id}/`,
      };
      const headObjectResponse = await s3Client.send(
        new ListObjectsV2Command(userParams)
      );
      if (headObjectResponse.KeyCount === 0) {
        console.log("No user found");
        const userIdParams = {
          Bucket: "vidzspace",
          Key: prefix + `${user_id}/`,
          Body: "",
        };
        await s3Client.send(new PutObjectCommand(userIdParams));
      } else {
        console.log("User found");
      }
      const params = {
        Bucket: "vidzspace",
        Key: prefix + `${user_id}/${teamName}/`,
        Body: "",
      };
      const teamDetails = {
        OwnerId: user_id, // Sort Key
        TeamName: teamName, // Team's name
        OwnerName: ownerName,
      };
      await addTeamDetail(teamDetails);
      await s3Client.send(new PutObjectCommand(params));
      return res.status(200).json({ message: "Team created successfully" });
    } catch (err) {
      console.error("Error creating team folder:", err);
      // Handle specific errors (optional)
      if (err.code === "AccessDenied") {
        return res
          .status(403)
          .json({ message: "Insufficient permissions to create team folder" });
      } else if (err.code === "BucketNotFound") {
        return res.status(404).json({ message: "Bucket not found" });
      } else {
        // Generic error handling (improve based on specific needs)
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
};

function getFilesForSubfolder(subfolderKey, objects) {
  var subFiles = [];
  var subfolders = [];

  //console.log("objects", objects);
  objects.map((item) => {
    if (item.Key.startsWith(subfolderKey)) {
      const relativePath = item.Key.slice(subfolderKey.length);
      if (
        relativePath.endsWith("/") &&
        relativePath.slice(0, -1).indexOf("/") === -1
      )
        subfolders.push({ Key: relativePath.slice(0, -1), Type: "folder" });
      if (relativePath.indexOf("/") === -1 && relativePath !== "")
        subFiles.push(item); //is a file
    }
  });
  return { subFiles: subFiles, subfolders: subfolders };
}

async function addMetadataAndSignedUrl(file) {
  const key = file.FullKey.split("/").filter(Boolean).pop();
  const fileParams = {
    Bucket: "vidzspace",
    Key: file.FullKey,
    ContentType: "video/mp4",
  };
  const url = await getSignedUrl(s3Client, new GetObjectCommand(fileParams));
  const metadata = await s3Client.send(new HeadObjectCommand(fileParams));
  return {
    Key: key,
    FullKey: file.FullKey,
    LastModified: file.LastModified,
    ETag: file.ETag,
    Size: file.Size,
    StorageClass: file.StorageClass,
    Type: "file",
    SignedUrl: url,
    Metadata: metadata?.Metadata,
  };
}

async function getFolderSize(bucketName, folderPath, data2) {
  const params = {
    Bucket: bucketName,
    Prefix: folderPath,
  };
  let totalSize = 0;
  let continuationToken = null;
  do {
    let response;

    if (data2 && !data2.IsTruncated) response = data2;
    else
      response = await s3Client.send(
        new ListObjectsV2Command({
          ...params,

          ContinuationToken: continuationToken,
        })
      );
    response.Contents.forEach((item) => {
      totalSize += item.Size;
    });

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : null;
  } while (continuationToken);

  return totalSize;
}

async function calculateFolderSizes(folders, bucketName, prefix) {
  const folderSizes = [];

  for (const folder of folders) {
    if (folder.Type === "folder") {
      const folderSize = await getFolderSize(
        bucketName,
        prefix + folder.Key + "/"
      );
      folderSizes.push({ Key: folder.Key, size: folderSize });
    }
  }

  return folderSizes;
}

const getSharingDetails = async (key) => {
  console.log("key", key);
  const metadataParams = {
    Bucket: "vidzspace",
    Key: key,
  };
  const metadataResponse = await s3Client.send(
    new HeadObjectCommand(metadataParams)
  );
  // console.log("response", metadataResponse.Metadata);
  return metadataResponse.Metadata;
};

export const listRoot = async (req, res, next) => {
  const user_id = req.query.requester_id;
  let path = req.query.path || ""; // Default to empty string if path is not provided
  console.log("path:" + path);

  // Ensure path ends with a slash if it is not empty
  if (path && !path.endsWith("/")) {
    path += "/";
  }

  try {
    const params = {
      Bucket: "vidzspace",
      Prefix: prefix + `${path}`,
      Delimiter: "/",
    };
    const data = await s3Client.send(new ListObjectsV2Command(params));

    // console.log(data);

    const params2 = {
      Bucket: "vidzspace",
      Prefix: prefix + `${path}`,
      Delimiter: "",
    };
    const data2 = await s3Client.send(new ListObjectsV2Command(params2));

    //console.log(data2);
    const size = await getFolderSize("vidzspace", prefix + path, data2);

    const owner_id = getOwnerIdFromObjectKey(prefix + path);
    var sharingDetails;

    const hasMetadata =
      (data.Contents || []).filter((item) => item.Key.endsWith("metadata.json"))
        .length > 0;
    if (hasMetadata) {
      console.log("has metadata");
      const { sharing, sharingwith, sharingtype } = await getSharingDetails(
        prefix + path + "metadata.json"
      );
      if (
        user_id !== owner_id &&
        sharing !== "public" &&
        !(sharing === "limited" && sharingwith.includes(user_id))
      ) {
        //requester has no access
        console.log("no access");
        return res.status(201).json({
          success: false,
          message: "no access",
        });
      }
      sharingDetails = { sharing, sharingwith, sharingtype };
    } else if (owner_id !== user_id) {
      return res.status(201).json({
        success: false,
        message: "no access",
      });
    }

    // Extract the common prefixes (folders) and top-level files
    const folders = (data.CommonPrefixes || []).map((prefix) => ({
      Key: prefix.Prefix.split("/").filter(Boolean).pop(),
      Type: "folder",
      LastModified: null,
      Metadata: null,
    }));

    //inner files
    // folders.forEach(subfolder => {
    //   const innerStuff = getFilesForSubfolder(params.Prefix + subfolder.Key + '/', data2.Contents);
    //   subfolder.innerFiles = innerStuff.subFiles;
    //   subfolder.innerFolders = innerStuff.subfolders;
    // });
    // res.json({folders: folders, data2: data2.Contents})

    for (const subfolder of folders) {
      const innerStuff = getFilesForSubfolder(
        params.Prefix + subfolder.Key + "/",
        data2.Contents
      );
      subfolder.innerFolders = innerStuff.subfolders;
      subfolder.innerFiles = await Promise.all(
        innerStuff.subFiles.map(async (file) => {
          // console.log("file", file);
          if (file) {
            file.FullKey = file.Key;
            return await addMetadataAndSignedUrl(file);
          } else {
            return [];
          }
        })
      );

      // Get LastModified for the folder itself (assuming it's listed in data2.Contents)
      const folderObject = data2.Contents.find(
        (item) => item.Key === params.Prefix + subfolder.Key + "/"
      );
      if (folderObject) {
        subfolder.LastModified = folderObject.LastModified;
      }

      const metadataFileKey = `${params.Prefix}${subfolder.Key}/metadata.json`;
      const metadataFileObject = data2.Contents.find(
        (item) => item.Key === metadataFileKey
      );
      if (metadataFileObject) {
        // Fetch metadata of metadata.json
        const metadataParams = {
          Bucket: "vidzspace",
          Key: metadataFileKey,
        };
        const metadataResponse = await s3Client.send(
          new HeadObjectCommand(metadataParams)
        );
        subfolder.Metadata = metadataResponse.Metadata;
      }
    }

    const files = await Promise.all(
      (data.Contents || [])
        .filter((item) => item.Key !== params.Prefix) // Exclude the prefix itself if it's listed
        .map(async (file) => {
          const key = file.Key.split("/").filter(Boolean).pop();
          // console.log(file.Key);
          const fileParams = {
            Bucket: "vidzspace",
            Key: file.Key,
            ContentType: "video/mp4",
          };
          // Generate pre-signed URL for each file
          const url = await getSignedUrl(
            s3Client,
            new GetObjectCommand(fileParams)
          );

          const metadata = await s3Client.send(
            new HeadObjectCommand(fileParams)
          );

          return {
            Key: key,
            FullKey: file.Key,
            LastModified: file.LastModified,
            ETag: file.ETag,
            Size: file.Size,
            StorageClass: file.StorageClass,
            Type: "file",
            SignedUrl: url,
            Metadata: metadata?.Metadata,
          };
        })
    );
    const folderSizes = await calculateFolderSizes(
      folders,
      "vidzspace",
      prefix + path
    );
    const result = {
      folders: folders.map((folder) => ({
        ...folder,
        size: folderSizes.find((f) => f.Key === folder.Key)?.size || 0,
      })), // Add size to each folder object
      files: files,
      // sharingDetails: sharingDetails,
      size: size,
      sharingDetails: sharingDetails,
    };

    return res.json(result);
  } catch (err) {
    return err;
  }
};

export const getSharedVideoFromKey = async (req, res, next) => {
  try {
    const { requester_id, Key } = req.body;
    console.log("shared vid: ", Key, requester_id);
    const owner_id = getOwnerIdFromObjectKey(Key);
    // return res.json({d:0})
    //fetching current metadata
    const command1 = new HeadObjectCommand({
      Bucket: "vidzspace",
      Key: Key,
    });
    const response = await s3Client.send(command1);
    const metadata = await getSharingDetails(Key);
    const { sharing, sharingwith, sharingtype } = metadata;

    const fileParams = {
      Bucket: "vidzspace",
      Key: Key,
      ContentType: "video/mp4",
    };

    const filecommand = new GetObjectCommand(fileParams);
    const file = await s3Client.send(filecommand);
    // console.log("file: ",file)
    file.Key = Key.split("/").filter(Boolean).pop(); //ll
    file.FullKey = Key;
    const fileData = await addMetadataAndSignedUrl(file);
    // const url = await getSignedUrl(s3Client, file);

    //checking if user has access to share
    if (
      owner_id === requester_id ||
      sharing === "public" ||
      (sharing === "limited" && sharingwith.includes(requester_id))
    ) {
      //requester has access
      // const videoData = {
      //   SignedUrl: "https://vidzspace.s3.ap-south-1.amazonaws.com/" + Key, // for testing. Use the GetSignedUrl wala function instead of this
      //   Key: Key,
      //   Metadata: metadata,
      //   LastModified: file.LastModified,
      //   ETag: file.ETag,
      //   Size: file.Size,
      //   StorageClass: file.StorageClass,
      //   Type: "file",
      // }
      return res.status(201).json({
        success: true,
        videoData: fileData,
      });
    }

    return res.status(201).json({
      //requester doesnt have access
      success: false,
      videoData: null,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  const { url } = req.body;

  const decodeUrl = decodeURIComponent(url);

  const parts = decodeUrl.split("/");

  const bucketName = parts[2].split(".")[0];

  const key = parts.slice(3).join("/").split("?")[0];

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  console.log("bucket", bucketName, key);
  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    return res.status(200).send({ message: "Video deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Failed to delete video" });
  }
};

export const deleteVideoFolder = async (req, res, next) => {
  const { folderKey, teamPath, path } = req.body;
  const { userId } = req.query;

  console.log("folderpath", folderKey, userId, teamPath, path);

  // const decodefolderpath = decodeURIComponent();

  try {
    const folderPref = path
      ? `${userId}/${teamPath}/${path}/${folderKey}`
      : `${userId}/${teamPath}/${folderKey}`;
    const params = {
      Bucket: "vidzspace",
      Prefix: prefix + folderPref,
    };
    const listCommand = new ListObjectsV2Command(params);
    const data = await s3Client.send(listCommand);
    if (!data.Contents || data.Contents.length === 0) {
      return res
        .status(404)
        .send({ message: "Folder not found or already empty" });
    }
    const keysToDelete = data.Contents.map((obj) => obj.Key);
    const objects = keysToDelete.map((Key) => ({ Key }));
    const delparams = {
      Bucket: "vidzspace",
      Delete: {
        Objects: objects,
        Quiet: true,
      },
    };
    const commanddel = new DeleteObjectsCommand(delparams);
    await s3Client.send(commanddel);
    return res
      .status(200)
      .send({ message: "Video folder deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const renameFolderFile = async (req, res, next) => {
  console.log(req);
  const { type, newName, teamPath, path, filefoldername } = req.body;
  const { userId } = req.query;

  // console.log("type", type, newName, path, userId, teamPath, filefoldername);

  let folprefix;
  if (!path) {
    folprefix = prefix + `${userId}/${teamPath}/`;
  } else {
    folprefix = prefix + `${userId}/${teamPath}/${path}/`;
  }

  // console.log(folprefix);

  try {
    if (type === "file") {
      const copyParams = {
        Bucket: "vidzspace",
        CopySource: `/vidzspace/${folprefix}${filefoldername}`,
        Key: `${folprefix}${newName}.mp4`,
      };

      // console.log("Key", copyParams?.CopySource, copyParams?.Key);

      let tags = [];
      try {
        const taggingCommand = new GetObjectTaggingCommand({
          Bucket: "vidzspace",
          Key: `${folprefix}${filefoldername}`,
        });
        const taggingData = await s3Client.send(taggingCommand);
        tags = taggingData.TagSet;
      } catch (error) {
        if (error.name !== "NoSuchTagSet") {
          throw error;
        }
      }

      const copyCommand = new CopyObjectCommand(copyParams);
      await s3Client.send(copyCommand);

      if (tags.length > 0) {
        const taggingCommand = new PutObjectTaggingCommand({
          Bucket: "vidzspace",
          Key: `${folprefix}${newName}`,
          Tagging: {
            TagSet: tags,
          },
        });
        await s3Client.send(taggingCommand);
      }

      const deleteParams = {
        Bucket: "vidzspace",
        Key: `${folprefix}${filefoldername}`,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3Client.send(deleteCommand);

      res.status(200).json({
        message: "File renamed and original object deleted successfully",
      });
    } else if (type === "folder") {
      const listParams = {
        Bucket: "vidzspace",
        Prefix: `${folprefix}${filefoldername}/`,
      };

      const listCommand = new ListObjectsV2Command(listParams);
      const listedObjects = await s3Client.send(listCommand);

      for (const object of listedObjects.Contents) {
        const copyParams = {
          Bucket: "vidzspace",
          CopySource: `/${listParams.Bucket}/${object.Key}`,
          Key: object.Key.replace(
            `${folprefix}${filefoldername}/`,
            `${folprefix}${newName}/`
          ),
        };

        const copyCommand = new CopyObjectCommand(copyParams);
        await s3Client.send(copyCommand);

        const deleteParams = {
          Bucket: "vidzspace",
          Key: object.Key,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
      }
      res.status(200).json({
        message: "File/Folder renamed and original object deleted successfully",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const downloadFile = async (key, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: "vidzspace",
      Key: key,
    });
    const { Body, ContentLength } = await s3Client.send(command);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(key)}`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    Body.pipe(res)
      .on("error", (err) => {
        console.error("Stream Error:", err);
        res.status(500).json({ error: "Failed to stream file" });
      })
      .on("finish", () => {
        console.log("Download completed:", key);
      });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
};

const CalculateTotalSize = async (contents) => {
  let totSize = 0;

  for (const item of contents) {
    const fileCommand = new HeadObjectCommand({
      Bucket: "vidzspace",
      Key: item.Key,
    });

    try {
      const { ContentLength } = await s3Client.send(fileCommand);
      totSize += ContentLength;
    } catch (error) {
      console.error(`Error fetching file size for ${item.Key}:`, error);
    }
  }

  return totSize;
};

const downloadFolder = async (key, res) => {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: "vidzspace",
      Prefix: key,
    });

    const { Contents } = await s3Client.send(listCommand);

    console.log(Contents);

    if (!Contents || Contents.length === 0) {
      return res.status(404).json({ error: "No files found in the folder" });
    }

    const totSize = await CalculateTotalSize(Contents);

    console.log(totSize);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(key)}.zip`
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip");
    archive.pipe(res);

    const fetchFile = async (item) => {
      const fileCommand = new GetObjectCommand({
        Bucket: "vidzspace",
        Key: item.Key,
      });

      const { Body } = await s3Client.send(fileCommand);
      //console.log(Body);
      return {
        body: Body,
        name: path.relative(key, item.Key),
        size: item.Size,
      };
    };

    const fetchPromises = Contents?.map((item) => fetchFile(item));
    const files = await Promise.all(fetchPromises);

    for (const file of files) {
      // console.log("file", file.body, file.name);
      if (!file.name || file.size === 0) {
        console.error(`Error: File name is empty for key`);
        continue; // Skip this file
      }
      console.log(`Appending file: ${file.name}`);
      archive.append(file.body, { name: file.name });
    }

    await archive.finalize();
  } catch (error) {
    console.error("Error downloading folder:", error);
    res.status(500).json({ error: "Failed to download folder" });
  }
};

export const downloadFolderFile = async (req, res, next) => {
  const { filePath, teamPath, fileName, type } = req.body;
  const { userId } = req.query;

  console.log("filepath", filePath, userId, teamPath, fileName, type);

  let folprefix;
  if (!filePath) {
    folprefix = prefix + `${userId}/${teamPath}/${fileName}`;
  } else {
    folprefix = prefix + `${userId}/${teamPath}/${filePath}/${fileName}`;
  }

  if (type === "file") {
    await downloadFile(folprefix, res);
  } else if (type === "folder") {
    //console.log("folder");
    await downloadFolder(folprefix, res);
  }
};

export const generationUploadUrl = async (req, res, next) => {
  try {
    const { fileName, contentType, user_id, path } = req.body;

    console.log("content", contentType);

    if (!fileName) {
      //empty folder
      console.log(path);
      const command = new PutObjectCommand({
        Bucket: "vidzspace",
        Key: `users/${path}/`,
      });
      const response = await s3Client.send(command);
      return res.status(201).json({
        success: true,
        response,
      });
    }

    const fullPath = `users/${path}/${fileName}`;
    const owner_id = getOwnerIdFromObjectKey(fullPath); //for testing only
    const ownerFirebaseData = await admin.auth().getUser(owner_id);
    const ownerName = ownerFirebaseData.toJSON().displayName;

    const {
      "x-amz-meta-sharing": sharing,
      "x-amz-meta-sharingtype": sharingType,
      "x-amz-meta-sharingwith": sharingWith,
      "x-amz-meta-progress": progress,
    } = req.headers;
    const command = new PutObjectCommand({
      Bucket: "vidzspace",
      Key: fullPath,
      ContentType: contentType,
      Metadata: {
        sharing: sharing || "none",
        sharingtype: sharingType || "none",
        sharingwith: sharingWith || "[]",
        progress: progress || "Upcoming",
        ownerName: ownerName || "cant read",
      },
    });
    const url = await getSignedUrl(s3Client, command);
    return res.status(201).json({
      success: true,
      url,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

function getOwnerIdFromObjectKey(Key) {
  //key = users/...
  const parts = Key.split("/");
  const prefixLength = prefix.split("/").length - 1;
  // Ensure there are at least 2 parts (users, username)
  if (parts.length > prefixLength) {
    console.log(parts);
    return parts[prefixLength];
  } else {
    return null;
  }
}

export const updateProgress = async (req, res, next) => {
  const { type, path, newProgress, teamPath, filefoldername } = req.body;
  const { userId } = req.query;

  console.log(
    "type",
    type,
    userId,
    path,
    newProgress,
    teamPath,
    filefoldername
  );

  let folprefix;
  if (!path) {
    folprefix = prefix + `${userId}/${teamPath}/${filefoldername}`;
  } else {
    folprefix = prefix + `${userId}/${teamPath}/${path}/${filefoldername}`;
  }

  console.log(folprefix);

  if (type === "file") {
    await updateObjectMetadata(folprefix, newProgress);

    res.status(200).json({ message: "Metadata updated successfully" });
  } else if (type === "folder") {
    const metadataFileKey = `${folprefix}/metadata.json`;
    await updateObjectMetadata(metadataFileKey, newProgress);

    res.status(200).json({ message: "Folder metadata updated successfully" });
  } else {
    res.status(200).json({ message: "Object Type undefined" });
  }
};

const updateObjectMetadata = async (key, newProgress) => {
  try {
    const fileCommand = new HeadObjectCommand({
      Bucket: "vidzspace",
      Key: key,
    });

    const { Metadata } = await s3Client.send(fileCommand);

    const newMetadata = {
      ...Metadata,
      progress: newProgress,
    };

    //console.log(Metadata);

    const newCommand = new CopyObjectCommand({
      Bucket: "vidzspace",
      CopySource: `/vidzspace/${key}`,
      Key: key,
      Metadata: newMetadata,
      MetadataDirective: "REPLACE",
    });

    await s3Client.send(newCommand);

    //console.log(Metadata);
  } catch (error) {
    console.log(error);
  }
};

export const createFolder = async (req, res, next) => {
  try {
    const { folderPath, teamPath, folderName } = req.body;
    const { userId } = req.query;

    //console.log(userId, teamPath, folderPath, folderName);

    if (folderPath != "" && folderPath != undefined) {
      const folderKey =
        prefix + `${userId}/${teamPath}/${folderPath}/${folderName}/`;
      const params = {
        Bucket: "vidzspace",
        Key: folderKey,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      res.status(200).send("Folder Created");
    } else {
      res.status(200).send("Folder cannot be created");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

async function copyFolder({
  fromBucket,
  fromLocation,
  toBucket = fromBucket,
  toLocation,
}) {
  let count = 0;
  const recursiveCopy = async function (token) {
    const listCommand = new ListObjectsV2Command({
      Bucket: fromBucket,
      Prefix: fromLocation,
      ContinuationToken: token,
    });
    let list = await s3Client.send(listCommand); // get the list
    if (list.KeyCount) {
      // if items to copy
      const fromObjectKeys = list.Contents.map((content) => content.Key); // get the existing object keys
      for (let fromObjectKey of fromObjectKeys) {
        // loop through items and copy each one
        // const toObjectKey = fromObjectKey.replace(fromLocation, toLocation); // replace with the destination in the key
        let toObjectKey = fromObjectKey.replace(fromLocation, toLocation);
        console.log(toObjectKey);
        if (isVideoFile(fromObjectKey)) {
          const filename = fromObjectKey.split("_").slice(-1)[0];
          console.log("Hi mohit", filename);
          const timestamp = Date.now(); // or any other format you prefer
          const newFileName = `video_${timestamp}_${filename}`;
          console.log("Hi error", newFileName);
          toObjectKey = toObjectKey.replace(
            fromObjectKey.split("/").pop(),
            newFileName
          );
        }
        // copy the file
        const copyCommand = new CopyObjectCommand({
          // ACL: 'public-read',
          Bucket: toBucket,
          CopySource: `${fromBucket}/${fromObjectKey}`,
          Key: toObjectKey,
        });
        await s3Client.send(copyCommand);
        count += 1;
      }
    }
    if (list.NextContinuationToken) {
      recursiveCopy(list.NextContinuationToken);
    }
    return `${count} files copied.`;
  };
  return recursiveCopy();
}
function isVideoFile(objectKey) {
  return objectKey.includes("video") && objectKey.endsWith(".mp4");
}

export const copyObject = async (req, res) => {
  //destPath = path after 'users/'
  console.log("hi");
  const { srcKey, destPath, type } = req.body;

  try {
    const sourceKey = prefix + srcKey;
    const destinationPath = destPath.endsWith("/")
      ? destPath.slice(0, -1)
      : destPath;
    const owner_id = getOwnerIdFromObjectKey(sourceKey);
    console.log(owner_id);
    const ownerFirebaseData = await admin.auth().getUser(owner_id);
    const ownerName = ownerFirebaseData.toJSON().displayName;

    const newMetadata = {
      sharing: "none",
      sharingType: "none",
      sharingWith: "[]",
      ownerId: owner_id,
      ownerName: ownerName,
      progress: "Upcoming",
    };

    if (type === "folder") {
      // const folderName = srcKey.split('/').pop();
      // const emptyFolderResponse = await generationUploadUrl({path: destPath+'/'+folderName, user_id: owner_id});

      const newDestPath = destinationPath + "/" + srcKey.split("/").pop();
      const emptyFolderResponse = await createEmptyFolder(newDestPath);
      if (emptyFolderResponse) console.log("Folder created");

      const response = await copyFolder({
        fromBucket: "vidzspace",
        fromLocation: sourceKey,
        toBucket: "vidzspace",
        toLocation: `${prefix + newDestPath}`,
      });

      return res.json({ success: true, response });
    }
    const timestamp = Date.now(); // or any other format you prefer
    const newFileName = `video_${timestamp}_${
      sourceKey.split("_").slice(-1)[0]
    }`;
    console.log("this is the name", newFileName);
    const command = new CopyObjectCommand({
      Bucket: "vidzspace",
      CopySource: `/vidzspace/${sourceKey}`,
      Key: `${prefix + destinationPath}/${newFileName}`,
      Metadata: newMetadata,
      MetadataDirective: "REPLACE",
    });
    const response = await s3Client.send(command);

    res.json({
      success: true,
      newKey: `${prefix + destinationPath}/${newFileName}`,
    });
  } catch (error) {
    console.log(error);
  }
};

const createEmptyFolder = async (path, user_id) => {
  const command = new PutObjectCommand({
    Bucket: "vidzspace",
    Key: `users/${path}/`,
  });
  const response = await s3Client.send(command);
  return response;
};

async function getUserIdsFromEmails(emails) {
  if (typeof emails === "string") {
    emails = JSON.parse(emails);
  }
  const userIds = await Promise.all(
    emails.map(async (email) => {
      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord.toJSON().uid;
    })
  );

  return userIds;
}

export const updateVideoMetadata = async (req, res, next) => {
  try {
    const { Key, sharing, sharingType, sharingWith, type, requester_id } =
      req.body;

    console.log("body", req.body);

    const sharingWithIds = await getUserIdsFromEmails(sharingWith);

    const owner_id = getOwnerIdFromObjectKey(Key);
    console.log(owner_id);
    const ownerFirebaseData = await admin.auth().getUser(owner_id);
    const ownerEmail = ownerFirebaseData.toJSON().email;

    // console.log(ownerFirebaseData);

    // Check if the requester is the owner

    console.log("request", requester_id, owner_id);
    if (requester_id !== owner_id) {
      return res.status(401).json({
        success: false,
        message: "No access to share",
      });
    }

    const command1 = new HeadObjectCommand({
      Bucket: "vidzspace",
      Key: Key,
    });
    const response1 = await s3Client.send(command1);

    let metadataCopy = response1?.Metadata;

    const originalContentType = response1?.ContentType;

    console.log(response1);

    metadataCopy.sharing = sharing || "none";
    metadataCopy.sharingtype = sharingType || "none";
    metadataCopy.sharingwith = JSON.stringify(sharingWithIds) || "[]";
    metadataCopy.ownerId = owner_id;
    metadataCopy.ownerEmail = ownerEmail;
    metadataCopy.progress = metadataCopy?.progress; // Assuming progress is a constant value

    const command2 = new CopyObjectCommand({
      Bucket: "vidzspace",
      CopySource: `/vidzspace/${Key}`,
      Key: Key,
      Metadata: metadataCopy,
      MetadataDirective: "REPLACE",
      ContentType: originalContentType,
    });
    await s3Client.send(command2);

    return res.status(200).json({
      success: true,
      newMetadata: metadataCopy,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateVideoMetadataFolder = async (req, res, next) => {
  try {
    console.log("in updatevideometadatafolder");
    const {
      path,
      sharing,
      sharingType,
      sharingWith,
      requester_id,
      userId,
      teamPath,
    } = req.body;

    //console.log("body", req.body);

    // Fetch metadata.json from the folder

    let folprefix;

    // if (path) {
    folprefix = prefix + `${userId}/${teamPath}`;
    if (path) folprefix = folprefix + `/${path}`;

    const metadataPath = `${folprefix}/metadata.json`;
    console.log("folprefix:", folprefix);
    // const metadataObject = await s3Client
    //   .getObject({
    //     Bucket: "vidzspace",
    //     Key: folprefix,
    //   })
    //   .promise();

    const params = {
      Bucket: "vidzspace",
      Prefix: folprefix,
    };
    const data = await s3Client.send(new ListObjectsV2Command(params));
    console.log(data);
    const metadataExists = data.Contents.some((item) => {
      const relativePath = item.Key.slice(params.Prefix.length);
      return relativePath === "metadata.json";
    });
    if (!metadataExists) {
      const commandMeta = new PutObjectCommand({
        Bucket: "vidzspace",
        Key: metadataPath,
        ContentType: "application/json",
      });
      const responseMeta = await s3Client.send(commandMeta);
    }

    const owner_id = getOwnerIdFromObjectKey(metadataPath); // Implement this function as per your logic
    console.log("metadatapath:", metadataPath, " ownerid:", owner_id);
    const ownerFirebaseData = await admin.auth().getUser(owner_id);
    const ownerEmail = ownerFirebaseData.toJSON().email;
    console.log("request", requester_id, owner_id);
    if (requester_id !== owner_id) {
      return res.status(401).json({
        success: false,
        message: "No access to share",
      });
    }

    const sharingWithIds = await getUserIdsFromEmails(sharingWith);

    const command1 = new HeadObjectCommand({
      Bucket: "vidzspace",
      Key: metadataPath,
    });

    const response1 = await s3Client.send(command1);

    let metadataCopy = response1?.Metadata;

    const originalContentType = response1?.ContentType;

    console.log(response1);

    metadataCopy.sharing = sharing || "none";
    metadataCopy.sharingtype = sharingType || "none";
    metadataCopy.sharingwith = JSON.stringify(sharingWithIds) || "[]";
    metadataCopy.ownerId = owner_id;
    metadataCopy.ownerEmail = ownerEmail;
    metadataCopy.progress = metadataCopy?.progress; // A

    const command2 = new CopyObjectCommand({
      Bucket: "vidzspace",
      CopySource: `/vidzspace/${metadataPath}`,
      Key: metadataPath,
      Metadata: metadataCopy,
      MetadataDirective: "REPLACE",
      ContentType: originalContentType,
    });
    await s3Client.send(command2);

    return res.status(200).json({
      success: true,
      newMetadata: metadataCopy,
    });

    // const metadata = JSON.parse(metadataObject.Body.toString());

    // console.log(metadata);

    // // Check if the requester is the owner
    // const owner_id = userId; // Implement this function as per your logic
    // console.log("request", requester_id, owner_id);
    // if (requester_id !== owner_id) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "No access to share",
    //   });
    // }

    // // Update metadata
    // const sharingWithIds = await getUserIdsFromEmails(sharingWith);
    // metadata.sharing = sharing || "none";
    // metadata.sharingtype = sharingType || "none";
    // metadata.sharingwith = JSON.stringify(sharingWithIds) || "[]";
    // metadata.ownerId = owner_id;
    // metadata.ownerEmail = ownerEmail; // Assume you have this variable set appropriately
    // metadata.progress = "Upcoming"; // Assuming progress is a constant value

    // // Save updated metadata.json back to the folder
    // await s3Client
    //   .putObject({
    //     Bucket: "vidzspace",
    //     Key: metadataPath,
    //     Body: JSON.stringify(metadata),
    //     ContentType: "application/json",
    //   })
    //   .promise();

    // return res.status(200).json({
    //   success: true,
    //   newMetadata: metadata,
    // });
    // }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteTeam = async (req, res, next) => {
  const { teamPath } = req.body;
  const { userId, teamId } = req.query;

  console.log("teamPath", userId, teamPath, teamId);

  try {
    const teamPref = `${userId}/${teamPath}`;
    const params = {
      Bucket: "vidzspace",
      Prefix: prefix + teamPref,
    };

    // List all objects under the team path
    const listCommand = new ListObjectsV2Command(params);
    const data = await s3Client.send(listCommand);

    if (!data.Contents || data.Contents.length === 0) {
      return res
        .status(404)
        .send({ message: "Team not found or already empty" });
    }

    console.log("data", data);

    const keysToDelete = data.Contents.map((obj) => obj.Key);
    const objects = keysToDelete.map((Key) => ({ Key }));

    // Delete all objects
    const delParams = {
      Bucket: "vidzspace",
      Delete: {
        Objects: objects,
        Quiet: true,
      },
    };

    const commandDel = new DeleteObjectsCommand(delParams);
    await s3Client.send(commandDel);
    await deleteTeamOperation(teamId, userId);
    return res.status(200).send({ message: "Team deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error deleting team" });
  }
};

export const renameTeam = async (req, res, next) => {
  const { newName, oldName, teamID } = req.body;
  const { userId } = req.query;
  const teamPrefix = `${prefix}${userId}/${oldName}/`;
  try {
    const listParams = {
      Bucket: "vidzspace",
      Prefix: teamPrefix,
    };
    const listCommand = new ListObjectsV2Command(listParams);
    const listedObjects = await s3Client.send(listCommand);
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      const placeholderParams = {
        Bucket: "vidzspace",
        Key: `${userId}/${newName}'s Team/`,
        Body: "",
      };
      const putCommand = new PutObjectCommand(placeholderParams);
      await s3Client.send(putCommand);

      // Optionally, delete the placeholder in the old prefix
      const deleteParams = {
        Bucket: "vidzspace",
        Key: `${userId}/${oldName}/`,
      };
      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3Client.send(deleteCommand);
      await renameTeamDB(teamID, `${newName}'s Team`,userId);
      return res.status(200).json({
        message: "Team renamed successfully with a placeholder file",
      });
    }
    // Copy each object to the new location with the new team name prefix
    for (const object of listedObjects.Contents) {
      const copyParams = {
        Bucket: "vidzspace",
        CopySource: `/${listParams.Bucket}/${object.Key}`,
        Key: object.Key.replace(
          `${userId}/${oldName}/`,
          `${userId}/${newName}'s Team/`
        ),
      };

      const copyCommand = new CopyObjectCommand(copyParams);
      await s3Client.send(copyCommand);

      // Delete the original object
      const deleteParams = {
        Bucket: "vidzspace",
        Key: object.Key,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3Client.send(deleteCommand);
    }
    await renameTeamDB(teamID, `${newName}'s Team`,userId);

    res.status(200).json({
      message: "Team renamed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error renaming team",
      error: error.message,
    });
  }
};
