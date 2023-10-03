import { useEffect, useState } from 'react';

interface Props {
  uploadPercentage: number;
  timeElapsed: number;
}

const UploadToast = (props: Props) => {
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [uploaded, setUploaded] = useState(true);

  useEffect(() => {
    setTimeElapsed(props.timeElapsed);
    setUploadPercentage(props.uploadPercentage);
  }, [props.timeElapsed, props.uploadPercentage]);

  useEffect(() => {
    if (props.timeElapsed !== 0) {
      setUploaded(true);
    } else {
      setUploaded(false);
    }
  }, [props.timeElapsed]);

  return (
    <div className='absolute min-w-full my-8 left-[80%]'>
      <div
        id='toast-default'
        className='flex items-center w-full max-w-xs p-4 text-gray-500 bg-gray-700 rounded-lg shadow dark:text-gray-400 dark:bg-gray-700'
        role='alert'
      >
        <div className='inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-gray-700 dark:text-blue-200'>
          {!uploaded ? (
            <svg
              className='w-6 h-6 p-1'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='m14.707 4.793-4-4a1 1 0 0 0-1.416 0l-4 4a1 1 0 1 0 1.416 1.414L9 3.914V12.5a1 1 0 0 0 2 0V3.914l2.293 2.293a1 1 0 0 0 1.414-1.414Z' />
              <path d='M18 12h-5v.5a3 3 0 0 1-6 0V12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z' />
            </svg>
            
          ) : (
            <svg
              className='w-7 h-7 p-1'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z' />
            </svg>
          )}
        </div>
        <div className='w-full px-4'>
          <div className='text-sm font-normal mb-2'>{!uploaded ? 'Uploading...': 'Uploaded'}</div>
          <div className=' w-full bg-gray-200 rounded-full dark:bg-gray-700'>
            <div
              className='bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full'
              style={{ width: `${uploadPercentage}%` }}
            >
              {' '}
              {uploadPercentage}%
            </div>
          </div>
          <div className='text-sm font-normal mt-2'>{!uploaded ? ``: `Elasped time : ${timeElapsed}ms`}</div>
        </div>
      </div>
    </div>
  );
};

export default UploadToast;
