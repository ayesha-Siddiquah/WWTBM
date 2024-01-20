import wordList from './riddle-list.js';

let currentAnswer = '';
let currentGuess = [];
let enteredIndices = [];
let timer = {
  interval: null,
  remainingTime: 30,
  isRunning: false
};
let score = 0;
let currentQuestionNumber = 1;
let wrong = 0;
let lifelineUsed = false;
let stopTimerUsed = false;
let wasGameRunningBeforeModal = false;

const questionDiv = document.getElementById('question');
const userInputDiv = document.getElementById('userInput');
const timerDisplay = document.getElementById('timer');
const sound = document.getElementById('timer-sound');
const closeButton = document.querySelector('.close-btn');
const quitGameButton = document.getElementById('quit-game-button');
const  endGameYes = document.getElementById('end-game-yes');
const endGameNo = document.getElementById('end-game-no');
const joinButton = document.getElementById('join-game-button')
const playerNameInput = document.getElementById('player-name-input');
const playerNameElement = document.getElementById('player-name');
const currentPage = window.location.pathname.split("/").pop();
const submitButton = document.getElementById('submitButton')
const stopTimerButton = document.getElementById('stopTimerButton')
const submitOkButton = document.getElementById('submit-ok-btn')
const backButton = document.getElementById('backButton');



/// for getting the name on welcome page but displaying it on main.html
document.addEventListener('DOMContentLoaded', () => {
    
    if (joinButton) {
      joinButton.addEventListener('click', function() {
          if (playerNameInput) {
              const playerName = playerNameInput.value.trim();
              if (playerName) {
                  localStorage.setItem('playerName', playerName);
                  window.location.href = 'instruction.html'; 
               }

               else {
                // Show the name-validation-modal when the user hasn't provided a name
                const nameValidationModal = document.getElementById('name-validation-modal');
                nameValidationModal.style.display = 'block';
              } 
          }
      });      
    } 
     
  const modalValidationCloseButton = document.getElementById('modalCloseButton');
  if (modalValidationCloseButton) {
    modalValidationCloseButton.addEventListener('click', function() {
      const nameValidationModal = document.getElementById('name-validation-modal');
      nameValidationModal.style.display = 'none';
    });
  }
    if (playerNameElement) {
        const playerName = localStorage.getItem('playerName') || 'Player';
        playerNameElement.textContent = 'Player: ' + playerName;
    }

/// navigating based on levels.
  if (currentPage === 'choice.html') {
      setupLevelSelection();
  } else if (currentPage === 'main.html') {
      const selectedLevel = localStorage.getItem('selectedLevel');
      setupLifelines(selectedLevel);
  }

  backButton.addEventListener('click', function() {
    const currentPage = window.location.pathname.split("/").pop();

    switch(currentPage) {
        case 'main.html':
            window.location.href = 'choice.html';
            break;
        case 'choice.html':
            window.location.href = 'instruction.html';
            break;
        case 'instruction.html':
            window.location.href = 'welcome.html';
            break;
            
    }
});


var nextButton = document.getElementById('go-to-choice-screen');
  if (nextButton) {
      nextButton.addEventListener('click', function () {
          // Redirecting to the choice.html page
          window.location.href = 'choice.html';
      });
  }
    
});

/// function to diplay random question
function displayRandomQuestion() {
  if (currentQuestionNumber > 8 || wordList.length === 0) {
      clearInterval(timer.interval);
      sound.pause();               
      sound.currentTime = 0;       
      return;
  }  
  ///function to fill the input div section  it with '-'
  function updateDisplayedWord(word) {
    currentGuess = Array(word.length).fill('_');
    userInputDiv.textContent = currentGuess.join(' ');
  }
  const randomIndex = Math.floor(Math.random() * wordList.length);
  const riddle = wordList[randomIndex];
  currentAnswer = riddle.word;
  questionDiv.textContent = "Question " + currentQuestionNumber + ": " + riddle.hint;
  updateDisplayedWord(currentAnswer);
  wordList.splice(randomIndex, 1);
  sound.currentTime = 0;
  sound.play();
}

