window.onload = () => {
  const board = document.querySelector(".dice-board");
  const addDiceGameBtn = document.querySelector(".add-dice-game");
  setUpAddGameListener(addDiceGameBtn, board, gameFactory());
};

const setUpAddGameListener = (btn, board, gameFactory) => {
  btn.addEventListener("click", () =>
    appendGameToBoard(board, gameFactory.initializeGame())
  );
};

const appendGameToBoard = (board, game) => {
  console.log("THE DICE GAME HTML ELEMENTS: ", game.initializeNewGameHtml);
  const diceContainer = makeHtmlElements(game.initializeNewGameHtml());
  console.log(diceContainer);
  board.appendChild(diceContainer);
};

const makeHtmlElements = diceGameHtmlElements => {
  const mainContainer = document.createElement(diceGameHtmlElements.htmlType);
  mainContainer.setAttribute("class", diceGameHtmlElements.className);
  return iterateAndAppendChildren(mainContainer, diceGameHtmlElements.children);
};

// Recursive function which maps over an array of html elements
// to be created and appends those elements to their parent.
// If the current child happens to also have children, then the recursive
// case is hit, and we do the first two lines of this comment to that child element,
// and so on and so forth if that child's child happens to have children.
const iterateAndAppendChildren = (parent, childrenArr) => {
  const childrenHtmlElements = childrenArr.map(child => {
    let htmlInstance = document.createElement(child.htmlType);
    if (child.hasOwnProperty("innerText")) {
      htmlInstance.innerText = child.innerText;
    }
    if (child.hasOwnProperty("className")) {
      htmlInstance.setAttribute("class", child.className);
    }
    if (child.hasOwnProperty("children")) {
      htmlInstance = iterateAndAppendChildren(htmlInstance, child.children);
    }
    if (child.htmlType === "button") {
      htmlInstance.addEventListener("click", child.onClick);
    }
    return htmlInstance;
  });
  childrenHtmlElements.forEach(child => parent.appendChild(child));
  return parent;
};

const gameFactory = () => {
  let count = 0;
  return {
    initializeGame: function() {
      const gameId = count;
      const config = {
        gameId,
        rollCallback: this.reRenderCurrentGame,
        rolls: [],
        rollCount: 0,
        mean: 0,
        median: 0,
        mode: 0
      };
      count++;
      return new RollTracker(config);
    },
    reRenderCurrentGame: function(gameId, updatedDiceGame) {
      // grab game-${gameId}
      const diceGameHtml = document.querySelector(`.game-${gameId}`);
      console.log("RE RENDERING: ", updatedDiceGame);
      const { rolls, mean, median, mode } = updatedDiceGame;
      // The h3
      diceGameHtml.childNodes[0].textContent = `Rolled: ${rolls}`;
      // The stats div
      const [
        meanHtmlEl,
        medianHtmlEl,
        modeHtmlEl
      ] = diceGameHtml.childNodes[1].childNodes;
      meanHtmlEl.textContent = mean;
      medianHtmlEl.textContent = median;
      modeHtmlEl.textContent = mode;
    }
  };
};

class RollTracker {
  constructor(config) {
    const {
      gameId,
      rollCallback,
      rolls,
      rollCount,
      mean,
      median,
      mode
    } = config;
    console.log("THE ROLL CALLBACK: ", rollCallback);
    this.gameId = gameId;
    this.rollCallback = rollCallback;
    this.rolls = rolls;
    this.rollCount = rollCount;
    this.mean = mean;
    this.median = median;
    this.mode = mode;
  }

  diceRoll() {
    return Math.ceil(Math.random() * 6) * 2;
  }

  rollIt() {
    this.rollCount++;
    this.rolls.push(this.diceRoll());
    const { mean, median, mode } = this.calculateStatsOnRoll();
    let config = {
      gameId: this.gameId,
      rollCallback: this.rollCallback,
      rolls: this.rolls,
      rollCount: this.rollCount,
      mean: mean,
      median: median,
      mode: mode
    };
    return new RollTracker(config);
  }

  calculateMean(rolls, count) {
    const sum = rolls.reduce((acc, num) => {
      acc = acc + num;
      return acc;
    }, 0);
    return sum / count;
  }

  calculateMedian(rolls, count) {
    const leastToGreatest = (a, b) => a - b;
    const mid = Math.floor(count / 2);
    return rolls.sort(leastToGreatest)[mid];
  }

  calculateMode(rolls) {
    const { trackMap, uniqueNums } = rolls.reduce(
      (acc, num) => {
        if (!acc.trackMap[num]) {
          acc.trackMap[num] = 1;
          acc.uniqueNums.push(num);
        } else {
          acc.trackMap[num]++;
        }
        return acc;
      },
      { trackMap: {}, uniqueNums: [] }
    );
    const { mode } = uniqueNums.reduce(
      (acc, num) => {
        // Facilities bimodal/trimodal/quadrimodal
        if (trackMap[num] === acc.amount) {
          acc.mode.push(num);
        }
        if (trackMap[num] > acc.amount) {
          acc.mode = [];
          acc.mode.push(num);
          acc.amount = trackMap[num];
        }
        return acc;
      },
      { mode: [], amount: 0 }
    );
    return mode;
  }

  calculateStatsOnRoll() {
    const mean = this.calculateMean(this.rolls, this.rollCount);
    const median = this.calculateMedian(this.rolls, this.rollCount);
    const mode = this.calculateMode(this.rolls);
    return { mean, median, mode };
  }

  reRenderUpdatedGameHtml() {
    const gameAfterRoll = this.rollIt();
    this.rollCallback(this.gameId, gameAfterRoll);
  }

  initializeNewGameHtml() {
    return {
      htmlType: "div",
      className: `dice-game-container game-${this.gameId}`,
      children: [
        { htmlType: "h3", innerText: `Rolled: ${this.rolls.toString()}` },
        {
          htmlType: "div",
          className: "rolled-stats-container",
          children: [
            {
              htmlType: "h4",
              className: "mean",
              innerText: `Mean: ${this.mean}`
            },
            {
              htmlType: "h4",
              className: "median",
              innerText: `Median: ${this.median}`
            },
            {
              htmlType: "h4",
              className: "mode",
              innerText: `Mode: ${this.mode.toString()}`
            }
          ]
        },
        {
          htmlType: "button",
          className: "roll-btn",
          innerText: "Roll!",
          // removing the click event listener on this
          // element on rerender is necessary.
          onClick: this.reRenderUpdatedGameHtml.bind(this)
        }
      ]
    };
  }
}

// Straight from MDN:
//   To compare numbers instead of strings, the compare function can simply subtract b from a.
//   The following function will sort the array ascending (if it doesn't contain Infinity and NaN):
const leastToGreatest = (a, b) => a - b;
// I think there's more to picking a median than just this, but it'll do for now.
const median = (rolls, count) => rolls.sort(leastToGreatest)[count / 2];
