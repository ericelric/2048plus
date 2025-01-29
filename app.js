document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const gameModeDisplay = document.querySelector('h1');
  const gridDisplay = document.querySelector('.game-grid');
  const bestScoreDisplay = document.querySelector('#best-score');
  const currentScoreDisplay = document.querySelector('#current-score');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const modal = document.querySelector('.modal-outer');
  const modalText = document.querySelector('.modal-text');
  const buttonYes = document.querySelector('.button-yes');
  const buttonNo = document.querySelector('.button-no');
  const buttonNewGame = document.querySelector('.button-new');

  // Game variables
  let gridWidth = 3;
  let totalTiles = gridWidth * gridWidth;
  let tileDivs = [];
  let tileNumbers = [];
  let bestScore = 0;
  let currentScore = 0;
  let currentGameMode = 2048;
  let targetGameMode = 4096;

  // Create the game board with two random numbers
  function createGameBoard() {
    tileDivs = [];
    tileNumbers = [];
    gridDisplay.innerHTML = '';
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('div');
      tile.innerHTML = '';
      gridDisplay.appendChild(tile);
      tileDivs.push(tile);
      tileNumbers.push(0);
    }
    generateNumber();
    generateNumber();
    gridDisplay.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
  }

  // Generate a new number on the board
  function generateNumber() {
    // Find indices of tiles with the number 0
    const emptyTileIndices = tileNumbers
      .map((num, index) => (num === 0 ? index : null))
      .filter((index) => index !== null);

    if (emptyTileIndices.length > 0) {
      // Pick a random index from the empty tiles
      const randomIndex =
        emptyTileIndices[Math.floor(Math.random() * emptyTileIndices.length)];

      // Generate a weighted random number
      const randomValue = Math.random() * 100;
      let number;

      if (randomValue < 90) {
        number = 2; // 90% chance
      } else if (randomValue < 98) {
        number = 4; // 8% chance
      } else {
        number = 8; // 2% chance
      }

      // Update both arrays and print number on the board
      tileNumbers[randomIndex] = number;
      const randomTile = tileDivs[randomIndex];
      randomTile.innerHTML = number;
      randomTile.classList.add('tile-fade');
    }
  }

  // Change the game mode and store the current game mode in the local storage
  function changeGameMode() {
    // Switch values
    [targetGameMode, currentGameMode] = [currentGameMode, targetGameMode];
    localStorage.setItem('gameMode', currentGameMode);
  }

  // Load the current game mode from the local storage and update game variables
  function loadGameMode() {
    if (localStorage.getItem('gameMode')) {
      currentGameMode = parseInt(localStorage.getItem('gameMode'));
    }

    if (currentGameMode === 2048) {
      gridWidth = 4;
      totalTiles = gridWidth * gridWidth;
      targetGameMode = 4096;
    } else if (currentGameMode === 4096) {
      gridWidth = 5;
      totalTiles = gridWidth * gridWidth;
      targetGameMode = 2048;
    } else {
      gridWidth = 4;
      totalTiles = gridWidth * gridWidth;
    }
  }

  // Update the current score
  function updateCurrentScore(amount) {
    currentScore += amount;
    currentScoreDisplay.innerHTML = currentScore;
  }

  // Write the best score into the localStorage
  function setBestScore() {
    if (currentScore > bestScore) {
      localStorage.setItem(`bestScore${currentGameMode}`, currentScore);
      bestScoreDisplay.innerHTML = currentScore;
    }
  }

  // Load the best score from the localStorage
  function loadBestScore() {
    if (localStorage.getItem(`bestScore${currentGameMode}`)) {
      bestScore = parseInt(localStorage.getItem(`bestScore${currentGameMode}`));
      bestScoreDisplay.innerHTML = bestScore;
    } else {
      bestScoreDisplay.innerHTML = 0;
    }
  }

  // Add tile colors based on values
  function addColors() {
    tileDivs.forEach((tile) => {
      const value = parseInt(tile.innerHTML) || 0;
      if (tile.classList.contains('tile-fade')) {
        tile.className = `tile tile-${value} tile-fade`;
        setTimeout(() => {
          tile.classList.remove('tile-fade');
        }, 150);
      } else {
        tile.className = `tile tile-${value}`;
      }
    });
  }

  // Check for game over
  function checkForGameOver() {
    let rowCount = 0;
    let columnCount = 0;
    const temp = tileNumbers;

    // Select rows
    for (let i = 0; i < temp.length; i += gridWidth) {
      const row = [];

      // Collect values for the current row
      for (let j = 0; j < gridWidth; j++) {
        row.push(temp[i + j]);
      }

      // If the row has no adjacent equal numbers update count
      if (hasNoAdjacentEqualNumbers(row) && !temp.includes(0)) {
        rowCount++;
      }
    }

    // Select columns
    for (let i = 0; i < gridWidth; i++) {
      const column = [];

      // Collect values for the current column
      for (let j = 0; j < temp.length; j += gridWidth) {
        column.push(temp[i + j]);
      }

      // If the column has no adjacent equal numbers update count
      if (hasNoAdjacentEqualNumbers(column) && !temp.includes(0)) {
        columnCount++;
      }
    }

    // If all rows and columns have no adjacent equal numbers the endGame function will be called
    if (rowCount + columnCount === gridWidth * 2) {
      endGame(`<div>GAME OVER</div>Do you want to start a new game?`);
    }
  }

  // Helper to detect if an array has no qual adjacent numbers
  function hasNoAdjacentEqualNumbers(array) {
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] === array[i + 1]) {
        return false; // Found two adjacent numbers that are equal
      }
    }
    return true; // No adjacent numbers are equal
  }

  // Check for win
  function checkForWin() {
    if (tileNumbers.some((tile) => tile == currentGameMode)) {
      shape = {
        particleCount: 150,
        startVelocity: 25,
        spread: 360,
        scalar: 1.25,
        origin: { y: 0 },
      };
      confetti(shape);
      endGame(`<div>YOU WON</div>Do you want to start a new game?`);
    }
  }

  // Display the modal with the end game message and option to start a new game
  function endGame(text) {
    removeControlListeners();
    showModal();
    modalText.innerHTML = text;
    buttonYes.onclick = function () {
      startNewGame();
      hideModal();
    };
  }

  // Move and sum tiles
  function moveAndSum(inputArray, direction) {
    const temp = []; // To hold non-zero values for processing

    // Step 1: Collect non-zero numbers
    for (let i = 0; i < inputArray.length; i++) {
      if (inputArray[i] > 0) {
        temp.push(inputArray[i]);
      }
    }

    const result = new Array(inputArray.length).fill(0); // Initialize result array with zeros
    let index; // Index variable for the result array

    if (direction === 'right' || direction === 'down') {
      index = result.length - 1; // Start filling from the end for right direction
      // Step 2: Process the temp array from right to left
      for (let i = temp.length - 1; i >= 0; i--) {
        if (i > 0 && temp[i] === temp[i - 1]) {
          // If two adjacent numbers are the same, sum them
          const sum = temp[i] + temp[i - 1];
          result[index] = sum;
          updateCurrentScore(sum);
          i--; // Skip the next number since it's merged
        } else {
          // Otherwise, just move the number
          result[index] = temp[i];
        }
        index--; // Move to the next slot in the result array
      }
    } else if (direction === 'left' || direction === 'up') {
      index = 0; // Start filling from the beginning for left direction
      // Step 2: Process the temp array from left to right
      for (let i = 0; i < temp.length; i++) {
        if (i < temp.length - 1 && temp[i] === temp[i + 1]) {
          // If two adjacent numbers are the same, sum them
          const sum = temp[i] + temp[i + 1];
          result[index] = sum;
          updateCurrentScore(sum);
          i++; // Skip the next number since it's merged
        } else {
          // Otherwise, just move the number
          result[index] = temp[i];
        }
        index++; // Move to the next slot in the result array
      }
    } else {
      throw new Error(
        'Invalid direction. Use "left", "right", "up" or "down".'
      );
    }

    return result;
  }

  // Update rows based on direction
  function updateRows(direction) {
    // Process each row
    for (let i = 0; i < totalTiles; i += gridWidth) {
      const row = [];

      // Collect values for the current row
      for (let j = 0; j < gridWidth; j++) {
        row.push(tileNumbers[i + j]);
      }

      const updatedRow = moveAndSum(row, direction);

      // Update the tiles for the current row
      for (let j = 0; j < gridWidth; j++) {
        tileNumbers[i + j] = updatedRow[j];
        tileDivs[i + j].innerHTML = updatedRow[j] === 0 ? '' : updatedRow[j];
      }
    }

    generateNumber();
    addColors();
    checkForWin();
    checkForGameOver();
  }

  // Update columns based on direction
  function updateColumns(direction) {
    // Process each column
    for (let i = 0; i < gridWidth; i++) {
      const column = [];

      // Collect values for the current column
      for (let j = 0; j < totalTiles; j += gridWidth) {
        column.push(tileNumbers[i + j]);
      }

      const updatedColumn = moveAndSum(column, direction);

      // Update the tiles for the current column
      for (let j = 0, k = 0; j < totalTiles; j += gridWidth, k++) {
        tileNumbers[i + j] = updatedColumn[k];
        tileDivs[i + j].innerHTML =
          updatedColumn[k] === 0 ? '' : updatedColumn[k];
      }
    }

    generateNumber();
    addColors();
    checkForWin();
    checkForGameOver();
  }

  // Detect direction of the input event
  function control(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      updateRows('left');
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      updateRows('right');
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
      updateColumns('up');
    } else if (e.key === 'ArrowDown' || e.key === 's') {
      updateColumns('down');
    }
  }

  // Group and add event listeners to start the game
  function addControlListeners() {
    document.addEventListener('keydown', control);
    gridDisplay.addEventListener('touchstart', startTouch);
    gridDisplay.addEventListener('touchmove', moveTouch);
  }

  // Group and remove event listeners to stop the game
  function removeControlListeners() {
    document.removeEventListener('keydown', control);
    gridDisplay.removeEventListener('touchstart', startTouch);
    gridDisplay.removeEventListener('touchmove', moveTouch);
  }

  // Start a new game
  buttonNewGame.addEventListener('click', () => startNewGame());

  function startNewGame(changeMode = false) {
    setBestScore();
    currentScore = 0;
    currentScoreDisplay.innerHTML = currentScore;
    if (changeMode) changeGameMode();
    loadGameMode();
    gameModeDisplay.innerHTML = currentGameMode;
    loadBestScore();
    createGameBoard();
    addColors();
    removeControlListeners();
    addControlListeners();
  }

  // When the user clicks the logo, open the modal with the option to change the game mode
  gameModeDisplay.onclick = function () {
    modalText.innerHTML = `Do you want to switch the game mode to <span>${targetGameMode}</span>?`;
    showModal();
    buttonYes.onclick = function () {
      startNewGame((changeMode = true));
      hideModal();
    };
  };

  // The "no" button always closes the modal
  buttonNo.onclick = function () {
    hideModal();
  };

  function showModal() {
    modalBackdrop.classList.add('modal-fade');
    modal.classList.add('modal-fade');
  }

  function hideModal() {
    modalBackdrop.classList.remove('modal-fade');
    modal.classList.remove('modal-fade');
  }

  // Initialize game
  loadGameMode();
  gameModeDisplay.innerHTML = currentGameMode;
  loadBestScore();
  createGameBoard();
  addColors();
  addControlListeners();

  // Detect touch swipe gestures
  // https://www.kirupa.com/html5/detecting_touch_swipe_gestures.htm
  let initialX = null;
  let initialY = null;

  function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
  }

  function moveTouch(e) {
    if (initialX === null) {
      return;
    }

    if (initialY === null) {
      return;
    }

    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;

    let diffX = initialX - currentX;
    let diffY = initialY - currentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // sliding horizontally
      if (diffX > 0) {
        // swiped left
        updateRows('left');
      } else {
        // swiped right
        updateRows('right');
      }
    } else {
      // sliding vertically
      if (diffY > 0) {
        // swiped up
        updateColumns('up');
      } else {
        // swiped down
        updateColumns('down');
      }
    }

    initialX = null;
    initialY = null;

    e.preventDefault();
  }
});
