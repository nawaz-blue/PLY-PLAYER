import axios from 'axios';

const downloadFile = async (url: string) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        const progress =
          (progressEvent.loaded / Number(progressEvent.total)) * 100;
        postMessage({
          type: 'progress',
          progress,
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
    const { urls } = ev.data;
    const Maxillary: File[] = [];
    const Mandibular: File[] = [];

    for (const url of urls) {
      const downloadedFile = await downloadFile(url);
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
  }
};
