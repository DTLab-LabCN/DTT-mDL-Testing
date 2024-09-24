import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import StepsComponent from "../pages/components/StepsComponent";
import { useBluetooth } from "../utils/BluetoothContext"

const Step3Partial = () => {

  const { setCharacteristic, setDevice, device, ServiceId}:any = useBluetooth();
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [bleError, setBleError] = useState(false);

  const navigate = useNavigate();

  // Service and Characteristic UUID
  // const ServiceID = '0000ffe0-0000-1000-8000-00805f9b34fb'
  const ServiceID = ServiceId ?? '0000ffe0-0000-1000-8000-00805f9b34fb'
	const CharacteristicsId = '10001000-0000-1000-8000-00805f9b34fb'

  
async function reconnect() {
  try {
      console.log('Attempting to reconnect...');
      console.log('device:',device)
      let server = await device.gatt.connect();
      const services = await server.getPrimaryService(ServiceID);
      const characteristics = await services.getCharacteristic(CharacteristicsId);
      setCharacteristic(characteristics)
      console.log('Reconnected to GATT server');
  } catch (error) {
      console.error('Reconnection failed', error);
      // Optionally, you can retry reconnecting after a delay
      setTimeout(() => reconnect(), 5000);
  }
}

  // Listener function to Handle Bluetooth Disconnect 
  function onDeviceDisconnected(event:any) {
		const device = event.target;
		console.log(`Device ${device.name} is disconnected`);
		setIsConnected(false);
    
    // set device in context
		setDevice(device);
	  }

    const handleDisconnected = (event:any) => {
      console.log('Device disconnected:', event);

      // clear context value after disconnect
      setDevice(null);
    };


    useEffect(() => {
      if(device){
        device.addEventListener('gattserverdisconnected', onDeviceDisconnected);
      
      return () => {
        console.log('Lisnter Removed!!!')
        device.removeEventListener('gattserverdisconnected', handleDisconnected);
        };
      }
    },[device])



    const connectBluetooth = async () => {
      try {
        // @ts-ignore
        // Request the Bluetooth device
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [ServiceID] }],
          optionalServices: [ServiceID]  // Include the optional service here
        });
      
        // set device name
        setDeviceName(device.name);
        console.log('Device: ',device)
        setDevice(device)
        console.log("Device_name",device.name)
      
        // Connect to the GATT server
        const server = await device.gatt.connect();
      
        device.addEventListener('gattserverdisconnected', onDeviceDisconnected);
      
        const service = await server.getPrimaryService(ServiceID);

        // Get the characteristic
        const characteristic = await service.getCharacteristic(CharacteristicsId);
        //set characteristic in context
        setCharacteristic(characteristic);
        
        device.addEventListener('gattserverdisconnected', onDeviceDisconnected);
      
        // Start notifications
        await characteristic.startNotifications().then(()=>{
          console.log('Notification started!')
        })
      
        setDevice(device)
        setIsConnected(true);
      } catch (error) {
        setBleError(true)
        reconnect();
        console.log('Bluetooth connection failed, please reconnect!')
        console.error('Bluetooth connection failed', error);
      }
    };

    // Define button style based on isConnected state
    const nextButtonStyle =
    isConnected
      ? "bg-blue-600 hover:bg-blue-700 shadow-sm rounded flex items-center gap-1.5 text-white text-sm font-semibold"
      : "bg-gray-300 cursor-not-allowed rounded flex items-center gap-1.5 text-white text-sm font-semibold";

    // Navigate to step 4
    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isConnected) {
        event.preventDefault();
        navigate("/step4");
      }
    };

    return (
      <div className="flex flex-col md:flex-row  items-start justify-center ">
        <Sidebar className="w-full md:w-1/4" />
        <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
          <div className="h-24 flex flex-col justify-center items-center gap-2">
            <div className="text-blue-600 text-sm font-semibold">STEP 3</div>
            <div className="flex flex-col justify-start items-start gap-3">
              <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
                Connect to a Mobile Device
              </div>
              <div className="text-center text-gray-500 text-base">
                This connection process uses Bluetooth and will open a separate
                window outside of this page. Please follow these steps:
              </div>
            </div>
          </div>

          <div className="p-4 w-full">
            <div className="py-2 flex items-center rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 text-white flex justify-center items-center">
                1
              </div>{" "}
              <div className="flex-grow ml-4">
                <h2 className="text-gray-900 text-md title-font font-medium">
                  Initiate Connection
                </h2>
                <p className="text-gray-500 text-xs">
                  Click on the "Connect via Bluetooth" button below. A new window
                  will open, prompting you to select your mobile device.
                </p>
              </div>
            </div>
            <div className="py-2 flex items-center rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 text-white flex justify-center items-center">
                2
              </div>{" "}
              <div className="flex-grow ml-4">
                <h2 className="text-gray-900 text-md title-font font-medium">
                  Pair Your Device
                </h2>
                <p className="text-gray-500 text-xs">
                  In the new window pop-up, select your mobile device from the
                  list of available Bluetooth devices. If you do not see your
                  mobile device in the list, ensure Bluetooth is enabled.
                </p>
              </div>
            </div>
            <div className="py-2 flex items-center rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 text-white flex justify-center items-center">
                3
              </div>{" "}
              <div className="flex-grow ml-4">
                <h2 className="text-gray-900 text-md title-font font-medium">
                  Authorize Connection
                </h2>
                <p className="text-gray-500 text-xs">
                  Once selected, authorize the connection on your mobile device.{" "}
                </p>
              </div>
            </div>
          </div>
          <div className={bleError ? 'h-auto p-4 bg-red-100 rounded-xl shadow border border-[#E33B32] justify-center items-start gap-3 inline-flex' : 'h-auto p-4 bg-blue-50 rounded-xl shadow border border-blue-500 justify-center items-start gap-3 inline-flex'}>
            <div className="pt-1 h-auto  ">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V13M12 16V16.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke={bleError ? '#E33B32' :"#0E69E2"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className={bleError ? 'text-[#E33B32]  text-sm font-medium mt-1' : 'text-blue-700  text-sm font-medium'}>
              {bleError ? 'Bluetooth connection failed, please reconnect!' : 'Ensure Bluetooth is enabled on both your computer and your mobile device'}
            </div>
          </div>

          <div className="bluetooth-connection w-full h-full p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center justify-between">
            <div className="status p-1.5 rounded-md justify-center items-center gap-2 flex">
              {isConnected ? (
                <>
                  <div className="rounded-md justify-center items-center flex">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 9.6C0 6.23968 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H26.4C29.7603 0 31.4405 0 32.7239 0.653961C33.8529 1.2292 34.7708 2.14708 35.346 3.27606C36 4.55953 36 6.23969 36 9.6V26.4C36 29.7603 36 31.4405 35.346 32.7239C34.7708 33.8529 33.8529 34.7708 32.7239 35.346C31.4405 36 29.7603 36 26.4 36H9.6C6.23968 36 4.55953 36 3.27606 35.346C2.14708 34.7708 1.2292 33.8529 0.653961 32.7239C0 31.4405 0 29.7603 0 26.4V9.6Z"
                        fill="#E9F8F1"
                      />
                      <path
                        d="M22.7365 13L13.2564 22.7233C12.8967 23.0922 12.3136 23.0922 11.9539 22.7233L8 18.668M18.5199 22.7233L28 13"
                        stroke="#27B973"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="grow shrink basis-0 h-6 justify-start items-start gap-4 flex">
                    <div className="grow shrink basis-0 self-stretch flex-col justify-start items-start gap-0.5 inline-flex">
                      <div className="text-gray-500 text-base font-base font-['Inter'] leading-normal">
                        Connected to{" "}
                        <span className="text-blue-500 font-medium">
                          {deviceName}{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-md justify-center items-center flex">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 9.6C0 6.23968 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H26.4C29.7603 0 31.4405 0 32.7239 0.653961C33.8529 1.2292 34.7708 2.14708 35.346 3.27606C36 4.55953 36 6.23969 36 9.6V26.4C36 29.7603 36 31.4405 35.346 32.7239C34.7708 33.8529 33.8529 34.7708 32.7239 35.346C31.4405 36 29.7603 36 26.4 36H9.6C6.23968 36 4.55953 36 3.27606 35.346C2.14708 34.7708 1.2292 33.8529 0.653961 32.7239C0 31.4405 0 29.7603 0 26.4V9.6Z"
                        fill="#FDF6EA"
                      />
                      <path
                        d="M16.5812 25.3248L15.8097 25.9609L16.5812 25.3248ZM8.19253 15.1513L8.96407 14.5151L8.96407 14.5151L8.19253 15.1513ZM27.8075 15.1513L28.579 15.7875L28.579 15.7875L27.8075 15.1513ZM19.4188 25.3248L20.1903 25.9609L19.4188 25.3248ZM8.15753 14.1181L7.34392 13.5367L8.15753 14.1181ZM27.8425 14.1181L28.6561 13.5367L28.6561 13.5367L27.8425 14.1181ZM19 12.9944C18.9969 12.4421 18.5467 11.9969 17.9944 12C17.4421 12.0031 16.9969 12.4533 17 13.0056L19 12.9944ZM17.0225 16.9993C17.0256 17.5516 17.4758 17.9968 18.0281 17.9937C18.5803 17.9906 19.0255 17.5403 19.0224 16.9881L17.0225 16.9993ZM19 19.99C19 19.4377 18.5523 18.99 18 18.99C17.4477 18.99 17 19.4377 17 19.99H19ZM17 20C17 20.5523 17.4477 21 18 21C18.5523 21 19 20.5523 19 20H17ZM17.3528 24.6886L8.96407 14.5151L7.42099 15.7875L15.8097 25.9609L17.3528 24.6886ZM27.0359 14.5151L18.6472 24.6886L20.1903 25.9609L28.579 15.7875L27.0359 14.5151ZM8.97113 14.6996C13.449 8.43348 22.551 8.43348 27.0289 14.6996L28.6561 13.5367C23.3805 6.15443 12.6195 6.15443 7.34392 13.5367L8.97113 14.6996ZM28.579 15.7875C29.1109 15.1424 29.1412 14.2156 28.6561 13.5367L27.0289 14.6996C26.9886 14.6432 26.99 14.5708 27.0359 14.5151L28.579 15.7875ZM8.96407 14.5151C9.00998 14.5708 9.0114 14.6432 8.97113 14.6996L7.34392 13.5367C6.85875 14.2156 6.88912 15.1424 7.421 15.7875L8.96407 14.5151ZM15.8097 25.9609C16.9521 27.3464 19.0479 27.3464 20.1903 25.9609L18.6472 24.6886C18.3048 25.1038 17.6952 25.1038 17.3528 24.6886L15.8097 25.9609ZM17 13.0056L17.0225 16.9993L19.0224 16.9881L19 12.9944L17 13.0056ZM17 19.99V20H19V19.99H17Z"
                        fill="#DC9D24"
                      />
                    </svg>
                  </div>
                  <div className="grow shrink basis-0 h-6 justify-start items-start gap-4 flex">
                    <div className="grow shrink basis-0 self-stretch flex-col justify-start items-start gap-0.5 inline-flex">
                      <div className="text-[#dc9d24] text-base font-semibold font-['Inter'] leading-normal">
                        Not Connected
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={connectBluetooth}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 shadow rounded text-white text-sm font-semibold"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.6665 6.00002L6.97762 7.73335C7.15539 7.86668 7.15539 8.13335 6.97762 8.26668L4.6665 10M7.33317 3.28952V12.7105C7.33317 12.9767 7.62989 13.1355 7.8514 12.9879L11.2554 10.7185C11.2935 10.6931 11.2952 10.6378 11.2588 10.61L8.18117 8.26516C8.00608 8.13176 8.00608 7.86828 8.18117 7.73487L11.2588 5.39C11.2952 5.36225 11.2935 5.3069 11.2554 5.2815L7.8514 3.01217C7.62989 2.86449 7.33317 3.02329 7.33317 3.28952Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {isConnected ? "Change Device" : "Connect via Bluetooth"}
            </button>
          </div>

          <div className="self-stretch flex justify-between items-center mt-4">
            <div className="bg-[#ECF4FC] rounded flex my-6 items-center gap-1.5">
              <button
                onClick={() => navigate("/step2")}
                type="button"
                className="btn text-blue-600 text-sm font-semibold"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.6667 8H4.00002M7.33335 4L3.80476 7.5286C3.54441 7.78894 3.54441 8.21106 3.80476 8.4714L7.33335 12"
                    stroke="#0A77FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Back
              </button>
            </div>
            <div className={nextButtonStyle}>
              <button
                onClick={handleSubmit}
                type="submit"
                className="btn text-white text-sm font-semibold"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
        <StepsComponent currentStep={3} />
      </div>
    );
};

export default Step3Partial;
