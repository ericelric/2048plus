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
  let gridWidth = 4;
  let totalTiles = gridWidth * gridWidth;
  let tiles = [];
  let bestScore = 0;
  let currentScore = 0;
  let currentGameMode = 2048;
  let targetGameMode = 4096;

  // Create the game board with two random numbers
  function createGameBoard() {
    tiles = [];
    gridDisplay.innerHTML = '';
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('div');
      tile.innerHTML = 0;
      gridDisplay.appendChild(tile);
      tiles.push(tile);
    }
    generateNumber();
    generateNumber();
    gridDisplay.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
  }

  // Generate a new number on the board
  function generateNumber() {
    const emptyTiles = tiles.filter((tile) => tile.innerHTML == 0);

    if (emptyTiles.length > 0) {
      const randomTile =
        emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

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

  // Update score
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
    }
  }

  // Add tile colors based on values
  function addColors() {
    tiles.forEach((tile) => {
      const value = parseInt(tile.innerHTML);
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
    const temp = [];

    // Fill temp array with all current numbers on the board
    tiles.forEach((tile) => temp.push(parseInt(tile.innerHTML)));

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
    if (tiles.some((tile) => tile.innerHTML == currentGameMode)) {
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
    document.removeEventListener('keydown', control);
    setBestScore();
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
        row.push(parseInt(tiles[i + j].innerHTML));
      }

      const updatedRow = moveAndSum(row, direction);

      // Update the tiles for the current row
      for (let j = 0; j < gridWidth; j++) {
        tiles[i + j].innerHTML = updatedRow[j];
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
        column.push(parseInt(tiles[i + j].innerHTML));
      }

      const updatedColumn = moveAndSum(column, direction);

      // Update the tiles for the current column
      for (let j = 0, k = 0; j < totalTiles; j += gridWidth, k++) {
        tiles[i + j].innerHTML = updatedColumn[k];
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

  // Start a new game
  buttonNewGame.addEventListener('click', () => startNewGame());

  function startNewGame() {
    setBestScore();
    currentScore = 0;
    currentScoreDisplay.innerHTML = currentScore;
    loadGameMode();
    gameModeDisplay.innerHTML = currentGameMode;
    loadBestScore();
    createGameBoard();
    addColors();
    document.removeEventListener('keydown', control);
    document.addEventListener('keydown', control);
  }

  // When the user clicks the logo, open the modal with the option to change the game mode
  gameModeDisplay.onclick = function () {
    modalText.innerHTML = `Do you want to switch the game mode to <span>${targetGameMode}</span>?`;
    showModal();
    buttonYes.onclick = function () {
      changeGameMode();
      startNewGame();
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
  document.addEventListener('keydown', control);
});
