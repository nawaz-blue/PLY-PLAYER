import axios from 'axios';

onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === 'download') {
    const { urls } = ev.data;

    const downloadFile = async (url: string) => {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer', // Change to 'arraybuffer'
          onDownloadProgress: (progressEvent) => {
            const progress =
              (progressEvent.loaded / Number(progressEvent.total)) * 100;
            postMessage({
              type: 'progress',
              progress,
            });
          },
        });

        // Create a new file from the response data
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

    const Maxillary: File[] = [];
    const Mandibular: File[] = [];

    // Loop through the URLs and download each file
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
      Maxillary: Maxillary,
      Mandibular:Mandibular
    });
  }
};
