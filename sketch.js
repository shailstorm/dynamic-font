let font;
let textPoints = [];
let circleSize = 5;

function preload() {
  font = loadFont('/assets/arial/ARIAL.TTF');
}

function setup() {
  createCanvas(800, 500);
  inputText = createInput('drops');
}

/**
 * updates textPoints array w/ points outlining message string
 */
function updateTextPoints(message) {
  fontSize = max(10, min(width-40, width/message.length*2));
  
  let allPoints = font.textToPoints(
    message, 
    width/2 - textWidth(message)/2, 
    height/1.6, 
    fontSize, {
      sampleFactor: 0.2, // DEFAULT: 0.1. ratio of text path length to # samples. higher = more points along path
      simplifyThreshold: 0 // DEFAULT: 0. removes collinear points
    }
  );

  textPoints = [];
  for (let i = 0; i < allPoints.length; i += 3) {
    textPoints.push(allPoints[i]);
  }
}

function drawMorphingShape(x, y, radius, morphFactor) {
  
  let npoints = 5;
  let angle = TWO_PI / npoints;
  
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) {
    // get segment of star
    let segmentPos = (a % angle) / angle;
    
    // distance from center
    let r;
    
    // position in segment = first half (outer point to inner point)
    if (segmentPos < 0.5) {
      let t = segmentPos * 2;
      let innerRadius = radius * 0.5;
      r = lerp(radius, innerRadius, t);
    } 
    // position in segment = second half (inner to next outer point)
    else {
      let t = (segmentPos - 0.5) * 2;
      let innerRadius = radius * 0.4;
      r = lerp(innerRadius, radius, t);
    }
    
    // morph between circle (constant radius) and star (diff radii)
    let finalRadius = lerp(radius, r, morphFactor);
    
    let px = x + cos(a) * finalRadius;
    let py = y + sin(a) * finalRadius;
    vertex(px, py);
  }
  
  endShape(CLOSE);
}

function draw() {
  frameRate(30); // performance
  background(0, 50);
  message = inputText.value();
  fontSize = max(10, min(width-40, width / message.length*2));
  
  // display text
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  
  // bottom of window (high mouseY) = more circle
  // top of window (low mouseY) = more star
  // map mouseY (a value between [height, 0]) to a value between [0,1]
  let morphFactor = map(mouseY, height, 0, 0, 1, true);
  
  noFill();
  stroke(255);

  if (!(frameCount % 30)) { // performance
    updateTextPoints(message);
  }
  
  for (let i = 0; i < textPoints.length; i++) {
    let d = ((mouseX-40)*10)/fontSize;
    let point = textPoints[i];
    
    if (d <= 0) {
      continue;
    }
    drawMorphingShape(point.x, point.y, d/2, morphFactor);
  }
}