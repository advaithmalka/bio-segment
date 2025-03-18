"use client";

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { ArrowRight, Layers, Maximize, Zap, BarChart, Code, Upload, Box, RefreshCw } from 'lucide-react';
import UTIF from 'utif';

export default function Home() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawingBox, setDrawingBox] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(null);
  const [selectedBoxIndices, setSelectedBoxIndices] = useState([]);
  const [hoveredBoxIndex, setHoveredBoxIndex] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const THRESHOLD_PERCENTAGE = 0.001;

  const handleTiffFile = (selectedFile) => {
    console.log("Processing TIFF file with utif.js");
    setImageError(null);

    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
      fileReader.onload = function() {
        try {
          // Decode the TIFF file
          const ifds = UTIF.decode(this.result);
          if (!ifds || ifds.length === 0) {
            throw new Error("Failed to decode TIFF file");
          }

          // Get the first image frame
          const firstFrame = ifds[0];
          UTIF.decodeImage(this.result, firstFrame);

          // Convert to RGBA format
          const rgba = UTIF.toRGBA8(firstFrame);

          // Get dimensions
          const width = firstFrame.width;
          const height = firstFrame.height;

          console.log(`TIFF dimensions: ${width}x${height}`);

          if (!width || !height || width <= 0 || height <= 0) {
            throw new Error("Invalid TIFF dimensions");
          }

          // Create temporary canvas for conversion
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');

          // Set canvas dimensions
          tempCanvas.width = width;
          tempCanvas.height = height;

          // Create image data
          const imgData = tempCtx.createImageData(width, height);

          // Fill image data with RGBA values
          if (rgba.length !== width * height * 4) {
            console.warn("RGBA data length doesn't match expected size", rgba.length, width * height * 4);
          }

          // Make sure we don't exceed the buffer size
          const copyLength = Math.min(rgba.length, imgData.data.length);
          for (let i = 0; i < copyLength; i++) {
            imgData.data[i] = rgba[i];
          }

          tempCtx.putImageData(imgData, 0, 0);

          // Convert to PNG
          const pngDataUrl = tempCanvas.toDataURL('image/png');

          // Create an image object
          const img = new Image();

          img.onload = () => {
            console.log(`TIFF converted to PNG: ${img.width}x${img.height}`);
            resolve({
              image: img,
              url: pngDataUrl,
              originalWidth: width,
              originalHeight: height
            });
          };

          img.onerror = (err) => {
            console.error("Failed to load converted TIFF image:", err);
            reject(new Error("Failed to load converted TIFF image"));
          };

          img.src = pngDataUrl;
        } catch (error) {
          console.error("Error processing TIFF file:", error);
          reject(error);
        }
      };

      fileReader.onerror = function() {
        const error = new Error("Error reading the file");
        console.error("FileReader error:", this.error);
        reject(error);
      };

      fileReader.readAsArrayBuffer(selectedFile);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setImageError(null);
    setBoxes([]);

    const isTiff = selectedFile.type === 'image/tiff' || 
                  selectedFile.type === 'image/tif' || 
                  selectedFile.name.toLowerCase().endsWith('.tiff') || 
                  selectedFile.name.toLowerCase().endsWith('.tif');

    if (isTiff) {
      handleTiffFile(selectedFile)
        .then(result => {
          imageRef.current = result.image;
          setPreviewUrl(result.url);
          setTimeout(() => initCanvas(result.image), 100);
        })
        .catch(error => {
          console.error("TIFF processing error:", error);
          setImageError(`Error processing TIFF file: ${error.message}`);
        });
    } else {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      const img = new Image();
      img.onload = () => {
        console.log(`Image loaded with dimensions: ${img.width}x${img.height}`);
        imageRef.current = img;
        setTimeout(() => initCanvas(img), 100);
      };
      img.onerror = (err) => {
        console.error("Image load error:", err);
        setImageError("Failed to load image. Please try a different file.");
      };
      img.src = objectUrl;
    }
  };

  const initCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas reference is null");
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    let width = img.width;
    let height = img.height;

    canvas.width = width;
    canvas.height = height;
    console.log(`Canvas initialized with dimensions: ${canvas.width}x${canvas.height}`);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      ctx.drawImage(img, 0, 0, width, height);
    } catch (error) {
      console.error("Error drawing image on canvas:", error);
      setImageError("Error displaying the image. The image might be corrupted.");
    }
  };

  const handleMouseDown = (e) => {
    if (!previewUrl || !canvasRef.current) return;
  
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
    let clickedIndex = null;
    boxes.forEach((box, index) => {
      const updated_x1 = Math.min(box.x1, box.x2);
      const updated_x2 = Math.max(box.x1, box.x2);
      const updated_y1 = Math.min(box.y1, box.y2);
      const updated_y2 = Math.max(box.y1, box.y2);
      if (x >= updated_x1 && x <= updated_x2 && y >= updated_y1 && y <= updated_y2) {
        clickedIndex = index;
      }
    });
  
    if (clickedIndex !== null) {
      setSelectedBoxIndices((prevSelected) => {
        if (prevSelected.includes(clickedIndex)) {
          return prevSelected.filter((index) => index !== clickedIndex);
        } else {
          return [...prevSelected, clickedIndex];
        }
      });
    } else {
      const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
      setDrawingBox(true);
      setStartPos({ x, y });
      setBoxes([...boxes, { x1: x, y1: y, x2: x, y2: y, color: randomColor }]);
    }
  };

  const handleMouseMove = (e) => {
    if (!previewUrl || !canvasRef.current) return;
  
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
    if (!drawingBox) {
      let hoveredIndex = null;
      boxes.forEach((box, index) => {
        const updated_x1 = Math.min(box.x1, box.x2);
        const updated_x2 = Math.max(box.x1, box.x2);
        const updated_y1 = Math.min(box.y1, box.y2);
        const updated_y2 = Math.max(box.y1, box.y2);
        if (x >= updated_x1 && x <= updated_x2 && y >= updated_y1 && y <= updated_y2) {
          hoveredIndex = index;
        }
      });
  
      if (hoveredIndex !== hoveredBoxIndex) {
        setHoveredBoxIndex(hoveredIndex);
      }
    }
  
    if (drawingBox) {
      const updatedBoxes = [...boxes];
      const currentBox = updatedBoxes[updatedBoxes.length - 1];
      currentBox.x2 = x;
      currentBox.y2 = y;
      setBoxes(updatedBoxes);
    }
  };

  const handleMouseUp = () => {
    setDrawingBox(false);
  
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const width = canvas.width;
    const height = canvas.height;
    const totalArea = width * height;
  
    const currentBox = boxes[boxes.length - 1];
    if (!currentBox) return;

    const boxWidth = Math.abs(currentBox.x2 - currentBox.x1);
    const boxHeight = Math.abs(currentBox.y2 - currentBox.y1);
    const boxArea = boxWidth * boxHeight;
  
    if (boxArea / totalArea < THRESHOLD_PERCENTAGE) {
      setBoxes(boxes.slice(0, -1));
    }
  };

  const drawImageAndBoxes = () => {
    if (!previewUrl || !canvasRef.current || !imageRef.current) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    ctx.drawImage(imageRef.current, 0, 0);
  
    boxes.forEach((box, index) => {
      const width = box.x2 - box.x1;
      const height = box.y2 - box.y1;
      ctx.strokeStyle = box.color;
      ctx.lineWidth = 2;
      ctx.fillStyle = box.color.replace('hsl(', 'hsla(').replace(')', ', 0.2)');
      if (index === hoveredBoxIndex) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 4;
      }
      if (selectedBoxIndices.includes(index)) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 4;
      }
      ctx.strokeRect(box.x1, box.y1, width, height);
      ctx.fillRect(box.x1, box.y1, width, height);
    });
  };

  useEffect(() => {
    if (previewUrl) {
      drawImageAndBoxes();
    }
  }, [boxes, previewUrl, hoveredBoxIndex, selectedBoxIndices]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setBoxes((prevBoxes) => prevBoxes.filter((_, index) => !selectedBoxIndices.includes(index)));
        setSelectedBoxIndices([]);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedBoxIndices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an image first');
      return;
    }
  
    if (boxes.length === 0) {
      alert('Please create at least one box');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    
    const boxesData = boxes.map(box => {
      const x1 = Math.round(Math.min(box.x1, box.x2));
      const y1 = Math.round(Math.min(box.y1, box.y2));
      const x2 = Math.round(Math.max(box.x1, box.x2));
      const y2 = Math.round(Math.max(box.y1, box.y2));
      
      return [x1, y1, x2, y2];
    });
    
    formData.append('boxes', JSON.stringify(boxesData));
  
    setLoading(true);
    try {
      // Changed endpoint from /segment/ to /segment-multiple/
      const response = await fetch('http://localhost:8000/segment-multiple/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setBoxes([]);
    setResult(null);
    imageRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
        <title>BioSegment | Advanced Biological Image Segmentation</title>
        <meta name="description" content="Powerful AI models for segmenting and analyzing biological images" />
        <link rel="icon" href="/favicon.ico" />

        {/* Improved Upload and Segmentation Section */}
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                Analyze Your Biological Images
              </span>
            </h2>
            
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-emerald-500/20 p-2 rounded-lg mr-3">
                    <Upload className="h-5 w-5 text-emerald-400" />
                  </span>
                  Step 1: Upload your image
                </h3>
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-8 cursor-pointer hover:bg-gray-800 transition" onClick={() => document.getElementById('fileInput').click()}>
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  {!previewUrl ? (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-300 text-center">Drag and drop your biological image here or click to browse</p>
                      <p className="text-gray-500 text-sm mt-2">Supported formats: PNG, JPG, TIFF</p>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-emerald-400 mb-2">Image uploaded successfully!</p>
                      <button 
                        className="text-gray-400 hover:text-gray-300 text-sm underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                      >
                        Clear and upload a different image
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {previewUrl && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="bg-blue-500/20 p-2 rounded-lg mr-3">
                      <Box className="h-5 w-5 text-blue-400" />
                    </span>
                    Step 2: Select region of interest
                  </h3>
                  
                  <div className="flex flex-col items-center">
                    <div className="max-w-full overflow-auto bg-gray-800 p-2 rounded-lg mb-4 relative">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="max-w-full cursor-crosshair"
                      />
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">
                      Click and drag to draw a box around the region you want to segment
                    </p>
                  </div>
                </div>
              )}

              {previewUrl && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="bg-purple-500/20 p-2 rounded-lg mr-3">
                      <Zap className="h-5 w-5 text-purple-400" />
                    </span>
                    Step 3: Process image
                  </h3>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`bg-emerald-500 hover:bg-emerald-600 py-3 px-8 rounded-lg text-lg font-medium flex items-center justify-center transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Segment Image
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="mb-8 text-center">
                  <div className="bg-gray-800 p-10 rounded-lg flex flex-col items-center">
                    <RefreshCw className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Analyzing your image...</h3>
                    <p className="text-gray-400">Our AI models are processing your biological image</p>
                  </div>
                </div>
              )}
              
              {result && !loading && (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="bg-green-500/20 p-2 rounded-lg mr-3">
                      <BarChart className="h-5 w-5 text-green-400" />
                    </span>
                    Results
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-3 text-center">Segmentation Mask</h4>
                      <img 
                        src={`http://localhost:8000/${result.mask_path}`} 
                        alt="Mask" 
                        className="w-full rounded-lg"
                      />
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-3 text-center">Overlay</h4>
                      <img 
                        src={`http://localhost:8000/${result.overlay_path}`} 
                        alt="Overlay" 
                        className="w-full rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleReset}
                      className="bg-gray-700 hover:bg-gray-600 py-2 px-6 rounded-lg text-base font-medium transition"
                    >
                      Process another image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-4">BioSegment</h3>
              <p className="text-gray-400">
                Advanced AI solutions for biological image analysis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Models</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">API Reference</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition">About</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>© 2025 BioSegment. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}