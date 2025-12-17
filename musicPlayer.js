//DOM Elements for html interaction
const folderToggleBtn = document.getElementById('folderToggleBtn');
const folderPanel = document.getElementById('folderPanel');
const overlay = document.getElementById('overlay');
const folderListElement = document.getElementById('folderList');
const dragDropArea = document.getElementById('dragDropArea');
const fileInput = document.getElementById('fileInput');
const playlistElement = document.getElementById('playlist');
const trackTitleElement = document.getElementById('trackTitle');
const trackArtistElement = document.getElementById('trackArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressElement = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const currentTimeElement = document.getElementById('currentTime');
const durationElement = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const audioPlayer = document.getElementById('audioPlayer');
const closeFolderPanelBtn = document.getElementById('closeFolderPanel');

//Global variables
let tracks = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
let currentFolderId = 1;
let currentTrackIndex = null;
let isPlaying = false;
let currentVolume = 0.7;
let allTracks = [];

//Available for holding in folder panel
function toggleFolderPanel() {
    folderPanel.classList.toggle('show');
    overlay.classList.toggle('show');
}

//Names and icons for folders
const folders = [
    { id: 1, name: "Neutral", icon: "🙂" },
    { id: 2, name: "Happy", icon: "😄" },
    { id: 3, name: "Sad", icon: "😭" },
    { id: 4, name: "Angry", icon: "😡" },
    { id: 5, name: "Disgusted", icon: "🤢" },
    { id: 6, name: "Fearful", icon: "😱" },
    { id: 7, name: "Surprised", icon: "😆" }
];

//Initialize Application
function initializeApp() {
    renderFolders();
    attachEventListeners();
    updatePlaylist();
    audioPlayer.volume = currentVolume;
    selectFolder(1);
    window.selectFolder = selectFolder;
    window.isPlaying = isPlaying;
    window.currentFolderId = currentFolderId;
}


function renderFolders() {
    folderListElement.innerHTML = '';
    folders.forEach(folder => {
        const el = document.createElement('div');
        el.className = 'folder-item';
        el.dataset.folderId = folder.id;
        el.innerHTML = `
            <span class="folder-icon">${folder.icon}</span>
            ${folder.name}
            <span class="track-count">${tracks[folder.id].length}</span>
        `;
        el.addEventListener('click', () => selectFolder(folder.id));
        folderListElement.appendChild(el);
    });
}

function selectFolder(folderId) {
    currentFolderId = folderId;

    document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.toggle(
            'active',
            parseInt(item.dataset.folderId) === folderId
        );
    });
    updatePlaylist();
}

// Update playlist based on selected folder
function updatePlaylist() {
    playlistElement.innerHTML = '';
    const list = allTracks.filter(t => t.folderId === currentFolderId);

    if (list.length === 0) {
        playlistElement.innerHTML =
            `<div class="text-center text-muted py-4">No tracks in folder</div>`;
        return;
    }

    list.forEach(track => {
        const idx = allTracks.findIndex(t => t.id === track.id);
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (idx === currentTrackIndex) item.classList.add('playing');

        item.innerHTML = `
            <div class="fw-medium">${track.title}</div>
            <small class="text-muted">${track.artist}</small>
        `;

        item.addEventListener('click', () => selectTrack(idx));
        playlistElement.appendChild(item);
    });
}

function selectTrack(index) {
    currentTrackIndex = index;
    const track = allTracks[index];
    audioPlayer.src = track.objectURL;
    trackTitleElement.textContent = track.title;
    trackArtistElement.textContent = track.artist;
    updatePlaylist();
}

function playTrack() {
    if (currentTrackIndex === null) return;
    audioPlayer.play();
    isPlaying = true;
    updatePlayButton();
    if (window.moodDetect) window.moodDetect.pauseDetection();
}

function pauseTrack() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayButton();
    if (window.moodDetect) window.moodDetect.resumeDetection();
}

function updatePlayButton() {
    playIcon.className = isPlaying ? 'bi bi-pause' : 'bi bi-play';
}

// Event listeners
function attachEventListeners() {
    folderToggleBtn.addEventListener('click', toggleFolderPanel);
    closeFolderPanelBtn.addEventListener('click', toggleFolderPanel);
    overlay.addEventListener('click', toggleFolderPanel);

    playPauseBtn.addEventListener('click', () => {
        isPlaying ? pauseTrack() : playTrack();
    });

    volumeSlider.addEventListener('input', e => {
        audioPlayer.volume = e.target.value;
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);