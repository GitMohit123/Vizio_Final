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
import path from "path"
import archiver from "archiver";
import { s3Client } from "../s3config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import admin from "../index.js";

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
  const { teamName, user_id } = req.body;
  if (!teamName || !user_id) {
    return res
      .status(400)
      .json({ message: "Missing required fields: teamName and user_id" });
  }
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
    }
    console.log("User found");
    const params = {
      Bucket: "vidzspace",
      Key: prefix + `${user_id}/${teamName}/`,
      Body: "",
    };

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
};

function getFilesForSubfolder(subfolderKey, objects) {
  var subFiles = [];
  var subfolders = [];
  objects.map((item) => {
    if (item.Key.startsWith(subfolderKey)) {
      const relativePath = item.Key.slice(subfolderKey.length);

      // if (relativePath.endsWith("/"))
      //   subfolders.push({ Key: relativePath.slice(0, -1), Type: "folder" });
      if (relativePath.endsWith('/') && relativePath.slice(0, -1).indexOf('/') === -1) subfolders.push({ Key: relativePath.slice(0, -1), Type: "folder" });

      // if (relativePath.indexOf('/') === -1 && relativePath !== "") subFiles.push( { ...item, Key: relativePath }); //is a file
      if (relativePath.indexOf("/") === -1 && relativePath !== "")
        subFiles.push(item); //is a file
    }
  });
  return { subFiles: subFiles, subfolders: subfolders };
}

async function addMetadataAndSignedUrl(file) {
  const key = file.Key.split("/").filter(Boolean).pop();
  const fileParams = {
    Bucket: "vidzspace",
    Key: file.Key,
    ContentType: "video/mp4",
  };
  const url = await getSignedUrl(s3Client, new GetObjectCommand(fileParams));
  const metadata = await s3Client.send(new HeadObjectCommand(fileParams));
  return {
    Key: key,
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
      const folderSize = await getFolderSize(bucketName, prefix + folder.Key + "/");
      folderSizes.push({ Key: folder.Key, size: folderSize });
    }
  }

  return folderSizes;
}

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

    const params2 = {
      Bucket: "vidzspace",
      Prefix: prefix + `${path}`,
      Delimiter: "",
    };
    const data2 = await s3Client.send(new ListObjectsV2Command(params2));
    const size = await getFolderSize("vidzspace", prefix + path, data2);

    // const owner_id = getOwnerIdFromObjectKey(prefix + path);
    // var sharingDetails;

    // const hasMetadata = (data.Contents || []).filter((item) => item.Key.endsWith("metadata.json")).length > 0;
    // if(hasMetadata){
    //   console.log("has metadata")
    //   const {sharing, sharingwith, sharingtype} = await getFolderMetadata(path);
    //   if((user_id !== owner_id) && (sharing !== "public") && !(sharing === "limited" && sharingwith.includes(user_id))){ //requester has no access
    //     console.log("no access")
    //     return res.status(201).json({
    //       success: false,
    //       message: "no access"
    //     });
    //   }
    //   sharingDetails = {sharing, sharingwith, sharingtype};
    // }
    // else if (owner_id !== user_id) {
    //   return res.status(201).json({
    //     success: false,
    //     message: "no access"
    //   });
    // }

    // Extract the common prefixes (folders) and top-level files
    const folders = (data.CommonPrefixes || []).map((prefix) => ({
      Key: prefix.Prefix.split("/").filter(Boolean).pop(),
      Type: "folder",
      LastModified: null,
    }));

    console.log("reached here");

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
          if (file) {
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
    }
    console.log("Got the meta data")

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
    console.log("Got files")
    const folderSizes = await calculateFolderSizes(folders, "vidzspace", prefix + path);
    // Combine folders and files into a single array
    const result = {
      folders: folders.map((folder) => ({ ...folder, size: folderSizes.find((f) => f.Key === folder.Key)?.size || 0 })), // Add size to each folder object
      files: files,
      // sharingDetails: sharingDetails,
      size: size
    };

    return res.json(result);
  } catch (err) {
    return err;
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

  console.log("type", type, newName, path, userId, teamPath, filefoldername);

  let folprefix;
  if (!path) {
    folprefix = prefix + `${userId}/${teamPath}/`;
  } else {
    folprefix = prefix + `${userId}/${teamPath}/${path}/`;
  }

  console.log(folprefix);

  try {
    if (type === "file") {
      const copyParams = {
        Bucket: "vidzspace",
        CopySource: `/vidzspace/${folprefix}${filefoldername}`,
        Key: `${folprefix}${newName}.mp4`,
      };

      console.log("Key", copyParams?.CopySource, copyParams?.Key);

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
      return { body: Body, name: path.relative(key, item.Key) };
    };

    const fetchPromises = Contents?.map((item) => fetchFile(item));
    const files = await Promise.all(fetchPromises);

    for (const file of files) {
      // console.log("file", file.body, file.name);
      if (!file.name) {
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
    const { filename, contentType, user_id, path } =
      req.body;
    if(!filename){
      const command = new PutObjectCommand({
        Bucket:"vidzspace",
        Key:`users/${path}`
      });
      const response = await s3Client.send(command);
      return res.status(201).json({
        succcess:true,
        response
      })
    }
    const fullPath = `users/${path}/${filename}`
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
        progress: progress || "upcoming",
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

function getOwnerIdFromObjectKey(Key) { //key = users/...
  const parts = Key.split('/');
  const prefixLength = prefix.split('/').length - 1;
  // Ensure there are at least 2 parts (users, username)
  if (parts.length > prefixLength) {
    console.log(parts)
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