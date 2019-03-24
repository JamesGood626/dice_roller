window.onload = () => {
  const board = document.querySelector(".dice-board");
  const addDiceGameBtn = document.querySelector(".add-dice-game");
  const diceGameHtmlElements = {
    htmlType: "div",
    className: "dice-game-container",
    children: [
      { htmlType: "h3", innerText: "Rolled:" },
      {
        htmlType: "div",
        className: "rolled-stats-container",
        children: [
          { htmlType: "h4", className: "mean" },
          { htmlType: "h4", className: "median" },
          { htmlType: "h4", className: "mode" }
        ]
      }
    ]
  };
  setUpAddGameListener(addDiceGameBtn, board, diceGameHtmlElements);
};

// About to use this to create dynamic html
const initializeNewGameHtml = (rolled, mean, median, mode) => ({
  htmlType: "div",
  className: "dice-game-container",
  children: [
    { htmlType: "h3", innerText: `Rolled: ${rolled}` },
    {
      htmlType: "div",
      className: "rolled-stats-container",
      children: [
        { htmlType: "h4", className: "mean", innerHtml: `Mean: ${mean}` },
        { htmlType: "h4", className: "median", innerHtml: `Median: ${median}` },
        { htmlType: "h4", className: "mode", innerHtml: `Mode: ${mode}` }
      ]
    }
  ]
});

const setUpAddGameListener = (btn, board, diceGameHtmlElements) => {
  btn.addEventListener("click", () =>
    appendGameToBoard(board, diceGameHtmlElements)
  );
};

const appendGameToBoard = (board, diceGameHtmlElements) => {
  const diceContainer = makeHtmlElements(diceGameHtmlElements);
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
    return htmlInstance;
  });
  childrenHtmlElements.forEach(child => parent.appendChild(child));
  return parent;
};

function RollTrack(rolls, rollCount) {
  return {
    rolls: rolls,
    rollCount: rollCount,
    diceRoll: function() {
      return Math.ceil(Math.random() * 6) * 2;
    },
    rollIt: function() {
      this.rollCount++;
      this.rolls.push(this.diceRoll());
      return this.newRollTracker(this.rolls, this.rollCount);
    },
    newRollTracker: function(rolls, rollCount) {
      return new RollTrack(rolls, rollCount);
    }
  };
}

const mean = (rolls, count) =>
  rolls.reduce((acc, num) => {
    acc = acc + num;
    return acc;
  }, 0) / count;

// Straight from MDN:
//   To compare numbers instead of strings, the compare function can simply subtract b from a.
//   The following function will sort the array ascending (if it doesn't contain Infinity and NaN):
const leastToGreatest = (a, b) => a - b;
// I think there's more to picking a median than just this, but it'll do for now.
const median = (rolls, count) => rolls.sort(leastToGreatest)[count / 2];

const tracker = new RollTrack([], 0);
// console.log("tracker: ", tracker);
const tracker2 = tracker.rollIt();
// console.log("tracker2: ", tracker2);
const tracker3 = tracker2.rollIt();
// console.log("tracker3: ", tracker3);

// console.log(tracker === tracker2);
// console.log(tracker2 === tracker3);

const tracker4 = tracker3.rollIt();
const tracker5 = tracker4.rollIt();
const tracker6 = tracker5.rollIt();
const tracker7 = tracker6.rollIt();

console.log("THE ROLLS: ", tracker7.rolls);
console.log(mean(tracker7.rolls, tracker7.rollCount));
console.log("THE MEDIAN: ");
console.log(tracker7.rolls.sort(leastToGreatest));
console.log(median(tracker7.rolls, tracker7.rollCount));