function startTimer() {
  if (!stopTimerUsed) {
    sound.currentTime = 0;
    sound.play();
    timer.isRunning = true;
    timer.interval = setInterval(function () {
      let seconds = timer.remainingTime % 60;
      timerDisplay.textContent = "00:" + (seconds < 10 ? "0" : "") + String(seconds);
      if (--timer.remainingTime < 0) {
        clearInterval(timer.interval);
        timer.isRunning = false; 
        if (currentGuess.join('') !== currentAnswer) {
          wrong++;
          document.getElementById('wrong-counter').textContent = wrong;
        }
        let timeUpMessage = 'Time is up! The correct answer was: ' + currentAnswer;
        let showExtraButtons = wrong >= 3 || currentQuestionNumber >= 6;
        openSubmitModal(timeUpMessage, showExtraButtons,);
        sound.pause();
        // soundTimeup.play(); 
      }
    }, 1000);
  }
}

let pausedTime = 0;
function pauseTimer() {
    if (timer.isRunning && !stopTimerUsed) {
      clearInterval(timer.interval);
      timer.isRunning = false;
      pausedTime = sound.currentTime; // Store the current time of the sound
      sound.pause();
    }
  }
  
  function resumeTimer() {
    if (!timer.isRunning && !stopTimerUsed) {
      startTimer();
      sound.currentTime = pausedTime; // Set the sound to the time it was paused in order to resume 
      sound.play();
    }
  }

function toggleBlurEffect(isPaused) {
  const mainContent = document.getElementById('mainContent');
  if (isPaused) {
    mainContent.classList.add('blurred');
  } else {
    mainContent.classList.remove('blurred');
  }
}

document.getElementById('playPauseButton').addEventListener('click', function() {
  if (timer.isRunning) {
    pauseTimer();
    this.textContent = '⏵︎';
    toggleBlurEffect(true);
  } else {
    resumeTimer();
    this.textContent = '⏸︎';
    toggleBlurEffect(false);
  }
});

document.getElementById('startButton').addEventListener('click', function() {
  pauseTimer();
  displayRandomQuestion();
  timer.remainingTime = 30;
  resumeTimer();
});

let gameStarted = false;
function startGame() {
  gameStarted = true;
  displayRandomQuestion();
  timer.remainingTime = 30;
  resumeTimer();
}

document.getElementById('startButton').addEventListener('click', startGame);

/// Submit button onClick logic
function handleSubmit() {


  if (!gameStarted) {
    return;
  }

  pauseTimer();
  let isCorrect = currentGuess.join('') === currentAnswer;
  let lifelineCounter = document.getElementById('lifeline-counter');
  if (isCorrect) {
    score++;
    document.getElementById('score').textContent = score;
  } else {
    wrong++;
    document.getElementById('wrong-counter').textContent = wrong;
  }

  if (lifelineUsed) {
    lifelineCounter.textContent = parseInt(lifelineCounter.textContent) + 1;
  }

  let activeLifelines = document.querySelectorAll('.active-lifeline');
  activeLifelines.forEach(button => button.style.display = 'none');

  currentGuess = Array(currentAnswer.length).fill('_');
  enteredIndices = [];
  lifelineUsed = false;
  stopTimerUsed = false;

  const selectedLevel = localStorage.getItem('selectedLevel') || 'level1';
  let endGameMessage;

  if (wrong >= 3) {
    endGameMessage = 'Game over, better luck next time. Your score is: ' + score;
    
  } else if (score === 6) {
    switch(selectedLevel) {
      case 'level1':
        endGameMessage = 'Congratulations, you conquer Level 1 with $1,000,000!';
        break;
      case 'level2':
        endGameMessage = 'Amazing!!, you conquer Level 2 with $5,000,000!';
        
        break;
      case 'level3':
        endGameMessage = 'Incredible!!!!, Level 3 mastered and $5,000,000 earned!';
    
        break;
      default:
        endGameMessage = 'Congratulations, you win $100,000!';
    }
    document.getElementById('celebration').style.display = 'block';
    

  } else {
    endGameMessage = isCorrect ? 'Correct! Your current score is: ' + score : 'Incorrect! The correct answer was: ' + currentAnswer + ' Your current score is ' + score;
  }

  openSubmitModal(endGameMessage, wrong >= 3 || score === 6);
}

document.getElementById('submit-ok-btn').addEventListener('click', function() {
  closeSubmitModal();
  handleNextQuestion();
  
});

document.querySelectorAll('.lifeline-btn').forEach(button => {
  button.addEventListener('click', handleLifelineClick);
});

