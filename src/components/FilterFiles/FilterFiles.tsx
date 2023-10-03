import React, { useState, ChangeEvent } from 'react';
import PLYPlayer from '../PLYPlayer/PLYPlayer';

const FilterFiles: React.FC = () => {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  });
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  const [mandibularFiles, setMandibularFiles] = useState<File[]>([]);
  const [maxillaryFiles, setMaxillaryFiles] = useState<File[]>([]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    let mandibularCounter = 1;
    let maxillaryCounter = 1;
    const updatedMandibularFiles: File[] = [];
    const updatedMaxillaryFiles: File[] = [];

    Array.from(event.target.files).forEach((file) => {
      if (file.name.toLowerCase().endsWith('.production.ply')) {
        const fileInfo = {
          type: file.type,
          lastModified: file.lastModified,
        };

        if (file.name.includes('Mandibular')) {
          updatedMandibularFiles.push(
            new File([file], `Mandibular${mandibularCounter}.ply`, fileInfo)
          );
          mandibularCounter++;
        } else {
          updatedMaxillaryFiles.push(
            new File([file], `Maxillary${maxillaryCounter}.ply`, fileInfo)
          );
          maxillaryCounter++;
        }
      }
    });

    setMandibularFiles([...mandibularFiles, ...updatedMandibularFiles]);
    setMaxillaryFiles([...maxillaryFiles, ...updatedMaxillaryFiles]);

    // Send the files to the worker for upload
    worker.postMessage({
      type: 'upload',
      mandibularFiles: updatedMandibularFiles,
      maxillaryFiles: updatedMaxillaryFiles,
    });
  };

  worker.onmessage = (event) => {
    if (event.data.type === 'progress') {
      setUploadPercentage(event.data.percentage);
      setTimeElapsed(0)
    }
    if (event.data.type === 'complete') {
      setTimeElapsed(event.data.timeElapsed);
      // alert(
      //   `Files uploaded successfully. Time elapsed: ${event.data.timeElapsed} seconds`
      // );
    }
  };

  return (
    <div>
      {mandibularFiles.length == 0 ? (
        <div className='p-16 flex items-center justify-center w-full'>
          <label
            htmlFor='dropzone-file'
            className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
          >
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              <svg
                className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 20 16'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                />
              </svg>
              <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                <span className='font-semibold'>Click to upload</span> or drag
                and drop
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Upload 3d Model Exported Folder
              </p>
            </div>
            <input
              type='file'
              id='dropzone-file'
              className='hidden'
              onChange={handleFileUpload}
              {...({
                webkitdirectory: 'true',
                directory: 'true',
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
        />
      )}
    </div>
  );
};

export default FilterFiles;
