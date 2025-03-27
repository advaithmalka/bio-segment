"use client";


import Head from 'next/head';
import Link from 'next/link'
import { ArrowRight, Layers, Maximize, Zap, BarChart, Code, Upload, Box, RefreshCw } from 'lucide-react';


export default function Home() {

  fetch("https://advaithmalka-mito-detect-api.hf.space/")
    .then(response => console.log("Server wake-up request sent"))
    .catch(error => console.error("Error waking up server:", error));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>BioSegment | Advanced Biological Image Segmentation</title>
        <meta name="description" content="Powerful AI models for segmenting and analyzing biological images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Analyze Biological Images with Precision
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Advanced AI models that segment, count, and measure biological structures with unparalleled accuracy
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link href="/analysis">
              <button className="bg-emerald-500 hover:bg-emerald-600 py-3 px-8 rounded-lg text-lg font-medium flex items-center justify-center transition">
                Try Demo <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              </Link>
              <button className="bg-gray-800 hover:bg-gray-700 py-3 px-8 rounded-lg text-lg font-medium flex items-center justify-center border border-gray-700 transition">
                View Documentation
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="bg-emerald-500/20 p-3 rounded-lg w-fit mb-4">
                  <Layers className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Mitochondria Counting</h3>
                <p className="text-gray-300">
                  Automatically identify and count mitochondria in electron microscopy images with over 95% accuracy.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                  <Maximize className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Protein Length Measurement</h3>
                <p className="text-gray-300">
                  Precisely measure protein filament lengths in fluorescence microscopy images with nanometer precision.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Cell Membrane Segmentation</h3>
                <p className="text-gray-300">
                  Accurately detect and segment cell membranes in confocal microscopy images for morphological analysis.
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="bg-pink-500/20 p-3 rounded-lg w-fit mb-4">
                  <BarChart className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quantitative Analysis</h3>
                <p className="text-gray-300">
                  Generate comprehensive statistics and visualizations of biological structures for research and publications.
                </p>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                  <Code className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">API Integration</h3>
                <p className="text-gray-300">
                  Seamlessly integrate our models into your existing workflow with our well-documented REST API.
                </p>
              </div>
              
              {/* Feature 6 */}
              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Batch Processing</h3>
                <p className="text-gray-300">
                  Process thousands of images in parallel with our high-performance computing infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Ready to transform your biological image analysis?
            </h2>
            <button className="bg-emerald-500 hover:bg-emerald-600 py-3 px-8 rounded-lg text-lg font-medium transition">
              Get Started Today
            </button>
          </div>
        </section>
      </main>

    
    </div>
  );
}
