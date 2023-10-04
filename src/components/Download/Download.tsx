import { useEffect, useState } from 'react';
import axios from 'axios';
import PLYPlayer from '../PLYPlayer/PLYPlayer';

const Download = () => {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  });
  const [mandibularFiles, setMandibularFiles] = useState<File[]>([]);
  const [maxillaryFiles, setMaxillaryFiles] = useState<File[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const fetchAllModels = async () => {
    const { data } = await axios.get(`http://localhost:3001/get-dir`);
    setModels(data.data);
  };

  const downloadModels = (urls: string[]) => {
    setProgress(null);

    worker.postMessage({
      type: 'download',
      urls: urls,
    });
  };

  const getUrls = async (folder: string) => {
    const { data } = await axios.get(
      `http://localhost:3001/${folder}/get-files`
    );
    downloadModels(data.data);
  };

  worker.onmessage = (event) => {
    if (event.data.type === 'progress') {
      setDownloaded(false);
      setProgress(event.data.progress);
    }
    if (event.data.type === 'complete') {
      setProgress(100);
      setDownloaded(true);
      setMandibularFiles(event.data.Mandibular);
      setMaxillaryFiles(event.data.Maxillary);
    }

    if (event.data.type === 'error') {
      setDownloaded(false);
    }
  };

  useEffect(() => {
    fetchAllModels();
  }, []);

  return (
    <div className='p-16'>
      <h1 className='text-lg font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-3xl mb-8'>
        <span className='text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400'>
          All{' '}
        </span>
        Models
      </h1>
      <div className='relative overflow-x-auto'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='px-6 py-3'>
                Model
              </th>
              <th scope='col' className='px-6 py-3'>
                Size
              </th>
              <th scope='col' className='px-6 py-3'>
                Upload Date
              </th>
              <th scope='col' className='px-6 py-3'>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((e) => {
              return (
                <tr
                  key={e}
                  className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'
                >
                  <th
                    scope='row'
                    className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                  >
                    {e.slice(0, -1)}
                  </th>
                  <td className='px-6 py-4'>-</td>
                  <td className='px-6 py-4'>{progress?.toFixed(0)}</td>
                  <td className='px-6 py-4'>
                    <button
                      type='button'
                      className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                      onClick={() => {
                        getUrls(e.slice(0, -1));
                      }}
                    >
                      Download
                    </button>
                    {downloaded && (
                      <button
                        type='button'
                        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                        
                      >
                        Play
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {downloaded && (
        <PLYPlayer
          timeElapsed={0}
          uploadPercentage={0}
          mandibularFiles={mandibularFiles}
          maxillaryFiles={maxillaryFiles}
        />
      )}
    </div>
  );
};

export default Download;