const keyboardDiv = document.getElementById('keyboard');
const fragment = document.createDocumentFragment(); 

for (let i = 97; i <= 122; i++) {
  let button = document.createElement("button");
  button.classList.add('key'); 
  let letter = String.fromCharCode(i);
  button.innerText = letter;
  button.addEventListener('click', function() {
    handleKeyPress(letter);
  });
  fragment.appendChild(button); 
}

let backspaceButton = document.createElement("button");
backspaceButton.innerText = "⌫";
backspaceButton.className = 'key backspace'; 
backspaceButton.type = 'button';
backspaceButton.addEventListener('click', function() {
  if (enteredIndices.length > 0) {
    let indexToClear = enteredIndices.pop();
    currentGuess[indexToClear] = '_';
    userInputDiv.textContent = currentGuess.join(' ');
  }
});
fragment.appendChild(backspaceButton); 
keyboardDiv.appendChild(fragment); 

function handleKeyPress(key) {
  let nextUnderscoreIndex = currentGuess.indexOf('_');
  if (nextUnderscoreIndex !== -1) {
    currentGuess[nextUnderscoreIndex] = key;
    enteredIndices.push(nextUnderscoreIndex);
    userInputDiv.textContent = currentGuess.join(' ');
  }
}

function revealPartialAnswer() {
  let partialRevealLength = 4;
  lifelineUsed = true;
  for (let i = 0; i < partialRevealLength && i < currentAnswer.length; i++) {
    currentGuess[i] = currentAnswer[i];
    enteredIndices.push(i);
  }
  userInputDiv.textContent = currentGuess.join(' ');
}

function handleStopTimer() {
  if (!stopTimerUsed) {
    pauseTimer();
    stopTimerUsed = true;
    this.disabled = true;
  }
}

function handleLifelineClick(event) {
  let button = event.target; 
  button.classList.add('active-lifeline', 'lifeline-in-use');
  lifelineUsed = true; 
  
}
function openModal() {
  const modal = document.getElementById("nameModal");
  modal.style.display = "flex";
}
function closeModal() {
  const modal = document.getElementById("nameModal");
  modal.style.display = "none";
}

function openSubmitModal(message, showExtraButtons = false) {
  const modal = document.getElementById("submitModal");
  const modalMessageElement = document.getElementById('submit-msg');
  modalMessageElement.textContent = message;

  const extraButtonsDiv = document.getElementById('extra-buttons-div');
  const okButton = document.getElementById('submit-ok-btn');
  const playAgainButton = document.getElementById('play-again-btn');

  playAgainButton.style.display = 'none';

  const gameWinnerSound = document.getElementById('gameWinner');
  const gameOverSound = document.getElementById('gameOver');

  if (wrong >= 3 || (score >= 6)) {
    playAgainButton.style.display = 'block';
    okButton.style.display = 'none';
    extraButtonsDiv.style.display = 'block';

    if (wrong >= 3) {
      console.log("Playing game over sound");
      playSound(gameOverSound);
      modal.classList.add('blinking-wrong-background');
    } else if (score >= 6) {
      console.log("Playing game winner sound");
      playSound(gameWinnerSound);
      modal.classList.add('blinking-background');
    }
  } else if (showExtraButtons) {
    okButton.style.display = 'block';
    extraButtonsDiv.style.display = 'block';
    modal.classList.remove('blinking-wrong-background');
    modal.classList.remove('blinking-background');
  } else {
    okButton.style.display = 'block';
    extraButtonsDiv.style.display = 'none';
    modal.classList.remove('blinking-wrong-background');
    modal.classList.remove('blinking-background');
  }
  modal.style.display = "flex";
  pauseTimer();

  playAgainButton.addEventListener('click', function() {
    modal.style.display = "none";
    console.log("Pausing sounds");
    gameOverSound.pause();
    gameWinnerSound.pause();
    document.getElementById('celebration').style.display = 'none';
    playAgainButton.removeEventListener('click',  playAgainButton);
  });

  function playSound(soundElement) {
    if (soundElement) {
      console.log("Playing sound");
      soundElement.currentTime = 0;
      soundElement.play();
    }
  }
}

