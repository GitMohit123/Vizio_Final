import React, { useContext, useRef, useState, useEffect } from "react";
import ProjectContext from "../../context/project/ProjectContext";
import CommentForm from "./CommentForm";
import { FaPencilAlt, FaEraser, FaSave } from "react-icons/fa";

const VideoBox = ({ file }) => {
  const { setVideoTimeMin, setVideoTimeSec } = useContext(ProjectContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [toolMode, setToolMode] = useState("draw"); // 'draw' or 'erase'
  const [drawings, setDrawings] = useState([]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
 
      video.addEventListener("seeked", () => {
        const currentTime = Math.floor(video.currentTime);
        const mins = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        setVideoTimeSec(seconds);
        setVideoTimeMin(mins);
      });
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      setContext(ctx);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "red"; // Default drawing color
    }
  }, [setVideoTimeMin, setVideoTimeSec]);

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    if (context && toolMode === "draw") {
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    } else if (toolMode === "erase") {
      setIsDrawing(true);
      handleErase(e);
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    if (isDrawing && context && toolMode === "draw") {
      context.lineTo(x, y);
      context.stroke();
    } else if (isDrawing && context && toolMode === "erase") {
      handleErase(e);
    }
  };

  const handleMouseUp = () => {
    if (context && toolMode === "draw") {
      context.closePath();
      setIsDrawing(false);
    } else if (toolMode === "erase") {
      setIsDrawing(false);
    }
  };

  const handleErase = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    if (context) {
      context.clearRect(x - 5, y - 5, 10, 10);
    }
  };

  const toggleToolMode = (mode) => {
    setToolMode(mode);
    if (mode === "draw") {
      canvasRef.current.style.cursor = "crosshair";
    } else if (mode === "erase") {
      canvasRef.current.style.cursor = "cell";
    }
  };

  const saveDrawing = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    // Create a new canvas to combine both video and drawing
    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height;
    const combinedCtx = combinedCanvas.getContext("2d");

    // Draw the current video frame onto the combined canvas
    combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);

    // Draw the existing canvas drawing onto the combined canvas
    combinedCtx.drawImage(canvas, 0, 0);

    // Save the combined image
    const drawing = combinedCanvas.toDataURL("image/png");
    const timestamp = videoRef.current.currentTime;

    setDrawings((prevDrawings) => [
      ...prevDrawings,
      { drawing, timestamp },
    ]);

    console.log(drawings); // Log the saved drawings to check if it works
  };

  return (
    <div className="w-full lg:w-[56rem] lg:ml-24 lg:mt-10 relative">
      <div className="flex flex-col gap-8 text-white justify-center px-4 mt-4 items-center">
        <div className="w-full h-full lg:h-[27rem] relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            id="myVideo"
            src={file?.SignedUrl}
            type="video/mp4"
            controls
           
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-[370px]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: toolMode === "draw" ? "crosshair" : "auto" }}
          />
          <div className="absolute top-0 right-0 m-4 flex gap-4">
            <FaPencilAlt
              className={`cursor-pointer ${
                toolMode === "draw" ? "text-blue-500" : "text-white"
              }`}
              onClick={() => toggleToolMode("draw")}
              size={24}
            />
            <FaEraser
              className={`cursor-pointer ${
                toolMode === "erase" ? "text-red-500" : "text-white"
              }`}
              onClick={() => toggleToolMode("erase")}
              size={24}
            />
            <FaSave
              className="cursor-pointer text-white"
              onClick={saveDrawing}
              size={24}
            />
          </div>
        </div>
        {/* Comment Form */}
        <CommentForm file={file} />
      </div>
    </div>
  );
};

export default VideoBox;
