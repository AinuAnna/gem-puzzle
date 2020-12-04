//create class Button and methods with moving
const SIZE = 4;
class Button {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  _getTopButton() {
    return (this.y === 0) ? null : new Button(this.x, this.y - 1);
  }

  _getRightButton() {
    return (this.x === SIZE - 1) ? null : new Button(this.x + 1, this.y);
  }

  _getBottomButton() {
    return (this.y === SIZE - 1) ? null : new Button(this.x, this.y + 1);
  }

  _getLeftButton() {
    return (this.x === 0) ? null : new Button(this.x - 1, this.y);
  }

  getNextdoorButtons() {
    return [
      this._getTopButton(),
      this._getRightButton(),
      this._getBottomButton(),
      this._getLeftButton()
    ].filter(button => button !== null);
  }
  //Random buttons
  getRandomNextdoorButton() {
    const nextdoorButtons = this.getNextdoorButtons();
    return nextdoorButtons[Math.floor(Math.random() * nextdoorButtons.length)];
  }
}
//create swap
const swapButtons = (grid, button1, button2) => {
  const temp = grid[button1.y][button1.x];
  grid[button1.y][button1.x] = grid[button2.y][button2.x];
  grid[button2.y][button2.x] = temp;
};

const isSolved = grid => {
  let count = 1;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (grid[i][j] != count) {
        return false;
      }
      count++;
      if ((count) > 15) {
        count = 0;
      }
    }
  }
  return grid;

};
function getArray() {
  let grid = [];
  for (let i = 0; i < SIZE; i++) {
    grid[i] = [];
    for (let j = 0; j < SIZE; j++) {
      grid[i][j] = 0;
    }
  }
  return grid;
}

function getWriteAnswer() {
  let count = 0;
  let grid = [];
  for (let i = 0; i < SIZE; i++) {
    grid[i] = [];
    for (let j = 0; j < SIZE; j++) {
      grid[i][j] = count;
      count++;
    }
  }
  return grid;
}
const getRandomGrid = () => {

  let grid = getWriteAnswer();

  // Shuffle
  const LIMIT = 1000;
  let blankButton = new Button(SIZE - 1, SIZE - 1);
  for (let i = 0; i < LIMIT; i++) {
    const randomNextdoorButton = blankButton.getRandomNextdoorButton();
    swapButtons(grid, blankButton, randomNextdoorButton);
    blankButton = randomNextdoorButton;
  }

  return isSolved(grid) ? getRandomGrid() : grid;
};


class Condition {
  constructor(grid, movesCount, time, status) {
    this.grid = grid;
    this.movesCount = movesCount;
    this.time = time;
    this.status = status;
  }

  static ready() {
    return new Condition(
      getArray(),
      0,
      0,
      "ready"
    );
  }

  static start() {
    return new Condition(getRandomGrid(), 0, 0, "playing");
  }
}

class Game {
  constructor(condition) {
    this.condition = condition;
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    this.handleClickButton = this.handleClickButton.bind(this);
  }

  padStart(number) {
    number = '0' + number;
    return number.substr(number.length - 2);
  }
  timerFormat(ticks) {
    let seconds = ticks;
    let hour = Math.floor(seconds / 3600);
    let minute = Math.floor((seconds / 60) % 60);
    let second = seconds % 60;

    let result = this.padStart(hour) + ':' + this.padStart(minute) + ':' + this.padStart(second);
    return result;
  }

  static ready() {
    return new Game(Condition.ready());
  }

  tick() {
    this.setCondition({ time: this.condition.time + 1 });

  }

  setCondition(newCondition) {
    this.condition = { ...this.condition, ...newCondition };
    this.render();
  }

  handleClickButton(button) {
    return function () {
      const nextdoorButtons = button.getNextdoorButtons();
      const blankButton = nextdoorButtons.find(
        nextdoorButton => this.condition.grid[nextdoorButton.y][nextdoorButton.x] === 0
      );
      if (blankButton) {
        const newGrid = [...this.condition.grid];
        swapButtons(newGrid, button, blankButton);
        if (isSolved(newGrid)) {
          clearInterval(this.tickId);
          this.setCondition({
            status: "won",
            grid: newGrid,
            movesCount: this.condition.movesCount + 1
          });
        } else {
          this.setCondition({
            grid: newGrid,
            movesCount: this.condition.movesCount + 1
          });
        }
      }
    }.bind(this);
  }

  render() {
    const { grid, movesCount, time, status } = this.condition;

    // Render grid
    const newGrid = document.createElement("div");
    newGrid.className = "grid";
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const button = document.createElement("button");

        if (status === "playing") {
          button.addEventListener("click", this.handleClickButton(new Button(j, i)));
        }

        button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
        newGrid.appendChild(button);
      }
    }
    document.querySelector(".grid").replaceWith(newGrid);

    // Render button
    const newButton = document.createElement("button");
    if (status === "ready" || status === "won") newButton.textContent = "Play";
    if (status === "playing") newButton.textContent = "Reset";

    newButton.addEventListener("click", () => {
      this.tickId = setInterval(this.tick, 1000);
      this.setCondition(Condition.start());
    });
    document.querySelector(".wrapper button").replaceWith(newButton);

    // Render movesCount
    document.getElementById("count").textContent = `Move: ${movesCount}`;

    // Render time
    document.getElementById("time").textContent = `Time: ${this.timerFormat(time)}`;

    //Render result

    // Render message
    if (status === "won") {
      document.getElementById("message").textContent = `Hooray! You solved the puzzle in ${this.timerFormat(time)} and ${movesCount} steps!`;
    } else {
      document.getElementById("message").textContent = "";
    }
  }
}

//Run
const GAME = Game.ready();