function closeSubmitModal() {
  const modal = document.getElementById("submitModal");
  modal.style.display = "none"; 
}

 function updateModalMessagetoEndMessage (message){
  const modalMessageElement = document.getElementById('msg-or-end');
  modalMessageElement.textContent = message;
  modalMessageElement.classList.add('modal-message');
  const modalButtons = document.querySelector('.modal-buttons');
  modalButtons.style.display = "block";
}

function handleNextQuestion() {
  if (currentQuestionNumber < 9) {
      currentQuestionNumber++;
      displayRandomQuestion();
      timer.remainingTime = 30;
      if (gameStarted) {
      startTimer();
      }
  } else {
      clearInterval(timer.interval);
      sound.pause();
      sound.currentTime = 0;
      openSubmitModal('Game over you have completed');
  }
}
function setupLevelSelection() {
  document.getElementById('button-level1').addEventListener('click', function() {
      localStorage.setItem('selectedLevel', 'level1');
      window.location.href = 'main.html';
  });

  document.getElementById('button-level2').addEventListener('click', function() {
      localStorage.setItem('selectedLevel', 'level2');
      window.location.href = 'main.html';
  });

  document.getElementById('button-level3').addEventListener('click', function() {
      localStorage.setItem('selectedLevel', 'level3');
      window.location.href = 'main.html';
  });
}

/// displaying the life-line buttons based on levels
function setupLifelines(level) {
  switch(level) {
      case 'level1':
          document.getElementById('fiftyButton').style.display = 'block';
          document.getElementById('stopTimerButton').style.display = 'block';
          break;
      case 'level2':
          document.getElementById('fiftyButton').style.display = 'block';
          document.getElementById('stopTimerButton').style.display = 'none';
          break;
      case 'level3':
          document.getElementById('fiftyButton').style.display = 'none';
          document.getElementById('stopTimerButton').style.display = 'none';
          break;
  }
}

closeButton.addEventListener('click', function() {
  closeModal();
});

function resetGame() {
    // Reset game logic
    score = 0;
    wrong = 0;
    currentQuestionNumber = 1;
    currentGuess = [];
    enteredIndices = [];
    lifelineUsed = false; /// lifeline used initially setting to false 
    stopTimerUsed = false;
    document.getElementById('score').textContent = score;
    document.getElementById('wrong-counter').textContent = wrong;
    document.getElementById('lifeline-counter').textContent = '0';
    const selectedLevel = localStorage.getItem('selectedLevel');
    
    document.querySelectorAll('.lifeline-btn').forEach(button => {
        button.classList.remove('active-lifeline', 'lifeline-in-use');
        /// resetting button based on levels
        switch(selectedLevel) {
            case 'level1':
                button.style.display = 'block';
                break;
            case 'level2':
                if(button.id !== 'stopTimerButton') button.style.display = 'block';/// bring back the fifty-fifty button
                break;
            case 'level3':
                button.style.display = 'none';  // do not display lifelines 
                break;
            default:
                button.style.display = 'block';
        }
    });
    // reset the timer, inoutDiv section, sound.
    if (timer.interval) {
        clearInterval(timer.interval);
    }
    questionDiv.textContent = "Press Start to play!"; 
    sound.pause();
    sound.currentTime = 0;
    timerDisplay.textContent = "00:30";
    timer.remainingTime = 30;
    timer.isRunning = false;
    userInputDiv.textContent = '';
    closeSubmitModal();
}
///if clicked on quit and then yes,go back to welcome.html page 
quitGameButton.addEventListener('click', function() {
  console.log("How r u ")
  wasGameRunningBeforeModal = gameStarted && timer.isRunning;
  updateModalMessagetoEndMessage("Are you sure you want to quit the game?");
  openModal();
  pauseTimer(); 
});
endGameYes.addEventListener('click', function()
{
window.location.href = 'Welcome.html'; 
});

/// if clicked on quit and then No, resume Timer. 
endGameNo.addEventListener('click', function() {
    closeModal(); 
    if (wasGameRunningBeforeModal) {
      resumeTimer();
    }
  });

document.getElementById('reset-game-button').addEventListener('click', resetGame);
document.getElementById('play-again-btn').addEventListener('click', resetGame);
submitOkButton.addEventListener('click', closeSubmitModal);
submitButton.addEventListener('click', handleSubmit);
stopTimerButton.addEventListener('click', handleStopTimer); 
document.querySelector('.lifeline-btn').addEventListener('click', revealPartialAnswer);


