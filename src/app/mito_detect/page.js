"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Layers, Maximize, Zap, BarChart, Code, Upload, Box, RefreshCw , ArrowDown} from 'lucide-react';
import UTIF from 'utif';
import axios from 'axios';
import Image from 'next/image'

export default function Home() {
    const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(null);
    const fileInputRef = useRef(null);
    // const SERVER_URL = "http://127.0.0.1:5000/predict" // dev
    const SERVER_URL = "https://advaithmalka-mito-detect-api.hf.space/predict" // prod

    const [sampleImages] = useState([
       `${BASE_PATH}/images/6800x-120kv-0010.png`,  
       `${BASE_PATH}/images/6800x-120kv-0011.png`, 
       `${BASE_PATH}/images/6800x-120kv-0028.png`, 
  ]);

    const handleSampleImageSelect = async (sampleImage) => {
        try {
          // Fetch the sample image as a File object
          const response = await fetch(sampleImage);
          const blob = await response.blob();
          const file = new File([blob], `sample_image.png`, { type: 'image/png' });
        
          // Update state as if a file was uploaded
          setFile(file);
          setResult(null);
          setImageError(null);
        
          // Create object URL for preview
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
        } catch (error) {
          console.error('Error selecting sample image:', error);
          setImageError('Error processing sample image');
        }
      };

  
    const handleTiffFile = (selectedFile) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = function() {
          try {
            const ifds = UTIF.decode(this.result);
            if (!ifds || ifds.length === 0) {
              throw new Error("Failed to decode TIFF file");
            }
  
            const firstFrame = ifds[0];
            UTIF.decodeImage(this.result, firstFrame);
  
            const rgba = UTIF.toRGBA8(firstFrame);
            const width = firstFrame.width;
            const height = firstFrame.height;
  
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
  
            tempCanvas.width = width;
            tempCanvas.height = height;
  
            const imgData = tempCtx.createImageData(width, height);
            const copyLength = Math.min(rgba.length, imgData.data.length);
            
            for (let i = 0; i < copyLength; i++) {
              imgData.data[i] = rgba[i];
            }
  
            tempCtx.putImageData(imgData, 0, 0);
            const pngDataUrl = tempCanvas.toDataURL('image/png');
  
            const img = new Image();
            img.onload = () => {
              resolve({
                image: img,
                url: pngDataUrl,
                originalWidth: width,
                originalHeight: height
              });
            };
  
            img.onerror = (err) => {
              reject(new Error("Failed to load converted TIFF image"));
            };
  
            img.src = pngDataUrl;
          } catch (error) {
            reject(error);
          }
        };
  
        fileReader.onerror = function() {
          reject(new Error("Error reading the file"));
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
  
      const isTiff = selectedFile.type === 'image/tiff' || 
                    selectedFile.type === 'image/tif' || 
                    selectedFile.name.toLowerCase().endsWith('.tiff') || 
                    selectedFile.name.toLowerCase().endsWith('.tif');
  
      if (isTiff) {
        handleTiffFile(selectedFile)
          .then(result => {
            setPreviewUrl(result.url);
          })
          .catch(error => {
            setImageError(`Error processing TIFF file: ${error.message}`);
          });
      } else {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
      }
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            alert('Please select an image first');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
    
        setLoading(true);
        
        try {
            const response = await axios.post(SERVER_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'  // Important for file uploads
                }
            });
    
            setResult(response.data);  // Handle response data
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const fileName = file.name.substring(0, file.name.lastIndexOf("."));
        const byteCharacters = atob(result.mask);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/tif' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}_mask.tif`;
        link.click();
    }
  
    const handleReset = () => {
      setFile(null);
      setPreviewUrl(null);
      setResult(null);
    };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <title>BioSegment | Advanced Biological Image Segmentation</title>
      <meta name="description" content="Powerful AI models for segmenting and analyzing biological images" />
      <link rel="icon" href="/favicon.ico" />

      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Segment Mitochondria with AI
            </span>
          </h2>
          
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="bg-emerald-500/20 p-2 rounded-lg mr-3">
                  <Upload className="h-5 w-5 text-emerald-400" />
                </span>
                Upload your image
              </h3>
              
              <div 
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-8 cursor-pointer hover:bg-gray-800 transition"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.tif,.tiff"
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

              {!previewUrl && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-center text-gray-300">
                    Or try a sample image
                    </h4>
                    <div className="flex justify-center space-x-4">
                    {sampleImages.map((image, index) => (
                        <div 
                        key={index} 
                        className="cursor-pointer hover:opacity-80 transition"
                        onClick={() => handleSampleImageSelect(image)}
                        >
                        <Image 
                            src={image} 
                            width={300} height={300}
                            className="object-cover rounded-lg border-2 border-transparent hover:border-emerald-500"
                        />
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </div>

            {previewUrl && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-blue-500/20 p-2 rounded-lg mr-3">
                    <Box className="h-5 w-5 text-blue-400" />
                  </span>
                  Uploaded Image
                </h3>
                
                <div className="flex flex-col items-center">
                  <div className="max-w-full overflow-auto bg-gray-800 p-2 rounded-lg mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Uploaded" 
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {previewUrl && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-purple-500/20 p-2 rounded-lg mr-3">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </span>
                  Process Image
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
                    {/* Original Image */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-lg font-medium mb-3 text-center">Original Image</h4>
                        <img 
                            src={previewUrl} 
                            alt="Original" 
                            className="w-full rounded-lg"
                        />
                    </div>

                    {/* Overlay Image */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-lg font-medium mb-3 text-center">Overlay</h4>
                        <img 
                            src={`data:image/png;base64,${result.overlay}`} 
                            alt="Overlay" 
                            className="w-full rounded-lg"
                        />
                    </div>
                </div>


                <div className='mt-8 text-center'>
                <button
                    onClick={handleDownload}
                    className={`mx-auto bg-emerald-500 hover:bg-emerald-600 py-3 px-8 rounded-lg text-lg font-medium flex items-center justify-center transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                    Download Mask (.tif)
                    <ArrowDown className="ml-2 h-5 w-5" />
                </button>
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
    </div>
  );
}