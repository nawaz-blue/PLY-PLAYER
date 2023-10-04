import axios from 'axios';

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

        postMessage({
          type: 'progress',
          progress: Math.min(cumulativeProgress, 100),
        });
      },
    });

    const file = new File(
      [response.data],
      url.split('/').pop() || 'downloaded-file'
    );

    return file;
  } catch (error) {
    console.error(`Error downloading file from ${url}:`, error);
    postMessage({
      type: 'error',
      message: `Error downloading file from ${url}: ${error}`,
    });
    return null;
  }
};

onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === 'download') {
    try {
      const { urls } = ev.data;
      const progressPerFile = 100 / urls.length;
      const Maxillary: File[] = [];
      const Mandibular: File[] = [];

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
      postMessage({
        type: 'complete',
        Maxillary,
        Mandibular,
      });
    } catch (error) {
      console.log(error);
    }
  }
};
