import { useRef, useEffect, useState, useContext } from 'react';
import ProjectContext from "../../context/project/ProjectContext";
import CommentForm from './CommentForm';
import { useDrawing } from '../../context/drawing/DrawingContext';

const VideoBox = ({ file }) => {
  const { canvasRef, setCanvasContext } = useDrawing();
  const videoRef = useRef(null);
  const { setVideoTimeMin, setVideoTimeSec } = useContext(ProjectContext);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [toolMode, setToolMode] = useState('pencil');
  const [color, setColor] = useState('red'); 
  // const { showDrawing } = useDrawing()
  useEffect(() => {
    const video = videoRef.current;

    const updateVideoTime = () => {
      const currentTime = Math.floor(video.currentTime);
      const mins = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;
      setVideoTimeSec(seconds);
      setVideoTimeMin(mins);
    };

    if (video) {
      video.addEventListener("seeked", () => {
        updateVideoTime();
        clearCanvas(); 
      });

      video.addEventListener("play", () => {
        clearCanvas(); 
      });

      video.addEventListener("pause", updateVideoTime);
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      setContext(ctx);
      setCanvasContext(ctx); // Set context in global state
      ctx.lineWidth = 3;
      ctx.strokeStyle = color; 
    }

    return () => {
      if (video) {
        video.removeEventListener("seeked", updateVideoTime);
        video.removeEventListener("play", clearCanvas);
        video.removeEventListener("pause", updateVideoTime);
      }
    };
  }, [setVideoTimeMin, setVideoTimeSec, color, setCanvasContext]);

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    if (toolMode === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }

    const { x, y } = getCanvasCoordinates(e);
    if (context) {
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(e);
    if (context) {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && context) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    if (context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const saveDrawing = () => {
    return new Promise((resolve) => {
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL();
        setDrawings(dataUrl);
        resolve(dataUrl); // Resolve with the data URL
        console.log(dataUrl,"Very very very")
      } else {
        resolve(null);
      }
    });
  };

  return (
    <div className="w-full lg:w-[56rem] lg:ml-24 lg:mt-10 relative">
      <div className="flex flex-col gap-8 text-white justify-center px-4 mt-4 items-center">
        <div className="w-full h-full lg:h-[27rem] relative">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
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
          />
        </div>
        <CommentForm
          file={file}
          toolMode={toolMode}
          setToolMode={setToolMode}
          saveDrawing={saveDrawing}
          clearCanvas={clearCanvas}
          setColor={setColor}
          drawings={drawings}
          setDrawings={setDrawings}
        />
      </div>
    </div>
  );
};

export default VideoBox;
