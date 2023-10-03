import axios from 'axios';

onmessage = async (ev: MessageEvent) => {
  console.log(ev);
  if (ev.data.type === 'upload') {
    const mandibularFiles = ev.data.mandibularFiles;
    const maxillaryFiles = ev.data.maxillaryFiles;

    const allFiles = [...mandibularFiles, ...maxillaryFiles];
    let timeElapsed = 0;
    const startTime = Date.now();

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      try {
        const { data } = await axios.get(
          `http://localhost:3001/get-pre-signed-url?filename=${file.name}`
        );

        await axios.put(data.url, file, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });

        postMessage({
          type: 'progress',
          percentage: ((i + 1) * 100) / allFiles.length,
        });
      } catch (error) {
        postMessage({ type: 'error', message: 'Upload failed' });
        return;
      }
    }

    const endTime = Date.now();
    timeElapsed = (endTime - startTime) / 1000;
    postMessage({ type: 'complete', timeElapsed });
  }
};
