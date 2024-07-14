import React, { useEffect } from "react";
import { threeDotsMenuList } from "../../constants/projectsPage";
import { useRef } from "react";

const SidebarComponent = ({
  folderfile,
  closeSidebar,
  handleThreeDotClick,
}) => {
  const sidebarRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  return (
    <div
      ref={sidebarRef}
      className="absolute left-2 top-10 h-50 bg-gray-900 z-30 py-1 rounded-xl"
    >
      <div className="flex flex-col text-left">
        <p
          className="text-[#f8ff2a] hover:bg-slate-800 py-1 px-6 rounded-xl"
          onClick={closeSidebar}
        >
          Close
        </p>
        {threeDotsMenuList?.map((option, index) => {
          return (
            <p
              onClick={() =>
                handleThreeDotClick(option.option, folderfile, index)
              }
              className="text-white hover:bg-slate-800 py-1 px-6 rounded-xl"
            >
              {option.option}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarComponent;
