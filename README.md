# 3D-Remote-Interaction

<!-- PROJECT LOGO -->
<br />


<!-- ABOUT THE PROJECT -->
## About The Project

A Full-Stack WebXR Project built with an intention to solve the problem of remote collaboration virtually with the help of 3D realistic rooms.

This project makes users collaborate virtually with 3D objects, audio/video/chat communication.
It gives them ability to move around the room virtually with arrow keys, annotate on 3D objects,
share video/images/pdf files in sync among all users in the same room.


All above features can be accessed directly from browsers without any installations on user's end.

## Built With
   - Three.JS
   - WebXR
   - WebRTC
   - Socket.io
   - Google Cloud Functions
   - Firebase Hosting  

<!-- GETTING STARTED -->
## Getting Started

Since this project is hosted on firebase and uses firebase's Realtime Database, Storage, Hosting services,
Having Firebase command line tools becomes an base tool for entering into development.

### Prerequisites

* Node.js
* Firebase Command Line tool
npm
  ```sh
  npm install -g firebase-tools
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Vaishya26/CS-5337.git
   ```
2. Change Directiory to /functions to land on main project.
   ```sh
   cd functions
   ```
4. Install NPM packages
   ```sh
   npm install
   ```
4. Log into Firebase Project of CS-5337 using Google Sign-in after following command
   ```sh
   firebase login
   ```

<!-- USAGE EXAMPLES -->
## Usage

1. To start Local Development and Testing server
   ```sh
   firebase emulators:start
   ```
2. To deploy current branch on main server
   ```sh
   firebase deploy -m "Deployment Tag"
   ```

## Usage (From Deployed URL)

1. Go to URL(https://cs5337.web.app)
   ```sh
   Sign Up and Login by clicking on sign up link.
   Create a Room with credentails and join the room.
   Try to Upload Models (GLTF/GLB), Videos, Images, PDF files by clicking on Upload Button.
   ```
2. To Move around and Interact with the scene.
   ```sh
   Use Arrow Keys to move around the 3D Scene.
   Clicking mouse down with mouse Left Key and dragging the mouse helps to turn around from single point.
   ```
3. Demo Video for understanding usage.
   ![](functions/public/videos/demoScene.gif)


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

