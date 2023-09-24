import React, { useState, ChangeEvent } from "react";
import PLYPlayer from "../PLYPlayer/PLYPlayer";

const FilterFiles: React.FC = () => {
  const [mandibularFiles, setMandibularFiles] = useState<File[]>([]);
  const [maxillaryFiles, setMaxillaryFiles] = useState<File[]>([]);

  // const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
  //   let mandibularCounter = 1;
  //   let maxillaryCounter = 1;

  //   if (!event.target.files) return;

  //   const selectedFiles: FileList = event.target.files;
  //   const fileList: File[] = Array.from(selectedFiles);

  //   const plyFiles: File[] = fileList.filter((file) =>
  //     file.name.toLowerCase().endsWith(".production.ply")
  //   );

  //   const updatedMandibularFiles: File[] = [...mandibularFiles];
  //   const updatedMaxillaryFiles: File[] = [...maxillaryFiles];

  //   plyFiles.forEach((file) => {
  //     if (file.name.includes("Mandibular")) {
  //       const mandibularFile = new File(
  //         [file],
  //         `Mandibular${mandibularCounter}.ply`,
  //         {
  //           type: file.type,
  //           lastModified: file.lastModified,
  //         }
  //       );
  //       updatedMandibularFiles.push(mandibularFile);
  //       mandibularCounter++; 
  //     } else {
  //       const maxillaryFile = new File(
  //         [file],
  //         `Maxillary${maxillaryCounter}.ply`,
  //         {
  //           type: file.type,
  //           lastModified: file.lastModified,
  //         }
  //       );
  //       updatedMaxillaryFiles.push(maxillaryFile);
  //       maxillaryCounter++; 
  //     }
  //   });

  //   setMandibularFiles(updatedMandibularFiles);
  //   setMaxillaryFiles(updatedMaxillaryFiles);
  // };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
  
    let mandibularCounter = 1;
    let maxillaryCounter = 1;
    const updatedMandibularFiles: File[] = [];
    const updatedMaxillaryFiles: File[] = [];
  
    Array.from(event.target.files).forEach((file) => {
      if (file.name.toLowerCase().endsWith(".production.ply")) {
        const fileInfo = {
          type: file.type,
          lastModified: file.lastModified,
        };
  
        if (file.name.includes("Mandibular")) {
          updatedMandibularFiles.push(new File([file], `Mandibular${mandibularCounter}.ply`, fileInfo));
          mandibularCounter++;
        } else {
          updatedMaxillaryFiles.push(new File([file], `Maxillary${maxillaryCounter}.ply`, fileInfo));
          maxillaryCounter++;
        }
      }
    });
  
    setMandibularFiles([...mandibularFiles, ...updatedMandibularFiles]);
    setMaxillaryFiles([...maxillaryFiles, ...updatedMaxillaryFiles]);
  };
  

  return (
    <div className="p-16">
      {mandibularFiles.length == 0 ? (
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
          mandibularFiles={mandibularFiles}
          maxillaryFiles={maxillaryFiles}
        />
      )}
    </div>
  );
};

export default FilterFiles;
