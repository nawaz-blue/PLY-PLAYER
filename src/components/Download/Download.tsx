import { useEffect, useState } from 'react';
import axios from 'axios';
import PLYPlayer from '../PLYPlayer/PLYPlayer';

const Download = () => {
  const [mandibularFiles, setMandibularFiles] = useState<File[]>([]);
  const [maxillaryFiles, setMaxillaryFiles] = useState<File[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [downloadedModel, setDownloadedModel] = useState<string | null>(null);
  const [play, setPlay] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  let cumulativeProgress = 0;

  const downloadFile = async (url: string, progressPerFile: number) => {
    let individualProgress = 0;
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          const currentProgress =
            (progressEvent.loaded / Number(progressEvent.total)) *
            progressPerFile;
          const progressIncrement = currentProgress - individualProgress;
          cumulativeProgress += progressIncrement;
          individualProgress = currentProgress;

          setProgress(Math.min(cumulativeProgress, 100));
        },
      });

      const file = new File(
        [response.data],
        url.split('/').pop() || 'downloaded-file'
      );

      return file;
    } catch (error) {
      console.error(`Error downloading file from ${url}:`, error);
      return null;
    }
  };

  const downloadModels = async (folder: string, urls: string[]) => {
    setProgress(null);
    setMandibularFiles([]);
    setMaxillaryFiles([]);
    const progressPerFile = 100 / urls.length;
    let Maxillary: File[] = [];
    let Mandibular: File[] = [];

    for (const url of urls) {
      const downloadedFile = await downloadFile(url, progressPerFile);
      if (downloadedFile) {
        if (downloadedFile.name.includes('Maxillary')) {
          Maxillary.push(downloadedFile);
        } else {
          Mandibular.push(downloadedFile);
        }
      }
    }
    setProgress(100);
    setLoading(false);
    setMandibularFiles(Mandibular);
    setMaxillaryFiles(Maxillary);
    setDownloadedModel(folder);
  };

  const getUrls = async (folder: string) => {
    setDownloadedModel(folder);
    setLoading(true);
    const { data } = await axios.get(
      `http://localhost:3001/${folder}/get-files`
    );
    await downloadModels(folder, data.data);
  };

  const fetchAllModels = async () => {
    const { data } = await axios.get(`http://localhost:3001/get-dir`);
    setModels(data.data);
  };

  useEffect(() => {
    fetchAllModels();
  }, []);

  return (
    <div className='p-16'>
      {!play && (
        <>
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
                  <th scope='col' className='px-6 py-3 w-24'>
                    Model
                  </th>
                  <th scope='col' className='px-6 py-3 w-24'>
                    State
                  </th>
                  <th scope='col' className='px-6 py-3 w-24'>
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
                      <td className='px-6 py-4'>
                        {downloadedModel === e.slice(0, -1) && loading
                          ? 'Loading...'
                          : '-'}
                      </td>
                      <td className='px-6 py-4'>
                        {loading ? (
                          <button
                            type='button'
                            className='text-white bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                            disabled
                          >
                            Preview
                          </button>
                        ) : (
                          downloadedModel !== e.slice(0, -1) && (
                            <button
                              type='button'
                              className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                              onClick={() => {
                                getUrls(e.slice(0, -1));
                              }}
                            >
                              Preview
                            </button>
                          )
                        )}

                        {downloadedModel === e.slice(0, -1) &&
                          progress == 100 && (
                            <button
                              type='button'
                              className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                              onClick={() => {
                                setPlay(true);
                              }}
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
        </>
      )}
      {play && (
        <button
          type='button'
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
          onClick={() => {
            setPlay(false);
          }}
        >
          All Models
        </button>
      )}

      {play && (
        <PLYPlayer
          mandibularFiles={mandibularFiles}
          maxillaryFiles={maxillaryFiles}
        />
      )}
    </div>
  );
};

export default Download;
