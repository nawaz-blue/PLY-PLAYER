import axios from 'axios';

interface DownloadQueueItem {
    url: string;
    progressPerFile: number;
}

let queue: DownloadQueueItem[] = [];
let currentDownloads = 0;
const MAX_PARALLEL_DOWNLOADS = 2;

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
        self.postMessage({ type: 'error', error: error });
    }

    currentDownloads--;
    processQueue();
};

const processQueue = () => {
    if (currentDownloads < MAX_PARALLEL_DOWNLOADS && queue.length > 0) {
        const nextDownload = queue.shift();
        if (nextDownload) {
            currentDownloads++;
            downloadFile(nextDownload.url, nextDownload.progressPerFile);
        }
    }
};

onmessage = (e: MessageEvent) => {
    if (e.data.type === 'download') {
        queue.push({ url: e.data.url, progressPerFile: e.data.progressPerFile });
        processQueue();
    }
};
