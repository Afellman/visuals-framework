# p5-sketch-module

Simple package that gives a basic p5 setup, with p5 and p5.sound, and a structure for running multiple sketches that can seamlessly be rotated through in real time.

There is a basic express server included that will allow for image and song loading.

## How To Code

p5 sketches can be built in the provided functions in `sketches.js`. The `setupThis` and `drawThis` functions act just as the `setup` and `draw` functions do in a normal p5 sketch (the names where changed so there would be no conflicts). 

There are three of these sketch functions to start but you can make as many as you want as long as the names are unique. 

To start, the first sketch is loaded but that can be switched by changing the value of `let currentSketch` at the top of `sketch.js`.

## How To Run

If you are not including any images or songs than the program can be run by just opeing the `index.html` file in your browser. 

If local files are desired, than you must run `node server.js` and open `localhost:3000` in your browser (port can be changed in servers.js) Don't forget to first run `npm install` to install express.

Have fun!
