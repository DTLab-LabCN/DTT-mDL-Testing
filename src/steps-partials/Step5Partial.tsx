import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import StepsComponent from "../pages/components/StepsComponent";
import FileUpload from "../pages/components/FileUpload";
import Tooltip from "../components/Tooltip";
import { useBluetooth } from "../utils/BluetoothContext";

const Step5Partial = () => {
  const navigate = useNavigate();

  const { setDevice, device, setVerifierCert }:any = useBluetooth();

  const [selectedOption, setSelectedOption] = useState("provided");

  // Function to handle option change
  const handleOptionChange = (event: any) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

  };
  

// Use this Certificate If user not provide to create ReaderAuth (NB)
let Root_Certificate = `-----BEGIN CERTIFICATE-----
MIIBzjCCAXWgAwIBAgIUQwKKK1tQNA62yPk/fQrOTzuH7pMwCgYIKoZIzj0EAwIw
PTELMAkGA1UEBhMCQ0ExCzAJBgNVBAgMAk9OMQswCQYDVQQKDAJOQjEUMBIGA1UE
AwwLTkIgVmVyaWZpZXIwHhcNMjQwNzIyMDkyMzA4WhcNMzQwNzIwMDkyMzA4WjA9
MQswCQYDVQQGEwJDQTELMAkGA1UECAwCT04xCzAJBgNVBAoMAk5CMRQwEgYDVQQD
DAtOQiBWZXJpZmllcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABMf9ig0+DaLC
TpZ3qv9V+BoDP+IZTh1goNqeELEogW9mqwXyJRAIg05utcMDkSFkQIqmiiLo+CW0
mrQKoPjKkA2jUzBRMB0GA1UdDgQWBBThzh48F8Tw0o3D0pwZBovAsF08kjAfBgNV
HSMEGDAWgBThzh48F8Tw0o3D0pwZBovAsF08kjAPBgNVHRMBAf8EBTADAQH/MAoG
CCqGSM49BAMCA0cAMEQCIFQI24DPDhdYjTT8BsjiqI2O2WqMa7KKJxm+BG+3WCZQ
AiB7Da/BOFoCO2SnVUVYedUnZHl4xnSBvHSPSEtJxF0kbw==
-----END CERTIFICATE-----`

  useEffect(() => {
    if(selectedOption == 'provided'){
      // set certificate in context if selected option is 'provided'
      setVerifierCert(Root_Certificate)
    }
  },[selectedOption])


  function onDeviceDisconnected(event:any) {
      const device = event.target;
      console.log(`Device ${device.name} is disconnected`);
      setDevice(device);
	  }
    
    const handleDisconnected = (event:any) => {
      console.log('Device disconnected:', event);
      setDevice(null);
    };


    const DownloadCertificate = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const blob = new Blob([Root_Certificate], { type: 'text/plain' });
      const link = document.createElement('a');
      link.download = 'Verifier_certificate.pem';
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      }, 100);
    }, []); 


    useEffect(() => {
      if(device){
        device.addEventListener('gattserverdisconnected', onDeviceDisconnected);
      
      return () => {
        device.removeEventListener('gattserverdisconnected', handleDisconnected);
        };
      }
	  },[device])

    // Navigate to step 6
    const navigateToStep6 = () => {
      navigate(`/step6`, { state: { selectedOption } });
    }

    const SkipPressed = () => {
      navigate(`/step6`, { state: { selectedOption } });
      setVerifierCert(null)
    }

  return (
    <div className="flex flex-col md:flex-row items-start justify-center">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
        <div className="h-24 flex flex-col justify-center items-center gap-2">
          <div className="text-blue-600 text-sm font-semibold">STEP 5</div>
          <div className="flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
              Verifier Certificate Details
            </div>
            <div className="text-center text-gray-500 text-base">
              This step includes details about your verifier certificate. Please
              note that we will not store the information provided.
            </div>
          </div>
        </div>
        <form
          onSubmit={() => handleSubmit}
          className="self-stretch h-[488px] pt-8 flex flex-col justify-start items-start gap-4"
        >
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="flex items-center gap-3">
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Please select one of the following options.
              </label>
            </div>
            <div className="flex flex-row gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="certificateOption"
                  value="upload"
                  checked={selectedOption === "upload"}
                  onChange={handleOptionChange}
                  className="mr-2" 
                  />Use My Own Certificate
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="certificateOption"
                  value="provided"
                  checked={selectedOption === "provided"}
                  onChange={handleOptionChange}
                  className="mr-2"
                />Use Provided Certificate
              </label>
            </div>
          </div>

          {selectedOption === "upload" && (
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5 my-6">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Provide the X509 certificate of the verifier
                </label>
                <Tooltip
                  className="info-tooltip"
                  bg="dark"
                  size="lg"
                  position="right"
                >
                  <span>
                    An X.509 certificate validates the authenticity of the mDL,
                    confirming it is issued by a trusted authority. It includes
                    the issuer's public key, digital signature, and validity
                    period.
                  </span>
                </Tooltip>
              </div>
              <FileUpload inputId="verifierCertificate" uploadType="verifier" selectedOption={selectedOption}/>
            </div>
          )}

          {selectedOption === "provided" && (
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              {/* Content for using provided certificate */}

              <div className="border self-stretch border-slate-200 rounded">
                <div className="rounded border-b">
                  <div className="flex justify-between items-center rounded-md">
                    <div className="w-full h-full p-3.5 bg-[#ECF4FC] flex items-center gap-2">
                      <div className="p-1.25 bg-white rounded flex items-center gap-2.5">
                        <div className="w-5 h-5 relative flex items-center p-0.5 justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.66667 6.66667H5.16667C4.23325 6.66667 3.76654 6.66667 3.41002 6.84832C3.09641 7.00811 2.84144 7.26308 2.68166 7.57668C2.5 7.9332 2.5 8.39991 2.5 9.33333V14.8333C2.5 15.7668 2.5 16.2335 2.68166 16.59C2.84144 16.9036 3.09641 17.1586 3.41002 17.3183C3.76654 17.5 4.23325 17.5 5.16667 17.5H10.6667C11.6001 17.5 12.0668 17.5 12.4233 17.3183C12.7369 17.1586 12.9919 16.9036 13.1517 16.59C13.3333 16.2335 13.3333 15.7668 13.3333 14.8333V13.3333M6.66667 6.66667V5.16667C6.66667 4.23325 6.66667 3.76654 6.84832 3.41002C7.00811 3.09641 7.26308 2.84144 7.57668 2.68166C7.9332 2.5 8.39991 2.5 9.33333 2.5H14.8333C15.7668 2.5 16.2335 2.5 16.59 2.68166C16.9036 2.84144 17.1586 3.09641 17.3183 3.41002C17.5 3.76654 17.5 4.23325 17.5 5.16667V10.6667C17.5 11.6001 17.5 12.0668 17.3183 12.4233C17.1586 12.7369 16.9036 12.9919 16.59 13.1517C16.2335 13.3333 15.7668 13.3333 14.8333 13.3333H13.3333M6.66667 6.66667H8.33333M6.66667 6.66667V8.33333M13.3333 13.3333H11.6667M13.3333 13.3333V11.6667M10.8333 6.66671C11.657 6.66735 12.0887 6.67782 12.4233 6.84832C12.7369 7.00811 12.9919 7.26308 13.1517 7.57668C13.3222 7.91132 13.3327 8.34304 13.3333 9.16667M9.16667 13.3333C8.34304 13.3326 7.91132 13.3222 7.57668 13.1517C7.26308 12.9919 7.00811 12.7369 6.84832 12.4233C6.67782 12.0887 6.66735 11.657 6.66671 10.8333"
                              stroke="#0A77FF"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 h-7 flex items-center justify-center">
                        <div className="flex-1 text-[#252525] text-md font-medium leading-7 break-words">
                          Optional Download of Verifier Certificate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start bg-gray-50 w-full">
                  <div className="flex flex-col items-start gap-3 px-6 pt-4 pb-6 w-full">
                    <div className="flex-1 text-gray-800 pb-2 text-sm font-medium ">
                      If you wish to incorporate the provided root certificate
                      in your mDL mobile app, you can download the verifier X509
                      root certificate here.
                    </div>
                    <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                      <div className="text-gray-700 text-base font-medium">
                        certificate.pm
                      </div>

                      <button onClick={DownloadCertificate} className="w-[182px] h-9 px-3 py-2 bg-[#ecf4fc] rounded-md justify-center items-center gap-1.5 inline-flex">
                        <span className="text-[#0977ff] text-sm font-semibold font-['Inter'] leading-tight tracking-tight">
                          Download
                        </span>
                        <svg
                          width="17"
                          height="16"
                          viewBox="0 0 17 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.25 2C9.25 1.58579 8.91421 1.25 8.5 1.25C8.08579 1.25 7.75 1.58579 7.75 2L9.25 2ZM7.75 9.33333C7.75 9.74755 8.08579 10.0833 8.5 10.0833C8.91421 10.0833 9.25 9.74755 9.25 9.33333L7.75 9.33333ZM11.697 8.53033C11.9899 8.23744 11.9899 7.76256 11.697 7.46967C11.4041 7.17678 10.9292 7.17678 10.6363 7.46967L11.697 8.53033ZM8.9714 10.1953L8.44107 9.66493L8.44107 9.66493L8.9714 10.1953ZM8.0286 10.1953L8.55893 9.66493L8.55893 9.66493L8.0286 10.1953ZM6.36366 7.46967C6.07077 7.17678 5.5959 7.17678 5.303 7.46967C5.01011 7.76256 5.01011 8.23744 5.303 8.53033L6.36366 7.46967ZM3.25 10.6667C3.25 10.2525 2.91421 9.91667 2.5 9.91667C2.08579 9.91667 1.75 10.2525 1.75 10.6667H3.25ZM15.25 10.6667C15.25 10.2525 14.9142 9.91667 14.5 9.91667C14.0858 9.91667 13.75 10.2525 13.75 10.6667H15.25ZM13.408 13.782L13.0675 13.1138L13.0675 13.1138L13.408 13.782ZM14.282 12.908L14.9503 13.2485L14.9503 13.2485L14.282 12.908ZM2.71799 12.908L2.04973 13.2485L2.71799 12.908ZM3.59202 13.782L3.25153 14.4503L3.25153 14.4503L3.59202 13.782ZM7.75 2L7.75 9.33333L9.25 9.33333L9.25 2L7.75 2ZM10.6363 7.46967L8.44107 9.66493L9.50173 10.7256L11.697 8.53033L10.6363 7.46967ZM8.55893 9.66493L6.36366 7.46967L5.303 8.53033L7.49827 10.7256L8.55893 9.66493ZM8.44107 9.66493C8.47362 9.63239 8.52638 9.63239 8.55893 9.66493L7.49827 10.7256C8.05151 11.2788 8.94849 11.2788 9.50173 10.7256L8.44107 9.66493ZM1.75 10.6667V10.8H3.25V10.6667H1.75ZM5.7 14.75H11.3V13.25H5.7V14.75ZM15.25 10.8V10.6667H13.75V10.8H15.25ZM11.3 14.75C11.8477 14.75 12.3035 14.7506 12.6747 14.7203C13.0546 14.6892 13.4112 14.6221 13.7485 14.4503L13.0675 13.1138C12.9769 13.1599 12.8396 13.2018 12.5525 13.2252C12.2566 13.2494 11.8724 13.25 11.3 13.25V14.75ZM13.75 10.8C13.75 11.3724 13.7494 11.7566 13.7252 12.0525C13.7018 12.3396 13.6599 12.4769 13.6138 12.5675L14.9503 13.2485C15.1221 12.9112 15.1892 12.5546 15.2203 12.1747C15.2506 11.8035 15.25 11.3477 15.25 10.8H13.75ZM13.7485 14.4503C14.2659 14.1866 14.6866 13.7659 14.9503 13.2485L13.6138 12.5675C13.4939 12.8027 13.3027 12.9939 13.0675 13.1138L13.7485 14.4503ZM1.75 10.8C1.75 11.3477 1.74942 11.8035 1.77974 12.1747C1.81078 12.5546 1.87789 12.9112 2.04973 13.2485L3.38624 12.5675C3.3401 12.4769 3.29822 12.3396 3.27476 12.0525C3.25058 11.7566 3.25 11.3724 3.25 10.8H1.75ZM5.7 13.25C5.12757 13.25 4.74336 13.2494 4.44748 13.2252C4.16035 13.2018 4.02307 13.1599 3.93251 13.1138L3.25153 14.4503C3.58879 14.6221 3.94545 14.6892 4.32533 14.7203C4.69646 14.7506 5.15232 14.75 5.7 14.75V13.25ZM2.04973 13.2485C2.31338 13.7659 2.73408 14.1866 3.25153 14.4503L3.93251 13.1138C3.69731 12.9939 3.50608 12.8027 3.38624 12.5675L2.04973 13.2485Z"
                            fill="#0A77FF"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="self-stretch flex justify-between items-center mt-4">
            <div className="bg-[#ECF4FC] rounded flex items-center gap-1.5">
              <button
                onClick={() => navigate("/step4")}
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
            {selectedOption === "upload" &&    
            <div className="bg-blue-600 shadow-sm rounded flex items-center">
              <button
                onClick={() => SkipPressed()}
                type="submit"
                className="btn text-white text-sm font-semibold"
              >
                Skip  
              </button>
            </div>
            }
            <div className="bg-blue-600 shadow-sm rounded flex items-center gap-1.5">
              <button
                onClick={() => navigateToStep6()}
                type="submit"
                className="btn text-white text-sm font-semibold"
              >
                Next →
              </button>
            </div>
          </div>
        </form>
      </div>
      <StepsComponent currentStep={5} />
    </div>
  );
};

export default Step5Partial;
