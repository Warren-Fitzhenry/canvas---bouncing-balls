const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
// Set display size (css pixels).
const size = 250;
canvas.style.width = size + "px";
canvas.style.height = size + "px";

// Set actual size in memory (scaled to account for extra pixel density).
const scale = window.devicePixelRatio;
canvas.width = size * scale;
canvas.height = size * scale;

// Normalize coordinate system to use css pixels.
c.scale(scale, scale);

const rect = canvas.getBoundingClientRect();

const gravity = 0.1;
const radius = 8;
const numCircles = 8;
const dampeningFactor = 0.99;
let circles = [];
let i;
let j;
let circle;
let circle2;
const mouse = {
  x: 0,
  y: 0,
  down: false,
};
let circleUnderMouse;
let ballMouseY;
let ballMouseX;
let pullForceY;
let pullForceX;
let r;
let g;
let b;
let animate = false;

function initializeCircles() {
  circles = [];
  for (i = 0; i < numCircles; i++) {
    circle = {
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      velocity: { x: 0, y: 0 },
    };
    circles.push(circle);
  }
}

function drawCircles() {
  for (i = 0; i < numCircles; i++) {
    circle = circles[i];
    r = i * 5;
    g = i * 10;
    b = i * 15;
    // draw connecting line from ball to mouse
    if (circle === circleUnderMouse) {
      c.beginPath();
      c.moveTo(circle.x, circle.y);
      c.lineTo(mouse.x, mouse.y);
      c.lineWidth = "2";
      c.strokeStyle = "black";
      c.stroke();
    }
    c.beginPath();
    c.arc(circle.x, circle.y, radius, 0, 2 * Math.PI);
    if (circle == circleUnderMouse) {
      c.fillStyle = "C1FF24";
      c.lineWidth = "5";
      c.stroke();
    } else {
      c.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
    }
    c.fill();
  }
}

function iterateSimulation() {
  for (i = 0; i < numCircles; i++) {
    circle = circles[i];

    // pull ball to mouse
    pullBallToMouse();

    // Add gravity
    circle.velocity.y += gravity;

    // slows things down
    circle.velocity.x *= dampeningFactor;
    circle.velocity.y *= dampeningFactor;

    // Add velocity to position
    circle.x += circle.velocity.x;
    circle.y += circle.velocity.y;

    // Make them bounce off the floor
    if (circle.y > rect.height - radius) {
      circle.y = rect.height - radius;
      circle.velocity.y = -Math.abs(circle.velocity.y);
    } else if (circle.y < radius) {
      // bounce off ceiling
      circle.y = radius;
      circle.velocity.y = Math.abs(circle.velocity.y);
    } // bounce off right wall
    if (circle.x > rect.width - radius) {
      circle.x = rect.width - radius;
      circle.velocity.x = -Math.abs(circle.velocity.x);
    } else if (circle.x < radius) {
      // bounce off left wall
      circle.x = radius;
      circle.velocity.x = Math.abs(circle.velocity.x);
    }

    // REPULSION between every other circle
    for (j = i + 1; j < numCircles; j++) {
      circle2 = circles[j];
      // calculate distance between two circles
      const dx = circle2.x - circle.x;
      const dy = circle2.y - circle.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < 2 * radius) {
        if (d === 0) {
          d = 0.1;
        }
        const unitX = dx / d;
        const unitY = dy / d;

        const force = -2;

        const forceX = unitX * force;
        const forceY = unitY * force;

        // Send circles in oppostite directions from each other
        circle.velocity.x += forceX;
        circle.velocity.y += forceY;

        circle2.velocity.x -= forceX;
        circle2.velocity.y -= forceY;
      }
    }
  }
}

function pullBallToMouse() {
  if (circle == circleUnderMouse) {
    ballMouseY = mouse.y - circle.y;
    ballMouseX = mouse.x - circle.x;

    pullForceY = ballMouseY * 0.02;
    pullForceX = ballMouseX * 0.02;

    circle.velocity.y += pullForceY;
    circle.velocity.x += pullForceX;
  }
}

canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.x - rect.x;
  mouse.y = e.y - rect.y;
});

canvas.addEventListener("mousedown", function (e) {
  mouse.down = true;
  mouse.x = e.x - rect.x;
  mouse.y = e.y - rect.y;

  for (i = 0; i < circles.length; i++) {
    const circle = circles[i]; // get circle out of array
    const dx = mouse.x - circle.x;
    const dy = mouse.y - circle.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < radius) {
      circleUnderMouse = circle;
      break; // break (stop) the for loop
    }
  }
});

canvas.addEventListener("mouseup", function (e) {
  mouse.down = false;
  circleUnderMouse = null;
});

canvas.addEventListener("mouseout", function (e) {
  mouse.down = false;
  circleUnderMouse = null;
});

// Kick off the animation when the mouse enters the canvas
canvas.addEventListener("mouseover", function (e) {
  animate = true;
  drawFrame();
});

// Pause animation when the mouse exits the canvas
canvas.addEventListener("mouseout", function (e) {
  animate = false;
});

function drawFrame() {
  // Clear the canvas
  c.clearRect(0, 0, canvas.width, canvas.height);
  // Recalculate positions of the circles
  iterateSimulation();

  // Draw the circles in new positions
  drawCircles();
  if (animate) {
    requestAnimationFrame(drawFrame);
  }
}

// Create initial circles
initializeCircles();
// Draw the first frame to start animation
drawFrame();
