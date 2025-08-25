(function () {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  const chaserImage = document.getElementById("VikingsHelmet");

  const runButton = document.getElementById("runButton");

  let runInterval;
  runButton.addEventListener("click", function () {
    this.classList.toggle("active");

    if (this.classList.contains("active")) {
      this.textContent = "Pause";
      startGame();
    } else {
      this.textContent = "Resume";
      pauseGame();
    }
  });

  window.addEventListener("resize", resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    chaserX = canvas.width / 2;
    chaserY = canvas.height / 2;

    drawPlayerInit();

    draw();
  }

  // Chaser
  let chaserX;
  let chaserY;
  // Chaser DeltaX and DeltaY
  let dChaserX = (Math.random() - 0.5) * 4;
  let dChaserY = (Math.random() - 0.5) * 4;
  const chaserRadius = 50;

  //Players
  let players = [];
  let caught = [];

  readTextFile("js/players.json", function (text) {
    players = JSON.parse(text);
  });

  function readTextFile(file, callback) {
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
        callback(rawFile.responseText);
      }
    };
    rawFile.send(null);
  }

  function drawChaser() {
    // Draw Chaser
    ctx.beginPath();
    // Cicle - Testing
    ctx.arc(chaserX, chaserY, chaserRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    // Viking Helmet
    ctx.drawImage(
      chaserImage,
      chaserX - chaserRadius,
      chaserY - chaserRadius,
      100,
      100
    );
    ctx.closePath();
  }

  function drawPlayerInit() {
    const numOfPlayers = players.length;
    const angleOfIncrement = (2 * Math.PI) / numOfPlayers;

    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const locData = player.locationData;
      const currentAngle = i * angleOfIncrement;

      locData.xCoord = chaserX + chaserRadius * 4 * Math.cos(currentAngle);
      locData.yCoord = chaserY + chaserRadius * 4 * Math.sin(currentAngle);
    }
  }

  function drawPlayers() {
    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const locData = player.locationData;

      if (player.status === 1) {
        ctx.beginPath();
        ctx.arc(locData.xCoord, locData.yCoord, locData.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();

        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player.name, locData.xCoord, locData.yCoord);
      }
    }
  }

  function drawScoreBoard() {
    let order = caught.map((item) => item.name);
    let lineheight = 20;
    let x = 35;
    let y = 50;

    ctx.font = "16px Arial";
    ctx.fillStyle = "#000";
    for (let i = 0; i < order.length; ++i) {
      if (i === 0) {
        ctx.fillText("Order:", x, y + i * lineheight);
      }
      ctx.fillText(order[i], x, y + (i + 1) * lineheight);
    }
  }

  function collisionDetection() {
    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const locData = player.locationData;
      if (player.status === 1) {
        const dx = chaserX - locData.xCoord;
        const dy = chaserY - locData.yCoord;
        const distance = Math.hypot(dx, dy);
        const sumOfRadii = chaserRadius + locData.radius;

        if (distance <= sumOfRadii) {
          player.status = 0;
          caught.push(player);
          console.log("Got: " + player.name);

          if (players.length === caught.length) {
            clearInterval(runInterval);
            alert(`Pick Order:\n${caught.map((item) => item.name).join("\n")}`);
          }
        }
      }
    }
  }

  function checkWallCollision() {
    if (
      chaserX + dChaserX > canvas.width - chaserRadius ||
      chaserX + dChaserX < chaserRadius
    ) {
      dChaserX = -dChaserX;
    }
    if (
      chaserY + dChaserY > canvas.height - chaserRadius ||
      chaserY + dChaserY < chaserRadius
    ) {
      dChaserY = -dChaserY;
    }
    //Add Movement
    chaserX += dChaserX;
    chaserY += dChaserY;

    //Ramdom change of direction change every frame
    if (Math.random() < 0.01) {
      dChaserX = (Math.random() - 0.5) * 4;
      dChaserY = (Math.random() - 0.5) * 4;
    }
  }

  function checkPlayerCollision() {
    for (let i = 0; i < players.length; ++i) {
      let player = players[i];
      let locData = players[i].locationData;

      if (
        locData.xCoord + locData.deltaX > canvas.width - locData.radius ||
        locData.xCoord + locData.deltaX < locData.radius
      ) {
        locData.deltaX = -locData.deltaX;
      }
      if (
        locData.yCoord + locData.deltaY > canvas.height - locData.radius ||
        locData.yCoord + locData.deltaY < locData.radius
      ) {
        locData.deltaY = -locData.deltaY;
      }
      //Add Movement
      locData.xCoord += locData.deltaX;
      locData.yCoord += locData.deltaY;

      //Ramdom change of direction change every frame
      if (Math.random() < 0.01) {
        locData.deltaX = (Math.random() - 0.5) * 4;
        locData.deltaY = (Math.random() - 0.5) * 4;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawChaser();
    drawPlayers();
    drawScoreBoard();
    checkWallCollision();
    checkPlayerCollision();
    collisionDetection();
  }

  function startGame() {
    runInterval = setInterval(draw, 10);
  }

  function pauseGame() {
    clearInterval(runInterval);
  }

  resizeCanvas();
})();
