//create class Button and methods with moving
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
      if (this.x === 3) return null;
      return new Button(this.x + 1, this.y);
    }
  
    getBottomButton() {
      if (this.y === 3) return null;
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
      ].filter(Button => Button !== null);
    }
    //Random buttons
    getRandomNextdoorButton() {
      const nextdoorButtons = this.getNextdoorButtons();
      return nextdoorButtons[Math.floor(Math.random() * nextdoorButtons.length)];
    }
  }
  //create swap
  const swapButtons = (grid, Button1, Button2) => {
    const temp = grid[Button1.y][Button1.x];
    grid[Button1.y][Button1.x] = grid[Button2.y][Button2.x];
    grid[Button2.y][Button2.x] = temp;
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
    let blankButton = new Button(3, 3);
    for (let i = 0; i < 1000; i++) {
      const randomNextdoorButton = blankButton.getRandomNextdoorButton();
      swapButtons(grid, blankButton, randomNextdoorButton);
      blankButton = randomNextdoorButton;
    }
  
    if (isSolved(grid)) return getRandomGrid();
    return grid;
  };
  
  
  class Condition {
    constructor(grid, move, time, status) {
      this.grid = grid;
      this.move = move;
      this.time = time;
      this.status = status;
    }
  
    static ready() {
      return new Condition(
        [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        0,
        "00:00",
        "ready"
      );
    }
  
    static start() {
      return new Condition(getRandomGrid(), 0, "00:00", "playing");
    }
  }
  //timer
  function startTimer(display) {
    var timer = minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

    }, 1000);
}

  class Game {
    constructor(Condition) {
      this.Condition = Condition;
      this.tickId = null;
      //  this.tick = this.tick.bind(this);
       this.render();
      this.handleClickButton = this.handleClickButton.bind(this);
    }
  
    static ready() {
      return new Game(Condition.ready());
    }

    // //time
    // tick() {
    //   this.setCondition({ time: this.Condition.time + 1});
    // }
  
    setCondition(newCondition) {
      this.Condition = { ...this.Condition, ...newCondition };
      this.render();
    }
  
    handleClickButton(Button) {
      return function() {
        const nextdoorButtons = Button.getNextdoorButtons();
        const blankButton = nextdoorButtons.find(
          nextdoorButton => this.Condition.grid[nextdoorButton.y][nextdoorButton.x] === 0
        );
        if (blankButton) {
          const newGrid = [...this.Condition.grid];
          swapButtons(newGrid, Button, blankButton);
          if (isSolved(newGrid)) {
            clearInterval(this.tickId);
            this.setCondition({
              status: "won",
              grid: newGrid,
              move: this.Condition.move + 1
            });
          } else {
            this.setCondition({
              grid: newGrid,
              move: this.Condition.move + 1
            });
          }
        }
      }.bind(this);
    }
  
    render() {
      const { grid, move, time, status } = this.Condition;
  
      // Render grid
      const newGrid = document.createElement("div");
      newGrid.className = "grid";
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const button = document.createElement("button");
  
          if (status === "playing") {
            button.addEventListener("click", this.handleClickButton(new Button(j, i)));
          }
  
          button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
          newGrid.appendChild(button);
        }
      }
      document.querySelector(".grid").replaceWith(newGrid);
      // document.getElementById("result").replaceWith(newGrid);
      
      // Render button
      const newButton = document.createElement("button");
      if (status === "ready") newButton.textContent = "Play";
      if (status === "playing") newButton.textContent = "Reset";
      if (status === "won") newButton.textContent = "Play";
      newButton.addEventListener("click", () => {
        clearInterval(this.tickId);
        this.setCondition(Condition.start());
      });
      document.querySelector(".header button").replaceWith(newButton);
  
      // Render move
      document.getElementById("move").textContent = `Move: ${move}`;
  
      // Render time
      document.getElementById("time").textContent = `Time: ${time}`;
  
      // Render message
      if (status === "won") {
        document.querySelector(".message").textContent = "You win!";
      } else {
        document.querySelector(".message").textContent = "";
      }
    }
  }

  //drug-and-drop
  const dragAndDrop = () => {
    const card = document.querySelector('.grid');
    const cells = document.querySelectorAll('.grid');

    const dragStart = function () {
        setTimeout(() => {
            this.classList.add('hide');
        }, 0);
    };
    
    const dragEnd = function () {
        this.classList.remove('hide');
    };

    const dragOver = function (evt) {
        evt.preventDefault();
    };

    const dragEnter = function (evt) {
        evt.preventDefault();
        this.classList.add('hovered');
    };

    const dragLeave = function () {
        this.classList.remove('hovered');
    };

    const dragDrop = function () {
        this.append(card);
        this.classList.remove('hovered');
    };

    cells.forEach(cell => {
        cell.addEventListener('dragover', dragOver);
        cell.addEventListener('dragenter', dragEnter);
        cell.addEventListener('dragleave', dragLeave);
        cell.addEventListener('drop', dragDrop);
    });


    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
};
dragAndDrop();

  //Run
  const GAME = Game.ready(); 