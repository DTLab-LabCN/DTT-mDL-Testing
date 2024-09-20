import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Buffer } from 'buffer'; if (!window.Buffer) {   window.Buffer = Buffer; } 
window.Buffer = window.Buffer || require("buffer").Buffer;

const HomePartial = () => {
  const navigate = useNavigate();

  interface States {
    chromeVersion: boolean;
    cookiesAllowed: boolean;
    bluetoothSupported: boolean;
    cameraSupported: boolean;
  }

  //State's
  const [systemCheckResults, setSystemCheckResults] = useState<States>({
    chromeVersion: false,
    cookiesAllowed: false,
    bluetoothSupported: false,
    cameraSupported: false
  });

  const [systemCheckPerformed, setSystemCheckPerformed] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleSystemCheck = async() => {
    const { chromeVersion, chromeDetected } = checkChromeVersion();
    const cookiesAllowed = checkCookiesAllowed();
    const bluetoothSupported = checkBluetoothSupported();
    const cameraSupported = await checkCameraSupported();

    setSystemCheckResults({
      chromeVersion,
      cookiesAllowed,
      bluetoothSupported,
      cameraSupported
    });

    const errors = [];
    if (chromeDetected && !chromeVersion) {
        errors.push("Please update your Chrome browser to version 78 or above for compatibility.");
    }
    if (!chromeDetected) {
        errors.push("Please use Chrome browser for compatibility.");
    }
    if (!cameraSupported) {
        errors.push("Please use a device that have a camera to continue with the process.");
  }
    if (!cookiesAllowed) {
        errors.push("Please enable cookies in your browser settings to proceed.");
    }
    if (!bluetoothSupported) {
        errors.push("Please use a device that supports Bluetooth to continue with the process.");
    }

    setErrorMessages(errors);
    setSystemCheckPerformed(true);
  };

  // Implement the logic to check Chrome version
  const checkChromeVersion = () => {
    const userAgent = navigator.userAgent;
    const chromeMatch:any = RegExp(/Chrome\/(\d+)/).exec(userAgent);
    const chromeDetected = chromeMatch !== null; 
    const chromeVersion = chromeMatch !== null && chromeMatch[1] > 78;

    return {chromeVersion, chromeDetected};
};

  // Implement the logic to check if cookies are allowed
  const checkCookiesAllowed = () => {
    const Cookies = navigator.cookieEnabled
    return Cookies;
  };

  // Implement the logic to check if Bluetooth is supported
  const checkBluetoothSupported = () => {
    const isBluetoothSupported = 'bluetooth' in navigator && !!navigator.bluetooth;
    return isBluetoothSupported;
  };

  // Implement the logic to check if Camera is supported
  const checkCameraSupported = async() => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const videosupported = videoDevices.length > 0

    return videosupported;
  };

  const allChecksPassed = Object.values(systemCheckResults).every(Boolean);

  // Navigate to step 1 if allChecksPassed.
  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (allChecksPassed) {
      navigate("/step1");
    }
  };

  // Success and failure icon based on system check result
  const renderIcon = (checkResult: boolean) => {
    if (!systemCheckPerformed) {
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.3033 3.6967C11.3744 0.767767 6.62563 0.767767 3.6967 3.6967C2.23223 5.16117 1.5 7.08058 1.5 9M3.6967 14.3033C6.62563 17.2322 11.3744 17.2322 14.3033 14.3033C15.7678 12.8388 16.5 10.9194 16.5 9M15 1.5V4.425C15 4.46642 14.9664 4.5 14.925 4.5H12M3 16.5V13.575C3 13.5336 3.03358 13.5 3.075 13.5H6"
            stroke="#A1A4AC"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    }
    return checkResult ? (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" fill="white" />
        <path
          d="M20 7L9.35355 17.6464C9.15829 17.8417 8.84171 17.8417 8.64645 17.6464L4 13"
          stroke="#27B973"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ) : (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" fill="white" />
        <path
          d="M18 6L6 18M18 18L6 6.00001"
          stroke="#DB3A33"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // Define button style based on allChecksPassed state
  const nextButtonStyle = allChecksPassed
    ? "bg-blue-600 hover:bg-blue-700 shadow-sm rounded flex items-center gap-1.5 text-white text-sm font-semibold"
    : "bg-gray-300 cursor-not-allowed rounded flex items-center gap-1.5 text-white text-sm font-semibold";

  return (
    <div className="flex flex-col md:flex-row h-[70vh] items-start justify-center">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-3/4">
        <div className="space-y-4">
          <div className="text-xs inline-flex font-medium bg-sky-100 text-sky-600 rounded-full text-center px-2.5 py-1">
            NEW
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Certify your mDL Mobile App
          </h1>
          <p className="text-gray-600">
            Click Get Started below to certify that your mDL mobile app meets
            ISO protocol standards.
          </p>
          <div className="border border-gray-200 rounded-md p-4 flex-col justify-start items-start gap-4 inline-flex">
            <div className="self-stretch h-24 py-2.5 flex-col justify-start items-start gap-2 flex">
              <div className="self-stretch text-[#252525] text-lg font-semibold">
                Run a system check before getting started
              </div>
              <div className="self-stretch text-[#252525] text-sm font-normal">
                Before you test your mDL Mobile App, perform a system check to
                ensure that your computer meets the minimum system requirements.
              </div>
            </div>
            {systemCheckPerformed && !allChecksPassed && (
              <div className="w-full p-2.5 bg-[#ffefee] justify-start items-start gap-4 inline-flex">
                <div className="flex-col justify-center items-start inline-flex">
                  <div className="text-red-600 text-sm font-bold ">
                    Failed. Your computer does not meet all the requirements.
                  </div>
                  {errorMessages.map((message) => (
                    <div
                      key={message}
                      className="text-red-600 text-xs font-normal"
                    >
                      {message}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {systemCheckPerformed && allChecksPassed && (
              <div className="w-full p-2.5 bg-green-50 justify-start items-start gap-4 inline-flex">
                <div className="text-green-600 text-sm font-semibold font-['Inter'] leading-normal">
                  Pass. Your computer meets all the requirements.
                </div>
              </div>
            )}
            <div className="justify-start items-center gap-2.5 inline-flex">
              <div className="self-stretch px-[5px] justify-start items-center gap-2.5 flex">
                {renderIcon(systemCheckResults.chromeVersion)}
              </div>
              <div className="text-gray-800 text-sm font-normal">
                Chrome version 78 or higher
              </div>
            </div>
            <div className="justify-start items-center gap-2.5 inline-flex">
              <div className="self-stretch px-[5px] justify-start items-center gap-2.5 flex">
                {renderIcon(systemCheckResults.cookiesAllowed)}
              </div>
              <div className="text-gray-800 text-sm font-normal">
                Cookies Allowed
              </div>
            </div>
            <div className="justify-start items-center gap-2.5 inline-flex">
              <div className="self-stretch px-[5px] justify-start items-center gap-2.5 flex">
                {renderIcon(systemCheckResults.bluetoothSupported)}
              </div>
              <div className="text-gray-800 text-sm font-normal">
                Bluetooth is supported
              </div>
            </div>
            <div className="justify-start items-center gap-2.5 inline-flex">
              <div className="self-stretch px-[5px] justify-start items-center gap-2.5 flex">
                {renderIcon(systemCheckResults.cameraSupported)}
              </div>
              <div className="text-gray-800 text-sm font-normal">
                Camera Available
              </div>
            </div>
            <div className="justify-start items-start gap-4 inline-flex">
              <div className="shadow-sm rounded flex items-center gap-1.5 text-white text-sm font-semibold">
                <button
                  className="btn text-blue-500 bg-blue-50"
                  onClick={handleSystemCheck}
                >
                  Check my system requirements
                </button>
              </div>
              <div className={nextButtonStyle}>
                <button
                  onClick={handleSubmit}
                  type="submit"
                  disabled={!allChecksPassed}
                  className="btn text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePartial;
