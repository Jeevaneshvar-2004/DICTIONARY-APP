// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const historyList = document.getElementById('history-list');
const resultDiv = document.getElementById('result');
const errorMsg = document.getElementById('error-msg');
const wordTitle = document.getElementById('word-title');
const phonetic = document.getElementById('phonetic');
const partOfSpeech = document.getElementById('part-of-speech');
const definition = document.getElementById('definition');
const example = document.getElementById('example');
const synonymsList = document.getElementById('synonyms-list');
const antonymsList = document.getElementById('antonyms-list');
const audioBtn = document.getElementById('audio-btn');
const favoriteBtn = document.getElementById('favorite-btn');

// State
let searchHistory = JSON.parse(localStorage.getItem('dictionaryHistory')) || [];
let favorites = JSON.parse(localStorage.getItem('dictionaryFavorites')) || [];

// Initialize
updateHistoryUI();
updateThemeIcon();

// Event Listeners
searchBtn.addEventListener('click', searchWord);
searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchWord());
themeToggle.addEventListener('click', toggleTheme);
favoriteBtn.addEventListener('click', toggleFavorite);

// Functions
async function searchWord() {
  const word = searchInput.value.trim();
  if (!word) return;

  try {
    const data = await fetchWord(word);
    if (!data) throw new Error("Word not found");

    displayWordData(data);
    addToHistory(word);
  } catch (error) {
    showError();
  }
}

async function fetchWord(word) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  if (!response.ok) return null;
  return response.json();
}

function displayWordData(data) {
  const wordData = data[0];
  const firstMeaning = wordData.meanings[0];
  const firstDefinition = firstMeaning.definitions[0];

  // Basic Info
  wordTitle.textContent = wordData.word;
  partOfSpeech.textContent = `Part of Speech: ${firstMeaning.partOfSpeech}`;
  definition.textContent = firstDefinition.definition;
  example.textContent = firstDefinition.example || 'No example available';

  // Synonyms & Antonyms
  displayRelatedWords(firstMeaning.synonyms, synonymsList, 'synonym');
  displayRelatedWords(firstMeaning.antonyms, antonymsList, 'antonym');

  // Audio
  setupAudio(wordData.phonetics);

  // Favorite status
  updateFavoriteUI(wordData.word);

  // Show result
  resultDiv.classList.remove('hide');
  errorMsg.classList.add('hide');
}

function displayRelatedWords(words, container, className) {
  container.innerHTML = '';
  if (!words || words.length === 0) {
    container.innerHTML = `<span class="${className}">None available</span>`;
    return;
  }

  words.slice(0, 5).forEach(word => {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = word;
    container.appendChild(span);
  });
}

function setupAudio(phonetics) {
  const audioSrc = phonetics?.find(p => p.audio)?.audio;
  if (audioSrc) {
    const audio = new Audio(audioSrc);
    audioBtn.onclick = () => audio.play();
    audioBtn.style.display = 'flex';
  } else {
    audioBtn.style.display = 'none';
  }
}

function addToHistory(word) {
  if (!searchHistory.includes(word.toLowerCase())) {
    searchHistory.unshift(word.toLowerCase());
    if (searchHistory.length > 5) searchHistory.pop();
    localStorage.setItem('dictionaryHistory', JSON.stringify(searchHistory));
    updateHistoryUI();
  }
}

function updateHistoryUI() {
  historyList.innerHTML = '';
  searchHistory.forEach(word => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.textContent = word;
    div.addEventListener('click', () => {
      searchInput.value = word;
      searchWord();
    });
    historyList.appendChild(div);
  });
}
document.getElementById('clear-history').addEventListener('click', clearHistory);

// Add this new function
function clearHistory() {
  searchHistory = [];
  localStorage.setItem('dictionaryHistory', JSON.stringify(searchHistory));
  updateHistoryUI();
}

function toggleFavorite() {
  const currentWord = wordTitle.textContent;
  if (!currentWord) return;

  const index = favorites.indexOf(currentWord);
  if (index === -1) {
    favorites.push(currentWord);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem('dictionaryFavorites', JSON.stringify(favorites));
  updateFavoriteUI(currentWord);
}

function updateFavoriteUI(word) {
  const isFavorite = favorites.includes(word);
  favoriteBtn.innerHTML = isFavorite 
    ? '<i class="fas fa-heart"></i>' 
    : '<i class="far fa-heart"></i>';
  favoriteBtn.classList.toggle('favorited', isFavorite);
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.innerHTML = isDark 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
}

function showError() {
  resultDiv.classList.add('hide');
  errorMsg.classList.remove('hide');
}

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}