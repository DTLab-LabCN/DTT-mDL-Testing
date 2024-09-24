# mDL Verifier



An mDL Verifier (Mobile Driver’s License Verifier) built using React allows secure digital identity verification by scanning and retrieving data from a mobile device. The verifier interfaces with the user's mobile driver's license (stored on their smartphone) using QR codes and Bluetooth (BLE) technology to authenticate the individual’s identity. The React-based interface ensures smooth interaction, handling camera permissions, real-time QR code scanning, and device compatibility, all while ensuring data privacy and security. This setup is ideal for scenarios requiring fast, contactless identity verification, such as airport check-ins or secure entry points.

## Installation

1. Prerequisites: Ensure you have Node.js v20 installed. If you don't, you can download and install it from the official Node.js website.

You can verify the installed version by running the following command in your terminal:
```bash
$ node -v
```
If you already have Node.js installed but need to upgrade to version 20, you can use tools like nvm to manage Node.js versions:

```bash
$ nvm install 20
$ nvm use 20
```

2. Clone the Repository: Clone this repository to your local machine by running:

```bash
$ git clone https://github.com/Northern-Block/orbit-mdl-webverifier.git
$ cd orbit-mdl-webverifier
```

3. Install Dependencies: Once inside the project folder, install all the required dependencies by running:

```bash
$ npm install --force
```
using yarn
```bash
$ yarn install
```

## Running the app

4. Start the Development Server: After the dependencies are installed, you can start the Vite development server:

```bash
$ npm run dev
```
This will start the application, and you can access it by opening your browser and visiting:

http://localhost:5173/

5. Build for Production: To build the app for production, run the following command:

```bash
$ npm run build
```

The build files will be generated in the dist directory.

6. Preview the Production Build: If you want to test the production build locally, you can preview it using Vite’s preview feature:

```bash
$ npm run preview
```

This will serve the production build locally on a server, allowing you to test the final output.