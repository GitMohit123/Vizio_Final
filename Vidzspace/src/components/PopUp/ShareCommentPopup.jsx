import React, { useContext, useState } from "react";
import HomeContext from "../../context/homePage/HomeContext";
import { useRef, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { shareVideo } from "../../api/s3Objects";
const ShareCommentPopup = ({ file }) => {
  console.log(file);

  const { user } = useContext(HomeContext);

  const [emailInput, setEmailInput] = useState("");
  const [peopleWithAccess, setPeopleWithAccess] = useState([]);
  const [accessLevel, setAccessLevel] = useState("view");
  const [sharing, setSharing] = useState("none");
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharingLink, setSharingLink] = useState("");

  //http://127.0.0.1:3000/home/dXNlcnMvVWZCM3dXbEtmMlVBYXVkVHdLdUNUQnRCTXdtMS9BbnVyYWcgTGVlbGEgS2Fuc3dhbCdzIFRlYW0vYW51L3ZpZGVvXzE3MjEwNDM1NTIyMDhfZm9yZXN0IC0gQ29weSAtIENvcHkubXA0
  const sendEmail = (link) => {
    const serviceID = 'service_9a66w2u';
    const templateID = 'template_civ28jp';
    const userID = 'B_ASROg3yW9J0SFad';
    const to_name = peopleWithAccess[0];
    const name = user.name;
    const email = user.email;
    const templateParams = {
      from_name: name,
      to_name: to_name,
      reply_to: email,
      link: link,
    };
    emailjs.send(serviceID, templateID, templateParams, userID)
      .then((result) => {
        console.log("SUCCESS!", result.status, result.text);
      }, (error) => {
        console.log(error);
          console.log('Failed to send email:', error.text);
      });
  };
  const { isShareCommentPopup, setIsShareCommentPopup } =
    useContext(HomeContext);

  const popupRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setIsShareCommentPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isShareCommentPopup]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const sharingDetails = {
        name: file?.Key,
        url: file?.SignedUrl,
        sharingWith: peopleWithAccess ?? [],
        sharingType: accessLevel,
        sharing: sharing,
      };

      console.log(user);

      console.log(sharingDetails);

      if (file?.Type === "file") {
        const response = await shareVideo({
          sharingWith: peopleWithAccess ?? [],
          sharingType: accessLevel,
          sharing: sharing,
          url: file?.SignedUrl,
          requester_id: user?.user_id,
          type: file?.type,
        });

        setSharingLink(response?.sharingLink);
        sendEmail(response.sharingLink)
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(linkCopied);
    console.log(sharingLink);
    console.log(sharing);
  }, [linkCopied, sharingLink, sharing]);

  const handleCopyLink = () => {
    navigator?.clipboard
      ?.writeText(sharingLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="absolute top-0 right-0 p-2 max-w-lg max-h-full mx-auto w-full text-white z-20 drop-shadow-xl">
      <div
        ref={popupRef}
        className="relative bg-[#242426] rounded-lg shadow-lg dark:bg-[#2f2f2f] "
      >
        <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 className="text-lg font-semibold">{`Share`}</h3>
          <div className="flex space-x-2">
            <button className=" ">Help</button>
            <button className="">Settings</button>
            <button
              type="button"
              onClick={() => {
                setIsShareCommentPopup(false);
              }}
              className="text-gray-400 bg-transparent hover:bg-yellow-300 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="crud-modal"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        </div>
        <div className="p-4">
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">
                Add People
              </label>
              <div className="flex flex-wrap items-center  border   text-sm rounded-lg focus:ring-primary-600 border-white p-2.5 mt-2 bg-white">
                {/* {peopleWithAccess?.map((email, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 mr-2 mb-2"
                      >
                        {email}
                      </span>
                    ))} */}
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="flex-grow bg-transparent outline-none text-black"
                  placeholder="Enter email"
                  //   value={emailInput}
                  //   onChange={handleEmailInputChange}
                  //   onKeyPress={handleEmailKeyPress}
                  value={peopleWithAccess}
                  onChange={(e) => setPeopleWithAccess([e.target.value])}
                  style={{
                    flex: "1 1 auto",
                    minWidth: "150px",
                    paddingLeft: "5px",
                    width: "100%",
                    height: "100%",

                    backgroundColor: "transparent",
                    fontSize: "1rem", // Adjust font size as needed
                    // fontWeight: "bold",
                    border: "none",

                    outline: "none",
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="access" className="block text-sm font-medium ">
                Access
              </label>
              <select
                id="access"
                // value={accessLevel}
                // onChange={handleAccessChange}
                className=" border bg-transparent  text-gray-400 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 mt-4 block w-full p-2.5 dark:bg-white dark:border-gray-500 placeholder-gray-300 border-white"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
              >
                <option value="view" className="text-black">
                  Viewer
                </option>
                <option value="edit" className="text-black">
                  Editor
                </option>
              </select>
              <select
                id="sharing"
                // value={sharing}
                // onChange={handleSharing}
                className="border bg-transparent  text-gray-400 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 mt-4 block w-full p-2.5 dark:bg-white dark:border-gray-500 placeholder-gray-300 border-white"
                value={sharing}
                onChange={(e) => setSharing(e.target.value)}
              >
                <option value="onlyMe" className="text-black">
                  Only Me
                </option>
                <option value="limited" className="text-black">
                  Limited
                </option>
                <option value="public" className="text-black">
                  Anyone with the link
                </option>
              </select>
            </div>
            {/* {sharing === "limited" && peopleWithAccess?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      People with access
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
                      {peopleWithAccess?.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {email}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {accessLevel.charAt(0).toUpperCase() +
                              accessLevel.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sharing !== "none" && sharingLink && (
                  <div className="flex justify-between items-center">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Copy Link
                      </button>
                      {linkCopied && (
                        <span
                          className="absolute left-full ml-2 text-sm text-green-500 opacity-0 transition-opacity duration-200 ease-in-out"
                          style={{ opacity: linkCopied ? 1 : 0 }}
                        >
                          Link copied
                        </span>
                      )}
                    </div>
                  </div>
                )} */}
            <div className="flex justify-between">
              <button className="text-gray-400">Invite Only</button>
              <button
                type="submit"
                className="p-2 bg-[#f8ff2a] px-6 rounded-xl
               cursor-pointer text-gray-900 font-bold"
              >
                Share
              </button>
            </div>
            {sharing !== "none" && sharingLink && (
              <div className="flex justify-between items-center">
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Copy Link
                  </button>
                  {linkCopied && (
                    <span
                      className="absolute left-full ml-2 text-sm text-green-500 opacity-0 transition-opacity duration-200 ease-in-out"
                      style={{ opacity: linkCopied ? 1 : 0 }}
                    >
                      Link copied
                    </span>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareCommentPopup;
