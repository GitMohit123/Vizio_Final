// VideoBox.js
import  { useRef, useEffect, useState, useContext } from 'react';

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
  const { showDrawing } = useDrawing()
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("seeked", () => {
        const currentTime = Math.floor(video.currentTime);
        const mins = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        setVideoTimeSec(seconds);
        setVideoTimeMin(mins);
        clearCanvas(); 
      });

      video.addEventListener("play", () => {
        clearCanvas(); 
      });
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      setContext(ctx);
      setCanvasContext(ctx); // Set context in global state
      ctx.lineWidth = 3;
      ctx.strokeStyle = color; 
    }
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
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      const timestamp = videoRef.current.currentTime;
      setDrawings(dataUrl);
    }
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
        <div className="flex gap-2 mt-4">
          {/* {drawings.map((drawing, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center"
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'white',
                borderRadius: '50%',
                cursor: 'pointer',
                transform: 'scale(1)',
                transition: 'transform 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={() => showDrawing(drawing.drawing)}
            >
              <div
                className="absolute flex items-center justify-center"
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#3399FF',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '10px'
                }}
              >
                {Math.floor(drawing.timestamp / 60)}:
                {Math.floor(drawing.timestamp % 60)}
              </div>
            </div>
          ))} */}
        </div>
        <CommentForm
          file={file}
          toolMode={toolMode}
          setToolMode={setToolMode}
          saveDrawing={saveDrawing}
          clearCanvas={clearCanvas}
          setColor={setColor}
          drawings={drawings}
        />
      </div>
    </div>
  );
};

export default VideoBox;
