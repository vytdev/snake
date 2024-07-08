(function (fn) {
  "use strict";

  // wait until dom was fully loaded
  window.onload = fn;
})(function () {
  "use strict";

  // ==================== CONFIG ====================
  // table dimensions
  var width = 30;
  var height = 30;
  // snake speed (box per second)
  var speed = 10;
  // start pos
  var startX = width / 2;
  var startY = height / 2;
  // default direction of the snake
  var defaultDirection = "DOWN";

  // ==================== VARS ====================
  // enum containing allowed classes in the table
  var Classes = (function(val) {
    val[val["head"] = "HEAD"] = "head";
    val[val["snake"] = "SNAKE"] = "snake";
    val[val["food"] = "FOOD"] = "food";
    val[val["wall"] = "WALL"] = "wall";
    val[val["portal"] = "PORTAL"] = "portal";
    val[val[""] = "EMPTY"] = "";
    return val;
  })({});
  // enum containing current snake direction
  var Directions = (function(val) {
    val[val["up"] = "UP"] = "up";
    val[val["down"] = "DOWN"] = "down";
    val[val["left"] = "LEFT"] = "left";
    val[val["right"] = "RIGHT"] = "right";
    return val;
  })({});
  // just normalize config
  width--;
  height--;
  speed = 1000 / speed;
  var running = false; // whether the game is running
  var active = false; // whether the game is active
  var table = document.getElementById("table"); // the table
  var cells = []; // 2-dimensional table cells
  var direction = Directions[defaultDirection]; // the current snake direction
  var dirUpdated = false; // whether the direction was updated
  var foodPosX = 0; // x pos of food
  var foodPosY = 0; // y pos of food
  var headPosX = 0; // x pos of head
  var headPosY = 0; // y pos of head
  var wallPoints = []; // points in wall
  var bodyPoints = []; // points of body position stack (an array of number pairs)
  var currLen = 0; // snake size counter
  var length = document.getElementById("length"); // snake size meter
  var toggle = document.getElementById("toggle"); // start, pause, continue btn
  var currSpeed = document.getElementById("current-speed"); // speedometer

  console.log("Generating table ...");

  for (var x = 0; x <= width; x++) {
    var xrow = document.createElement("div");
    cells[x] = [];
    for (var y = 0; y <= height; y++) {
      var cell = document.createElement("div");
      xrow.appendChild(cell);
      cells[x][y] = cell;
    }
    table.appendChild(xrow);
  }

  console.log((width + 1)+ "x" + (height + 1) + " snake table was generated");

  // adds a wall
  function addWall(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    wallPoints.push([x, y]);
    cells[x][y].classList.value = Classes.WALL;
  }

  // returns true if given x and y points is a wall
  function isWall(x, y) {
    for (var i = 0; i < wallPoints.length; i++) {
      if (wallPoints[i][0] == x && wallPoints[i][1] == y) {
        return true;
      }
    }
    return false;
  }

  // get a random safe point
  function randomPoint() {
    var x = 0, y = 0;
    do {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
    } while (checkPoint(x ,y) || isWall(x, y));
    return [x, y];
  }

  // generate random food location
  function randomFood(init) {
    cells[foodPosX][foodPosY].classList.value = Classes.EMPTY;
    var rand = randomPoint();
    foodPosX = rand[0];
    foodPosY = rand[1];
    cells[foodPosX][foodPosY].classList.value = Classes.FOOD;
  }

  // check if given x and y point are the head or part of the body of the snake
  function checkPoint(x, y, noHead) {
    if (!noHead && x == headPosX && y == headPosY) { return true; }
    for (var i = 0; i < currLen; i++) {
      var point = bodyPoints[i];
      if (!point) continue;
      if (point[0] == x && point[1] == y) { return true; }
    }
    return false;
  }

  // reset state
  function reset() {
    if (running) return;
    length.innerHTML = '0';
    cells[headPosX][headPosY].classList.value = Classes.EMPTY;
    headPosX = Math.floor((startX - 1) ||(width + 1) / 2);
    headPosY = Math.floor((startY - 1) || (height + 1) / 2);
    direction = Directions[defaultDirection];
    for (var i = 0; i < currLen + 1; i++) {
      var point = bodyPoints[i];
      if (!point) continue;
      cells[point[0]][point[1]].classList.value = Classes.EMPTY;
    }
    bodyPoints = [];
    currLen = 0;
    randomFood();
    generateWall();
    active = false;
  }

  // player loose
  function loose() {
    if (!running) return;
    toggle.innerHTML = "RE-START";
    running = false;
    active = false;
    alert("You loose");
  }

  // performs the loop
  function update() {
    // check if game is running or active
    if (!running || !active) return;
    var lastHeadPosX = headPosX, lastHeadPosY = headPosY;
    // move the snake
    if (direction == Directions.UP) headPosY--;
    if (direction == Directions.DOWN) headPosY++;
    if (direction == Directions.LEFT) headPosX--;
    if (direction == Directions.RIGHT) headPosX++;
    dirUpdated = true;
    // check for the snake if reached the end (make it loop)
    if (headPosX == -1) headPosX = width;
    if (headPosY == -1) headPosY = height;
    if (headPosX > width && direction == Directions.RIGHT) headPosX = 0;
    if (headPosY > height && direction == Directions.DOWN) headPosY = 0;
    // new body position
    bodyPoints.unshift([lastHeadPosX, lastHeadPosY]);
    // check if snake hit itself or a wall
    if (checkPoint(headPosX, headPosY, true) || isWall(headPosX, headPosY)) {
      headPosX = lastHeadPosX;
      headPosY = lastHeadPosY;
      return loose();
    }
    cells[lastHeadPosX][lastHeadPosY].classList.value = Classes.SNAKE;
    // check if food was eaten
    if (foodPosX == lastHeadPosX && foodPosY == lastHeadPosY) {
      randomFood();
      currLen++;
      cells[lastHeadPosX][lastHeadPosY].classList.value = Classes.SNAKE;
    }
    else {
      var lastPoint = bodyPoints.pop();
      cells[lastPoint[0]][lastPoint[1]].classList.value = Classes.EMPTY;
    }
    // update head position
    cells[headPosX][headPosY].classList.value = Classes.HEAD;
    // show current length (plus one, we consider the head)
    length.innerHTML = (currLen + 1).toString();
    // loop update
    setTimeout(update, speed);
  }

  // movement keys
  document.getElementById(Directions.UP).onclick = function() {
    if (running && dirUpdated && direction != Directions.DOWN) {
      direction = Directions.UP;
      dirUpdated = false;
    }
  };
  document.getElementById(Directions.DOWN).onclick = function() {
    if (running && dirUpdated && direction != Directions.UP) {
      direction = Directions.DOWN;
      dirUpdated = false;
    }
  };
  document.getElementById(Directions.LEFT).onclick = function() {
    if (running && dirUpdated && direction != Directions.RIGHT) {
      direction = Directions.LEFT;
      dirUpdated = false;
    }
  };
  document.getElementById(Directions.RIGHT).onclick = function() {
    if (running && dirUpdated && direction != Directions.LEFT) {
      direction = Directions.RIGHT;
      dirUpdated = false;
    }
  };
  // other keys
  toggle.onclick = function() {
    if (!active) { reset(); }
    running = !running;
    if (running) {
      active = true;
      update();
      this.innerHTML = "PAUSE";
    }
    else {
      this.innerHTML = "CONTINUE";
    }
  };
  document.getElementById("stop").onclick = function() {
    if (active) {
      running = false;
      reset();
      toggle.innerHTML = "START";
    }
  };
  document.getElementById("speed").onclick = function() {
    if (!active || !running) {
      var val = +prompt("Change speed:\nclamp inclusively between 1 to 15", Math.round(1000 / speed).toString());
      if (isNaN(val)) {
        return alert("Invalid speed");
      }
      if (val <= 0 || val > 15) {
        return alert("Must be within 1 and 15");
      }
      // change speed
      speed = 1000 / val;
      // change speed value
      currSpeed.innerHTML = Math.round(1000 / speed).toString();
    }
  };

  currSpeed.innerHTML = Math.round(1000 / speed).toString();

  // custom wall generator
  function generateWall() {
    // code here

    // Sample box wall
    for (var x = 0; x <= width; x++) {
      for (var y = 0; y <= height; y++) {
        if (x == 0 || x == width || y == 0 || y == height) {
          addWall(x, y);
        }
      }
    }
  }
});
