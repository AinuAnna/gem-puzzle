//create class Button and methods with moving
const SIZE = 4;
class Button {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getTopButton() {
    if (this.y === 0) return null;
    return new Button(this.x, this.y - 1);
  }

  getRightButton() {
    if (this.x === (SIZE - 1)) return null;
    return new Button(this.x + 1, this.y);
  }

  getBottomButton() {
    if (this.y === (SIZE - 1)) return null;
    return new Button(this.x, this.y + 1);
  }

  getLeftButton() {
    if (this.x === 0) return null;
    return new Button(this.x - 1, this.y);
  }

  getNextdoorButtons() {
    return [
      this.getTopButton(),
      this.getRightButton(),
      this.getBottomButton(),
      this.getLeftButton()
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
  return (
    grid[0][0] === 1 &&
    grid[0][1] === 2 &&
    grid[0][2] === 3 &&
    grid[0][3] === 4 &&
    grid[1][0] === 5 &&
    grid[1][1] === 6 &&
    grid[1][2] === 7 &&
    grid[1][3] === 8 &&
    grid[2][0] === 9 &&
    grid[2][1] === 10 &&
    grid[2][2] === 11 &&
    grid[2][3] === 12 &&
    grid[3][0] === 13 &&
    grid[3][1] === 14 &&
    grid[3][2] === 15 &&
    grid[3][3] === 0
  );
};

const getRandomGrid = () => {
  let grid = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 0]];

  // Shuffle
  let LIMIT = 1000;
  let blankButton = new Button(3, 3);
  for (let i = 0; i < LIMIT; i++) {
    const randomNextdoorButton = blankButton.getRandomNextdoorButton();
    swapButtons(grid, blankButton, randomNextdoorButton);
    blankButton = randomNextdoorButton;
  }

  if (isSolved(grid)) return getRandomGrid();
  return grid;
};


class Condition {
  constructor(grid, count, time, status) {
    this.grid = grid;
    this.count = count;
    this.time = time;
    this.status = status;
  }

  static ready() {
    return new Condition(
      [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
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

  pad2(number) {
    number = '0' + number;
    return number.substr(number.length - 2);
  }
  timerFormat(ticks) {
    let seconds = ticks;
    let hour = Math.floor(seconds / 3600);
    let minute = Math.floor((seconds / 60) % 60);
    let second = seconds % 60;

    let result = this.pad2(hour) + ':' + this.pad2(minute) + ':' + this.pad2(second);
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
            count: this.condition.count + 1
          });
        } else {
          this.setCondition({
            grid: newGrid,
            count: this.condition.count + 1
          });
        }
      }
    }.bind(this);
  }

  render() {
    const { grid, count, time, status } = this.condition;

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
    if (status === "ready") newButton.textContent = "Play";
    if (status === "playing") newButton.textContent = "Reset";
    if (status === "won") newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      this.tickId = setInterval(this.tick, 1000);
      this.setCondition(Condition.start());
    });
    document.querySelector(".wrapper button").replaceWith(newButton);

    // Render count
    document.getElementById("count").textContent = `Move: ${count}`;

    // Render time
    document.getElementById("time").textContent = `Time: ${this.timerFormat(time)}`;

    //Render result

    // Render message
    if (status === "won") {
      document.getElementById("message") = `Hooray! You solved the puzzle in ${time} and ${count}!`;
    } else {
      document.getElementById("message").textContent = "";
    }
  }
}

//Run
const GAME = Game.ready();