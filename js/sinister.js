var storiesData = [
    { id: 1, tone: 'light', key: 'sinister_s1' },
    { id: 2, tone: 'light', key: 'sinister_s2' },
    { id: 3, tone: 'light', key: 'sinister_s3' },
    { id: 4, tone: 'light', key: 'sinister_s4' },
    { id: 5, tone: 'light', key: 'sinister_s5' },
    { id: 6, tone: 'light', key: 'sinister_s6' },
    { id: 7, tone: 'light', key: 'sinister_s7' },
    { id: 8, tone: 'light', key: 'sinister_s8' },
    { id: 9, tone: 'light', key: 'sinister_s9' },
    { id: 10, tone: 'light', key: 'sinister_s10' },
    { id: 11, tone: 'dark', key: 'sinister_s11' },
    { id: 12, tone: 'dark', key: 'sinister_s12' },
    { id: 13, tone: 'dark', key: 'sinister_s13' },
    { id: 14, tone: 'dark', key: 'sinister_s14' },
    { id: 15, tone: 'dark', key: 'sinister_s15' },
    { id: 16, tone: 'dark', key: 'sinister_s16' },
    { id: 17, tone: 'dark', key: 'sinister_s17' },
    { id: 18, tone: 'dark', key: 'sinister_s18' },
    { id: 19, tone: 'dark', key: 'sinister_s19' },
    { id: 20, tone: 'dark', key: 'sinister_s20' }
];

var gameTone = 'light';
var availableStories = [];
var lastStoryId = -1;
var timerSeconds = 0;
var timerInterval = null;
var timerPaused = false;
var isRevealed = false;

var setupScreen = document.getElementById('setup-screen');
var gameScreen = document.getElementById('game-screen');
var statusMessage = document.getElementById('status-message');
var storyTitle = document.getElementById('story-title');
var storySituation = document.getElementById('story-situation');
var storySolution = document.getElementById('story-solution');
var timerDisplay = document.getElementById('timer-display');
var timerStatus = document.getElementById('timer-status');
var revealBtn = document.getElementById('btn-reveal');
var nextBtn = document.getElementById('btn-next');
var nextModal = document.getElementById('next-modal');

function initGame() {
    setTone('light');

    window.addEventListener('langChanged', function() {
        if (setupScreen.style.display !== 'none') {
            setTone(gameTone);
        } else if (isRevealed) {
            renderStory();
        }
    });

    setTimeout(function() {
        setTone('light');
    }, 100);
}

function setTone(tone) {
    gameTone = tone;
    var btnLight = document.getElementById('btn-sinister-light');
    var btnDark = document.getElementById('btn-sinister-dark');
    if (btnLight) {
        btnLight.style.backgroundColor = tone === 'light' ? 'black' : 'white';
        btnLight.style.color = tone === 'light' ? 'white' : 'black';
        btnDark.style.backgroundColor = tone === 'dark' ? 'black' : 'white';
        btnDark.style.color = tone === 'dark' ? 'white' : 'black';
    }
    var descText = document.getElementById('diff-desc-text');
    if (descText) {
        if (tone === 'light') {
            descText.innerText = typeof getTranslation !== 'undefined' ? getTranslation('sinister_light_desc') : 'Mistérios intrigantes com finais surpreendentes.';
        } else {
            descText.innerText = typeof getTranslation !== 'undefined' ? getTranslation('sinister_dark_desc') : 'Enigmas sombrios para mentes corajosas.';
        }
    }
}

function startGame() {
    setupScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    isRevealed = false;
    lastStoryId = -1;
    stopTimer();
    timerPaused = false;
    timerSeconds = 0;
    timerDisplay.innerText = '00:00';
    updateTimerStatus();
    buildPool();
    nextStory();
}

function backToMenu() {
    stopTimer();
    gameScreen.style.display = 'none';
    setupScreen.style.display = 'block';
}

function buildPool() {
    availableStories = [];
    for (var i = 0; i < storiesData.length; i++) {
        if (storiesData[i].tone === gameTone) {
            availableStories.push(storiesData[i]);
        }
    }
    shufflePool();
}

function shufflePool() {
    for (var i = availableStories.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = availableStories[i];
        availableStories[i] = availableStories[j];
        availableStories[j] = temp;
    }
}

function showNextConfirm() {
    if (nextModal) {
        nextModal.style.display = 'block';
    }
}

function confirmNext(confirmed) {
    if (nextModal) {
        nextModal.style.display = 'none';
    }
    if (confirmed) {
        nextStory();
    }
}

function nextStory() {
    if (availableStories.length === 0) {
        buildPool();
        if (lastStoryId !== -1) {
            for (var i = 0; i < availableStories.length; i++) {
                if (availableStories[i].id === lastStoryId) {
                    availableStories.splice(i, 1);
                    break;
                }
            }
        }
    }

    var story = availableStories.shift();
    lastStoryId = story.id;
    isRevealed = false;
    timerPaused = false;

    renderStory(story);

    timerSeconds = 0;
    timerDisplay.innerText = '00:00';
    updateTimerStatus();
    startTimer();
}

function renderStory(story) {
    if (!story) return;
    var s = story;
    storyTitle.innerText = typeof getTranslation !== 'undefined' ? getTranslation(s.key + '_title') : 'Mistério';
    storySituation.innerText = typeof getTranslation !== 'undefined' ? getTranslation(s.key + '_situation') : '';
    if (isRevealed) {
        storySolution.innerText = typeof getTranslation !== 'undefined' ? getTranslation(s.key + '_solution') : '';
        storySolution.style.display = 'block';
        revealBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
    } else {
        storySolution.style.display = 'none';
        storySolution.innerText = '';
        revealBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
    }
}

function startTimer() {
    stopTimer();
    timerInterval = setInterval(function() {
        timerSeconds++;
        timerDisplay.innerText = formatTime(timerSeconds);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function toggleTimer() {
    if (timerPaused) {
        timerPaused = false;
        startTimer();
    } else {
        timerPaused = true;
        stopTimer();
    }
    updateTimerStatus();
}

function updateTimerStatus() {
    if (timerStatus) {
        timerStatus.innerText = timerPaused ? (typeof getTranslation !== 'undefined' ? getTranslation('sinister_paused') : '(pausado)') : '';
    }
}

function toggleSolution() {
    if (!isRevealed) return;
    var sol = document.getElementById('story-solution');
    sol.style.display = sol.style.display === 'none' ? 'block' : 'none';
}

function revealSolution() {
    if (isRevealed) return;
    isRevealed = true;
    updateTimerStatus();

    var currentStory = null;
    for (var i = 0; i < storiesData.length; i++) {
        if (storiesData[i].id === lastStoryId) {
            currentStory = storiesData[i];
            break;
        }
    }
    if (currentStory) {
        renderStory(currentStory);
    }
}

document.addEventListener('DOMContentLoaded', initGame);
