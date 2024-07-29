// DrawingContext.js
import  { createContext, useRef, useContext } from 'react';

const DrawingContext = createContext();

export const DrawingProvider = ({ children }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const setCanvasContext = (ctx) => {
    contextRef.current = ctx;
  };

  const showDrawing = (drawingDataUrl) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    console.log("enter")
    if (ctx && canvas) {
      const image = new Image();
      image.src = drawingDataUrl;
      console.log("mid")
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        console.log("used")
      };
    }
  };

  return (
    <DrawingContext.Provider value={{ canvasRef, setCanvasContext, showDrawing }}>
      {children}
    </DrawingContext.Provider>
  );
};

export const useDrawing = () => useContext(DrawingContext);

export default DrawingContext;
