// James Hunt - 17/10/17
// Vehicle class for coding steering behaviours

//These vehicles will need to eat food and avoid poison to survive

var mutationRate = 0.01; // % Chance of vehicles mutating from parent vehicles

function Vehicle(x, y, dna) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, -2);
  this.position = createVector(x, y);
  this.r = 4;
  this.maxspeed = 5;
  this.maxforce = 0.2;

  this.health = 1; // Will lower over time, will regen upon vehicle eating food

  // This DNA will decide the level of attraction towards the food and the poison:
  this.dna = [];

  if (dna === undefined) {
    // Attraction to the food particles:
    this.dna[0] = random(-5, 5);

    // Attraction to the poison particles:
    this.dna[1] = random(-5, 5);

    // Perception of food particles:
    this.dna[2] = random(10, 100); // Between 10 & 100 pixels

    // Perception of poison particles:
    this.dna[3] = random(10, 100); // Between 10 & 100 pixels
  } else {
    // Adjusting the DNA to apply mutation of the vehicle
    this.dna[0] = dna[0];
    if (random(1) < mutationRate) {
      this.dna[0] += random(-0.1, 0.1);
    }
    this.dna[1] = dna[1];
    if (random(1) < mutationRate) {
      this.dna[1] += random(-0.1, 0.1);
    }
    this.dna[2] = dna[2];
    if (random(1) < mutationRate) {
      this.dna[2] += random(-10, 10);
    }
    this.dna[3] = dna[3];
    if (random(1) < mutationRate) {
      this.dna[3] += random(-10, 10);
    }
  }

  // Method to update location of the vehicle
  this.update = function() {
    this.health -= 0.005;
    // Update vehicle velocity
    this.velocity.add(this.acceleration);
    // Limit speed of vehicle
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 every time the vehicle location updates
    this.acceleration.mult(0);
  };

  this.applyForce = function(force) {
    this.acceleration.add(force);
  };

  // Method to keep track of how attracted to poison and food our vehicle is:
  this.behaviours = function (good, bad) {
    var goodAttraction = this.eat(good, 0.3, this.dna[2]);
    var badAttraction = this.eat(bad, -0.7, this.dna[3]);

    goodAttraction.mult(this.dna[0]);
    badAttraction.mult(this.dna[1]);

    this.applyForce(goodAttraction);
    this.applyForce(badAttraction);
  };

  // Method to allow the vehicles to pass on their DNA and procuce more vehicles
  this.reproduce = function () {
    if (random(1) < 0.0025) { // Set chance of vehicle reproducing
      return new Vehicle(this.position.x, this.position.y, this.dna);
    } else {
      return null;
    }
  };

  // Method to locate and eat the closest piece of food:
  this.eat = function (list, nutritionalValue, perceptionRadius) {
    var record = Infinity;
    var closest = -1;
    for (var i = 0; i < list.length; i++) {
      var distance = this.position.dist(list[i]); // Get distance between vehicle location and food
      // As long as the distance is less than infinity and within the vehicle's perception, vehicle can eat that food:
      if (distance < record && distance < perceptionRadius) {
        record = distance;
        closest = i;
      }
    }

    //If statement to check if food has actually been eaten:
    if (record < 5) {
      list.splice(closest, 1); // Remove the food that was eaten from the array of food
      this.health += nutritionalValue; // Increase health as vehile eats food
    } else if (closest > -1) {
      return this.seek(list[closest]); // Only seek the next next bit of food if it currently exists
    }

    return createVector(0, 0); // If there is nothing for the vehicle to eat or seek, return a 0 vector

  };

  // A method that calculates a steering force towards a target
  // Steering force = desired velocity - current velocity
  this.seek = function(target) {

    var desired = p5.Vector.sub(target, this.position);  // A vector pointing from the location to the target

    // Set magnitude to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired velocity minus velocity
    var steeringForce = p5.Vector.sub(desired, this.velocity);
    steeringForce.limit(this.maxforce);  // Limit to maximum steering force

    return steeringForce;
  };

  // Method to keep track of where a vehicle is alive or not:
  this.death = function () {
    return (this.health < 0); // Use boolean expression to return true or false
  };

  // Method designed to keep the vehicles away from the edges of the screen:
  this.boundaries = function () {

    var distance = 25; //Distance from the edge we want to stay
    var desired = null;

    if (this.position.x < distance) {
      desired = createVector(this.maxspeed, this.velocity.y);
    }
    else if (this.position.x > width -distance) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < distance) {
      desired = createVector(this.velocity.x, this.maxspeed);
    }
    else if (this.position.y > height-distance) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      var steeringForce = p5.Vector.sub(desired, this.velocity);
      steeringForce.limit(this.maxforce);
      this.applyForce(steeringForce);
    }
  };

  this.display = function() {
    // Draw a triangle rotated in the direction of velocity to represent our vehicle
    var angle = this.velocity.heading() + PI/2;

    //Color of vehicle will change from green to red depending on their current health
    var green = color(0, 255, 0);
    var red = color(255, 0, 0);
    var healthIndicator = lerpColor(red, green, this.health);

    fill(healthIndicator); // Make the vehicle appear as color defined above
    stroke(healthIndicator); //Give vehicle outline of color defined above

    strokeWeight(1);
    push();
    translate(this.position.x,this.position.y);
    rotate(angle);

    // Draw our vehicle as a triangle
    beginShape();
    vertex(0, -this.r*2);
    vertex(-this.r, this.r*2);
    vertex(this.r, this.r*2);
    endShape(CLOSE);

    pop();
  };
}
