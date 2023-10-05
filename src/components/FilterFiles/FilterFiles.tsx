import React, { useState, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import PLYPlayer from "../PLYPlayer/PLYPlayer";

const FilterFiles: React.FC = () => {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  const [mandibularFiles, setMandibularFiles] = useState<File[]>([]);
  const [maxillaryFiles, setMaxillaryFiles] = useState<File[]>([]);

  function orderFolders(folders: string[]): string[] {
    return folders.sort((a, b) => {
      if (a === "EXPORT") return 1;
      if (b === "EXPORT") return -1;

      const aMatches = a.match(/EXPORT_STEP(\d+)(_Subsetup(\d+))?/);
      const bMatches = b.match(/EXPORT_STEP(\d+)(_Subsetup(\d+))?/);

      const aStep = parseInt(aMatches?.[1] || "0", 10);
      const bStep = parseInt(bMatches?.[1] || "0", 10);

      if (aStep !== bStep) return aStep - bStep;

      if (!aMatches?.[3] || !bMatches?.[3]) {
        return aMatches?.[3] ? -1 : 1;
      }

      const aSubstep = parseInt(aMatches?.[3] || "0", 10);
      const bSubstep = parseInt(bMatches?.[3] || "0", 10);

      return aSubstep - bSubstep;
    });
  }

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const folderFilesMap: { [key: string]: File[] } = {};
    const mandibularMap: { [key: string]: File[] } = {};
    const maxillaryMap: { [key: string]: File[] } = {};

    Array.from(event.target.files).forEach((file) => {
      const folder = file.webkitRelativePath.split("/")[1];
      console.log(folder);
      if (!folderFilesMap[folder]) {
        folderFilesMap[folder] = [];
      }
      folderFilesMap[folder].push(file);
    });

    const sortedFolders = orderFolders(Object.keys(folderFilesMap));
    console.log(sortedFolders);

    sortedFolders.forEach((folder: string) => {
      folderFilesMap[folder].forEach((file) => {
        if (file.name.toLowerCase().endsWith(".production.ply")) {
          const fileInfo = {
            type: file.type,
            lastModified: file.lastModified,
          };

          if (file.name.includes("Mandibular")) {
            if (!mandibularMap[folder]) {
              mandibularMap[folder] = [];
            }
            mandibularMap[folder].push(new File([file], file.name, fileInfo));
          } else {
            if (!maxillaryMap[folder]) {
              maxillaryMap[folder] = [];
            }
            maxillaryMap[folder].push(new File([file], file.name, fileInfo));
          }
        }
      });
    });

    const updatedMandibularFiles = Object.values(mandibularMap).flat();
    const updatedMaxillaryFiles = Object.values(maxillaryMap).flat();

    setMandibularFiles([...mandibularFiles, ...updatedMandibularFiles]);
    setMaxillaryFiles([...maxillaryFiles, ...updatedMaxillaryFiles]);

    // Send the files to the worker for upload
    // worker.postMessage({
    //   type: "upload",
    //   mandibularFiles: updatedMandibularFiles,
    //   maxillaryFiles: updatedMaxillaryFiles,
    // });
  };

  worker.onmessage = (event) => {
    if (event.data.type === "progress") {
      setUploadPercentage(event.data.percentage);
      setTimeElapsed(0);
    }
    if (event.data.type === "complete") {
      setTimeElapsed(event.data.timeElapsed);
      // alert(
      //   `Files uploaded successfully. Time elapsed: ${event.data.timeElapsed} seconds`
      // );
    }
  };

  return (
    <div>
      {
        mandibularFiles.length == 0 &&
        <div style={{ margin: "40px 0 0 50px", width: "120px" }}>
        <Link to="download">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            All Models
          </button>
        </Link>
      </div>
      }
   

      {mandibularFiles.length == 0 ? (
        <div className="p-16 flex items-center justify-center w-full">
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
                <span className="font-semibold">Click to upload</span> or drag
                and drop
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
              {...({
                webkitdirectory: "true",
                directory: "true",
              } as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          </label>
        </div>
      ) : (
        <PLYPlayer
          timeElapsed={timeElapsed}
          uploadPercentage={uploadPercentage}
          mandibularFiles={mandibularFiles}
          maxillaryFiles={maxillaryFiles}
          setMandibularFiles={setMandibularFiles}
          setMaxillaryFiles={setMaxillaryFiles}
        />
      )}
    </div>
  );
};

export default FilterFiles;
