import React, { useState, ChangeEvent } from "react";
import JSZip from "jszip";
import FileSaver from "file-saver";

const FilterFiles: React.FC = () => {
  const [outputFiles, setOutputFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("0");

  const handleZipDownload = async () => {
    setLoading(true); // Start loading
    const zip = new JSZip();

    // Add selected .ply files to the zip
    outputFiles.forEach((file) => {
      zip.file(file.name, file); // Add the file to the zip
    });

    // Generate the zip file with progress
    await zip
      .generateAsync({ type: "blob" }, (metadata) => {
        const percent = (metadata.percent || 0).toFixed(2);
        setProgress(percent); // Update progress
      })
      .then((blob) => {
        // Save the zip file using FileSaver.js
        FileSaver.saveAs(blob, "output.zip");
        setLoading(false); // Stop loading
      });
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    // Initialize counters for Mandibular and Maxillary files
    let mandibularCounter = 1;
    let maxillaryCounter = 1;

    if (!event.target.files) return;

    const selectedFiles: FileList = event.target.files;
    const fileList: File[] = Array.from(selectedFiles);

    // Filter out only .ply files
    const plyFiles: File[] = fileList.filter((file) =>
      file.name.toLowerCase().endsWith(".production.ply")
    );

    // Create a copy of outputFiles to avoid mutating state directly
    const updatedOutputFiles: File[] = [...outputFiles];

    // Process each .ply file
    plyFiles.forEach((file) => {
      if (file.name.includes("Mandibular")) {
        // Create a new file object for Mandibular with the updated counter
        const mandibularFile = new File([file], `Mandibular${mandibularCounter}.ply`, {
          type: file.type,
          lastModified: file.lastModified,
        });
        updatedOutputFiles.push(mandibularFile);
        mandibularCounter++; // Increment the Mandibular counter
      } else {
        // Create a new file object for Maxillary with the updated counter
        const maxillaryFile = new File([file], `Maxillary${maxillaryCounter}.ply`, {
          type: file.type,
          lastModified: file.lastModified,
        });
        updatedOutputFiles.push(maxillaryFile);
        maxillaryCounter++; // Increment the Maxillary counter
      }
    });

    // Set the selected folder and updated file list in state
    setOutputFiles(updatedOutputFiles);
  };

  return (
    <div className='p-16'>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload 3d Model Exported Folder
            </p>
          </div>
          <input
            type="file"
            id="dropzone-file"
            className="hidden"
            onChange={handleFileUpload}
            {...{ webkitdirectory: "true", directory: "true" } as React.InputHTMLAttributes<HTMLInputElement>}
          />
        </label>
      </div>
      {loading ? (
        <div>
          <h3>Loading...</h3>
          <p>Progress: {progress}%</p>
        </div>
      ) : (
        <div>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            disabled={outputFiles.length == 0} onClick={() => {
              if (outputFiles.length > 0) {
                handleZipDownload()
              }
            }}>Download</button>
        </div>
      )}
    </div>
  );
};

export default FilterFiles;
