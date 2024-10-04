import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import StepsComponent from "../pages/components/StepsComponent";
import FileUpload from "../pages/components/FileUpload";
import Tooltip from "../components/Tooltip";
import { useBluetooth } from "../utils/BluetoothContext"
import { useFormData } from "../utils/FormDataContext";

const Step4Partial = () => {
  const navigate = useNavigate();
  const { setDevice, device }:any = useBluetooth();
  const { setCompletedSteps, completedSteps }:any = useFormData();

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Handle form submission
  };

  // Navigate to step 5
  const handleNavigate = (event: React.MouseEvent<HTMLButtonElement>) => {
      setCompletedSteps((prev:any) => [...prev, 5]);
      navigate("/step5");
  };

  useEffect(() => { 
    if (!completedSteps.includes(2)) {
      navigate("/"); // Navigate back to Step 1
    }
}, [completedSteps, navigate]);

  function onDeviceDisconnected(event:any) {
      const device = event.target;
      console.log(`Device ${device.name} is disconnected`);
      setDevice(device);
	  }

    const handleDisconnected = (event:any) => {
      console.log('Device disconnected:', event);
      setDevice(null);
    };


    useEffect(() => {
      if(device){
        device.addEventListener('gattserverdisconnected', onDeviceDisconnected);
      
      return () => {
        device.removeEventListener('gattserverdisconnected', handleDisconnected);
        };
      }
	  },[device])

  return (
    <div className="flex flex-col md:flex-row  items-start justify-center ">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
        <div className="h-24 flex flex-col justify-center items-center gap-2">
          <div className="text-blue-600 text-sm font-semibold">STEP 4</div>
          <div className="flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
              Issuer Certificate Details
            </div>

            <div className="text-center text-gray-500 text-base">
              Provide the X509 certificate of the mDL Issuer. We will not store
              the information provided.
            </div>
          </div>
        </div>
        <form
          onSubmit={() => handleSubmit}
          className="self-stretch  h-[488px] pt-8 flex flex-col justify-start items-start gap-4"
        >
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="flex item-center gap-3">
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Provide the X509 certificate of the issuer
              </label>
              <Tooltip
                className="info-tooltip"
                bg="dark"
                size="lg"
                position="right"
              >
                <span>
                  An X.509 certificate is used to authenticate the mDL issuer's
                  identity and ensure the integrity of the digital driver's
                  license. It includes the issuer's public key, name, and
                  expiration date, and it is signed by a trusted certificate
                  authority (CA).
                </span>
              </Tooltip>
            </div>
            <FileUpload inputId="issuerCertificate" uploadType="issuer"/>
          </div>

          <div className="self-stretch flex justify-between items-center mt-4">
            <div className="bg-[#ECF4FC] rounded flex items-center gap-1.5">
              <button
                onClick={() => navigate("/step3")}
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
            <div className="bg-blue-600 shadow-sm rounded flex items-center">
              <button
                onClick={handleNavigate}
                type="submit"
                className="btn text-white text-sm font-semibold"
              >
                Skip  
              </button>
            </div>
            <div className="bg-blue-600 shadow-sm rounded flex items-center gap-1.5">
              <button
                onClick={handleNavigate}
                type="submit"
                className="btn text-white text-sm font-semibold"
              >
                Next →
              </button>
            </div>
          </div>
        </form>
      </div>
      <StepsComponent currentStep={4} />
    </div>
  );
};

export default Step4Partial;
