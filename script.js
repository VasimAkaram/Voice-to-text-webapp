// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const convertBtn = document.getElementById('convertBtn');
const resultContainer = document.getElementById('resultContainer');
const textOutput = document.getElementById('textOutput');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');

let selectedFile = null;

// Drag and Drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#34a853';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#1a73e8';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#1a73e8';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// File input handler
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        selectedFile = files[0];
        displayFileInfo(selectedFile);
        convertBtn.disabled = false;
    }
}

function displayFileInfo(file) {
    fileInfo.style.display = 'block';
    fileName.textContent = `Name: ${file.name}`;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert button click handler
convertBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    loading.style.display = 'block';
    resultContainer.style.display = 'none';
    convertBtn.disabled = true;

    try {
        const text = await convertAudioToText(selectedFile);
        displayResult(text);
    } catch (error) {
        alert('Error converting audio to text: ' + error.message);
    } finally {
        loading.style.display = 'none';
        convertBtn.disabled = false;
    }
});

async function convertAudioToText(file) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        
        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Detect language based on file name or content
        const isHindi = file.name.toLowerCase().includes('hindi') || 
                       file.name.toLowerCase().includes('हिंदी');
        recognition.lang = isHindi ? 'hi-IN' : 'en-US';

        let finalTranscript = '';
        let isProcessing = false;
        let retryCount = 0;
        const maxRetries = 3;
        let isRecognitionStarted = false;

        recognition.onresult = (event) => {
            isProcessing = true;
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
            }
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech' && retryCount < maxRetries) {
                retryCount++;
                console.log(`Retry attempt ${retryCount} of ${maxRetries}`);
                // Adjust audio volume and try again
                audio.volume = Math.min(1, audio.volume + 0.2);
                audio.currentTime = 0;
                audio.play();
                if (!isRecognitionStarted) {
                    recognition.start();
                    isRecognitionStarted = true;
                }
            } else {
                reject(new Error(`Speech recognition error: ${event.error}. Please ensure your audio file contains clear speech and try again.`));
            }
        };

        recognition.onend = () => {
            isRecognitionStarted = false;
            if (!isProcessing && retryCount < maxRetries) {
                retryCount++;
                console.log(`Retry attempt ${retryCount} of ${maxRetries}`);
                audio.currentTime = 0;
                audio.play();
                if (!isRecognitionStarted) {
                    recognition.start();
                    isRecognitionStarted = true;
                }
            } else {
                if (finalTranscript.trim() === '') {
                    reject(new Error('No speech detected in the audio file. Please ensure your audio file contains clear speech and try again.'));
                } else {
                    resolve(finalTranscript.trim());
                }
            }
        };

        // Create object URL and start recognition
        const objectUrl = URL.createObjectURL(file);
        audio.src = objectUrl;
        
        // Configure audio settings
        audio.volume = 0.8;
        audio.playbackRate = 1.0;
        
        audio.onloadedmetadata = () => {
            // Ensure audio is loaded and ready
            audio.oncanplay = () => {
                if (!isRecognitionStarted) {
                    recognition.start();
                    isRecognitionStarted = true;
                }
                audio.play();
            };
        };

        audio.onended = () => {
            if (recognition && isRecognitionStarted) {
                recognition.stop();
                isRecognitionStarted = false;
            }
            URL.revokeObjectURL(objectUrl);
        };

        audio.onerror = () => {
            reject(new Error('Error loading audio file. Please ensure the file is not corrupted and try again.'));
        };
    });
}

function displayResult(text) {
    resultContainer.style.display = 'block';
    textOutput.textContent = text;
}

// Copy button handler
copyBtn.addEventListener('click', () => {
    const text = textOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Text copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy text: ' + err);
    });
});

// Download button handler
downloadBtn.addEventListener('click', () => {
    const text = textOutput.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}); 