let faceapi;
let detections = [];
let prevColor = [128, 128, 128];  // Default gris
let currentColor = [128, 128, 128];
let video;
let canvas;


function setup() {
  canvas = createCanvas(windowWidth, windowHeight); 
  canvas.id("canvas");
  screen = createGraphics(1500, 1000);
  
  video = createCapture(VIDEO);
  video.id("video");
  video.size(1500, 800);
  video.position(100, 0);
  
  const faceOptions = {
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.1,
    withLandmarks:true,
  };

  faceapi = ml5.faceApi(video, faceOptions, faceReady);
}

function faceReady() {
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;

  clear();
  faceapi.detect(gotFaces);
  colorFaces(detections);
  drawBoxes(detections);
  drawExpressions(detections, 20, 250, 14);
}

// ---------SQUARES------------
function drawBoxes(detections){
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let {_x, _y, _width, _height} = detections[f].alignedRect._box;
      strokeWeight(2);
      noFill();
      stroke(5);
      rect(_x, _y, _width, _height);
    }
  }
}

// ------------TEXTO-----------------
function drawExpressions(detections) {
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let face = detections[f];
      
      if (face.expressions) {
        let { neutral, happy, angry, sad, disgusted, surprised, fearful } = face.expressions;
        let {_x, _y, _width, _height} = face.alignedRect._box; 
        let x = _x + _width/4 + 10; 
        let y = _y + 50;
        
        textSize(18);
        noStroke();
        fill(5);
        
        text("Neutro:" + nf(neutral * 100, 2, 2) + "%", x, y);
        text("Felicidad:" + nf(happy * 100, 2, 2) + "%", x, y + 20);
        text("Enojo:" + nf(angry * 100, 2, 2) + "%", x, y + 40);
        text("Tristeza:" + nf(sad * 100, 2, 2) + "%", x, y + 60);
        text("Asqueado:" + nf(disgusted * 100, 2, 2) + "%", x, y + 80);
        text("Sorprendido:" + nf(surprised * 100, 2, 2) + "%", x, y + 100);
        text("Miedo:" + nf(fearful * 100, 2, 2) + "%", x, y + 120);
      } else {
        console.warn("No expressions found for face:", face);
      }
    }
  }
}

 // --------EFECTOS---------------

// ENOJO
function angryEffect(box, color) {
  stroke(color); 
  strokeWeight(4);
  for (let i = 0; i < 25; i++) {
    let angle = TWO_PI / 12 * i;
    let x1 = box._x + box._width / 2 + cos(angle) * box._width * 0.5;
    let y1 = box._y + box._height / 2 + sin(angle) * box._height * 0.5;
    let x2 = box._x + box._width / 2 + cos(angle) * box._width * 1.0;
    let y2 = box._y + box._height / 2 + sin(angle) * box._height * 1.0;
    line(x1, y1, x2, y2);
  }
}

// --------triste-----
function sadEffect(box, color) {
 let brillos = 10;
  for (let i = 0; i < brillos; i++) {
    let x = box._x + random(0, box._width);
    let y = box._y + random(0, box._height);
    let brilloSize = random(2, 10);
    let alpha = random(150, 255);
    stroke(color[0], color[1], color[2], alpha);
    strokeWeight(brilloSize);
    point(x, y);
  }
}
// ---------asqueroso--------
function ewEffect(box, color) {
  let numPulses = 5;
  let maxDistortion = 10;

  for (let b = 0; b < 5; b++) {
      let bubbleX = box._x + random(0, box._width);
      let bubbleY = box._y + random(0, box._height);
      let bubbleSize = random(3, 8);

      noFill();
      stroke(color[0], color[1], color[2], alpha);
      strokeWeight(1);
      ellipse(bubbleX, bubbleY, bubbleSize, bubbleSize);
    }
}

// ----sorpresa---------
function surpriseEffect(box, color) {
  let maxSize = box._width * 2;
  let numCirclulos = 10; //

  for (let i = 0; i < numCirclulos; i++) {
    let size = map(i, 0, numCirclulos, 0, maxSize); 
    let alpha = map(i, 0, numCirclulos, 255, 0); 
    stroke(color[0], color[1], color[2], alpha);
    strokeWeight(4);
    noFill();
    ellipse(box._x + box._width / 2, box._y + box._height / 2, size, size);
  }
}

// -------medo----------
function fearEffect(box, color) {
  let movimiento = 5;

  for (let i = 0; i < 5; i++) {
    let offsetX = random(-movimiento, movimiento);
    let offsetY = random(-movimiento, movimiento);

    stroke(color[0], color[1], color[2], 150); 
    strokeWeight(3);
    noFill();
    rect(box._x + offsetX, box._y + offsetY, box._width, box._height);
  }

}

// -----------happy---------
function happyEffect(box, color) {
  let brillos = 20;
  for (let i = 0; i < brillos; i++) {
    let x = box._x + random(0, box._width);
    let y = box._y + random(0, box._height);
    let brilloSize = random(2, 5);
    let alpha = random(150, 255);
    stroke(color[0], color[1], color[2], alpha);
    strokeWeight(brilloSize);
    point(x, y);
  }
}

// ---------APLICAR CADA EFECTO A EMOCION -----------
function colorFaces(detections) {
  if (detections && detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let box;
      if (detections[f].alignedRect) {
        box = detections[f].alignedRect._box;
      } else if (detections[f].detection) {
        box = detections[f].detection._box;
      } else {
        console.log("No se detectan rostros.");
        continue;
      }

      let { neutral, happy, angry, sad, disgusted, surprised, fearful } = detections[f].expressions;

      let maxEmotion = Math.max(neutral, happy, angry, sad, disgusted, surprised, fearful);
      let targetColor;
      targetColor = currentColor;

      if (happy === maxEmotion) {
        targetColor = [255, 223, 0];  
        happyEffect(box, targetColor);
      } else if (angry === maxEmotion) {
        targetColor = [255, 0, 0];
        angryEffect(box, targetColor);
      } else if (sad === maxEmotion) {
        targetColor = [0, 0, 255]; 
        sadEffect(box, targetColor);
      } else if (disgusted === maxEmotion) {
        targetColor = [102, 204, 60];
        ewEffect(box, targetColor);
      } else if (surprised === maxEmotion) {
        targetColor = [0, 255, 255];
        surpriseEffect(box, targetColor); 
      } else if (fearful === maxEmotion) {
        targetColor = [128, 0, 128];
        fearEffect(box, targetColor);
      } else {
        targetColor = [128, 128, 128];
      }
      
      currentColor = currentColor.map((c, i) => lerp(c, targetColor[i], 0.05));
      
       if (maxEmotion > 0.7) {
      let glowFactor = map(maxEmotion, 0.7, 1, 10, 50); 
      let glowRadius = box._width * 1.5;

      noFill();
      for (let i = glowRadius; i > 0; i -= 5) {
        let glowColor = currentColor.map((c, idx) => lerp(c, targetColor[idx], 0.2)); 
        strokeWeight(2);
        stroke(glowColor[0], glowColor[1], glowColor[2], map(i, 0, glowRadius, 255, 0)); 
        ellipse(box._x + box._width / 2, box._y + box._height / 2, i, i);
  }
      }
    }
  }
} 
