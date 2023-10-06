import axios from 'axios';

self.onmessage = async (e) => {
  const { url, progressPerFile } = e.data;
  let individualProgress = 0;
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        const currentProgress =
          (progressEvent.loaded / Number(progressEvent.total)) *
          progressPerFile;
        const progressIncrement = currentProgress - individualProgress;
        individualProgress = currentProgress;

        self.postMessage({ type: 'progress', value: progressIncrement });
      },
    });

    const file = new File(
      [response.data],
      url.split('/').pop() || 'downloaded-file'
    );

    self.postMessage({ type: 'downloaded', file });
  } catch (error) {
    self.postMessage({ type: 'error', error });
  }
};
