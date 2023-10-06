import axios from "axios";

const MAX_PARALLEL_UPLOADS = 7;

onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === "upload") {
    const { mandibularFiles, maxillaryFiles } = ev.data;
    const allFiles = [...mandibularFiles, ...maxillaryFiles];
    const folderName = generateRandomID();
    let completed = 0;
    const startTime = Date.now();

    for (let i = 0; i < allFiles.length; i += MAX_PARALLEL_UPLOADS) {
      const slice = allFiles.slice(i, i + MAX_PARALLEL_UPLOADS);
      try {
        await Promise.all(
          slice.map(async (file) => {
            const { data } = await axios.get(
              `http://13.126.77.231:3001/get-pre-signed-url?filename=${file.name}&folderName=${folderName}`
            );

            await axios.put(data.url, file, {
              headers: { "Content-Type": "application/octet-stream" },
            });

            completed++;
            postMessage({
              type: "progress",
              percentage: (completed * 100) / allFiles.length,
            });
          })
        );
      } catch (error) {
        postMessage({ type: "error", message: "Upload failed" });
        return;
      }
    }

    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    postMessage({ type: "complete", timeElapsed });
  }
};

function generateRandomID() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomID = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomID += characters.charAt(randomIndex);
  }
  return randomID;
}
