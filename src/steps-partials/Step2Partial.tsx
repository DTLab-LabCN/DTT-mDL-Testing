import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import { KEYUTIL } from "jsrsasign";
import { sha256 } from '@noble/hashes/sha256';
import { utf8ToBytes } from "@noble/hashes/utils";
import { hkdf } from '@noble/hashes/hkdf';
import cbor from 'cbor'
// @ts-ignore
import { ec as EC } from 'elliptic';
import { Buffer } from 'buffer'; if (!window.Buffer) {   window.Buffer = Buffer; } 
window.Buffer = window.Buffer || require("buffer").Buffer; 
import StepsComponent from "../pages/components/StepsComponent";
import CameraIcon from "../images/CameraIcon.png";
import { useBluetooth } from "../utils/BluetoothContext";
import { useFormData } from "../utils/FormDataContext";

// CustomViewFinder.tsx or at the top of the same file
const CustomViewFinder = ({ size }: { size: number }) => {
  const cornerStyle = {
    width: "20px",
    height: "20px",
    border: "5px solid white",
    position: "absolute",
    boxSizing: "border-box",
  } as React.CSSProperties;

  const containerStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${size}px`,
    height: `${size}px`,
    transform: "translate(-50%, -50%)",
    zIndex: 2,
  } as React.CSSProperties;

  return (
    <div style={containerStyle}>
      <div
        style={{
          ...cornerStyle,
          top: "0",
          left: "0",
          borderRight: "none",
          borderBottom: "none",
        }}
      ></div>
      <div
        style={{
          ...cornerStyle,
          top: "0",
          right: "0",
          borderLeft: "none",
          borderBottom: "none",
        }}
      ></div>
      <div
        style={{
          ...cornerStyle,
          bottom: "0",
          left: "0",
          borderTop: "none",
          borderRight: "none",
        }}
      ></div>
      <div
        style={{
          ...cornerStyle,
          bottom: "0",
          right: "0",
          borderTop: "none",
          borderLeft: "none",
        }}
      ></div>
    </div>
  );
};


const Step2Partial = () => {
  //State's
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<any>(null);
  const [qRData, setQRData] = useState<any>();
  const [error, setError] = useState(null);
  const [validQrCode, setValidQrCode] = useState(true);
  const [mobileSupportsBle, setMobileSupportsBle] = useState<boolean | null>(null);
  const [showQrReader, setShowQrReader] = useState(true);
  const [supportPeripheralServerMode, setSupportPeripheralServerMode] = useState<any>(null);
  const [supportCentralServerMode, setSupportCentralServerMode] = useState<any>(null);
  const qrReaderRef:any = useRef(null);
  const { completedSteps, setCompletedSteps } = useFormData();

    // Effect to stop the camera when hiding the QrReader
    useEffect(() => {
      if (!showQrReader && qrReaderRef.current) {
        // Access the camera's video stream and stop it
        const video = qrReaderRef.current.querySelector('video');
        if (video?.srcObject) {
          const stream = video.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach((track:any) => track.stop()); // Stop all tracks (camera, mic)
        }
      }
    }, [showQrReader]);

    const navigate = useNavigate();
    // Context to store key pair and Skdevice
    const { setKeyPair, setSkDeviceContext, setServiceId, ServiceId } = useBluetooth();

    useEffect(() => { 
      // Check if the current step is allowed
      if (!completedSteps.includes(2)) {
        navigate("/"); // Navigate back to Step 0
      }
  }, [completedSteps, navigate]);
    
  // Initialize EC context
  const ec = new EC('p256');

  // Function to check Camera permission
  const checkCameraPermission = async () => {
    try {
      // Check if the camera permission is granted
      const permissionStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });

      // set camera permission status in state variable.
      setCameraPermissionGranted(permissionStatus.state);

      if (permissionStatus.state === "granted") {
        return true; // Camera is supported and permission is granted
      } else if (permissionStatus.state === "prompt") {
        console.log("Camera permission needs to be prompted");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setCameraPermissionGranted("granted");
          stream.getTracks().forEach((track) => track.stop()); // Stop the camera if permission is granted
        } catch (error) {
          console.log(
            "User denied camera permission or an error occurred:",
            error
          );
          setCameraPermissionGranted("denied");
        }
        return false; // Camera is supported but permission hasn't been granted yet
      } else if (permissionStatus.state === "denied") {
        console.log("Camera permission is denied");
        return false; // Camera is supported but permission is denied
      }
      permissionStatus.onchange = () => {
        setCameraPermissionGranted(permissionStatus.state === "granted");
      };
    } catch (error) {
      console.error("Error checking camera permission:", error);
    }
  };

  function toUUID(serviceId:string) {
    if (serviceId.length !== 32) {
      throw new Error("Service ID must be 32 characters long.");
    }
    
    return (
      serviceId.slice(0, 8) + '-' +
      serviceId.slice(8, 12) + '-' +
      serviceId.slice(12, 16) + '-' +
      serviceId.slice(16, 20) + '-' +
      serviceId.slice(20)
    );
  }

  const CreateKeys = (result:any) => {
    try {
      type KeyPair = EC.KeyPair;
      let kpA: KeyPair = KEYUTIL.generateKeypair("EC", "secp256r1");

      //Set key pair in context
      setKeyPair(kpA);

      // Get Hex string of Privatekey and Publickey
      let privateKeyAHex = kpA.prvKeyObj.prvKeyHex;
      let publicKeyAHex = kpA.pubKeyObj.pubKeyHex;


      //Sample Device Engagement data

      // {
      //   0: "1.0",
      //   1: [
      //     1,
      //     24(<<
      //       24({
      //         1: 2,
      //         -1: 1,
      //         -2: h'2cfcfc5ba8f1e1c9403e34156ac9b813dcf336ed6d7acc7d6e8dba9306a4daca',
      //         -3: h'7cdb42aa37ab5d70d36f5ac5a61e89e8047d68e57ae36b7d7396fbd976ab3aec'
      //       })
      //     >>)
      //   ],
      //   2: [
      //     [
      //       2,  // Data retrieval method
      //       1,
      //       {
      //         0: true,
      //         1: false,
      //         10: "0000ffe0-0000-1000-8000-00805f9b34fb"
      //       }
      //     ]
      //   ]
      // }

      // Scanned Qr code result
      let DeviceEngagementData = result.text;
      
      // Extract Base64 data from DeviceEngagementData
      let Base64Data = DeviceEngagementData.split(":")[1];

      // Convert data into Buffer
      let Base64BufferData = Buffer.from(Base64Data, "base64");

      // Use this for session transcript
      let DeviceEng = Base64BufferData.toString("hex");

      // Extract device Engagement data in Hex string
      const encodedBuffer = Buffer.from(DeviceEng, "hex");

      // Decode Device Engagement data to diagnostic format
      let DecodedDeviceEngData = cbor.decode(encodedBuffer);

      let centralMode = DecodedDeviceEngData.get(2)[0][0]
      let peripheralMode = DecodedDeviceEngData.get(2)[0][1]
      let serviceIDMap = DecodedDeviceEngData.get(2)[0][2]
      let ServiceId = serviceIDMap.get(10)
      const uuid = toUUID(ServiceId.toString('hex'));

      setSupportPeripheralServerMode(peripheralMode)
      setSupportCentralServerMode(centralMode);
      setServiceId(uuid)

      // Check for BLE support in device engagement data
      let bleSupports = DecodedDeviceEngData.get(2)[0][0]

      // If value is 2 means BLE is supported
      if(bleSupports == 2){
        // store value in state
        setMobileSupportsBle(true);
      }else{
        // store value in state
        setMobileSupportsBle(false);
        // set error state to display on UI
        setError("Mobile wallet not supporting BLE" as never);
      }

      const ExtractKey = DecodedDeviceEngData;

      // Extract cbor tagged value of key
      const TaggedKeyValue = ExtractKey.get(1)[1].value

      // CBOR map value
      const cborMap = cbor.decode(TaggedKeyValue);

      // Extract X and Y curve from EC public key
      const Xcurve = cborMap.get(-2);
      const Ycurve = cborMap.get(-3);

      // convert Buffer into hex string
      const HexOfX_curve = Xcurve.toString("hex");
      const HexOfY_curve = Ycurve.toString("hex");

      // Reconstruct the PublicKey
      const reconstructedHolderPublickey = "04" + HexOfX_curve + HexOfY_curve;

      // Verifier's PublicKey
      let VerifierPublickey:any = publicKeyAHex?.slice(2);

      // Extract x and y coordinates
      const xHex = VerifierPublickey.slice(0, 64);
      const yHex = VerifierPublickey.slice(64);

      // convert hex into buffer
      const xBuffer = Buffer.from(xHex, "hex");
      const yBuffer = Buffer.from(yHex, "hex");


      // Create a CBOR object
      const cborObj = new Map<number, number | Buffer>([
        [1, 2],
        [-1, 1],
        [-2, xBuffer],
        [-3, yBuffer],
        ] as const);


      // Display the CBOR-encoded binary data as a hex string
      const taggedData = new cbor.Tagged(24, cborObj);

      // Extract EC private key obj from privatekey hex string
      const keyPairA = ec.keyFromPrivate(privateKeyAHex, "hex");

      // Create Zab sharedSecret from Verifier's PrivateKey and Holder's PublicKey
      const sharedSecret = keyPairA.derive(ec.keyFromPublic(reconstructedHolderPublickey, "hex").getPublic()).toArrayLike(Buffer);

      const eReaderKeyBytes = taggedData;
      const handover = null;

      // Create sessionTranscript structure
      const sessionTranscript = [
        Buffer.from(cbor.encode(DeviceEng)), // DeviceEngagementBytes
        eReaderKeyBytes, // EReaderKeyBytes
        handover,
      ];

      const sessionTranscriptBytes = Buffer.from(cbor.encode(sessionTranscript));

      // Create salt of sessionTranscriptBytes
      const salt = sha256(sessionTranscriptBytes);

      //Encode SKDevice to bytes
      const infoDevice = utf8ToBytes("SKDevice");

      // Create SKDevice 
      const skDevice = hkdf(sha256, sharedSecret, salt, infoDevice, 32);

      // store value in context
      setSkDeviceContext(skDevice);
      
    } catch (error) {
      console.log('Error: ',error)
    }
  };

  // Function to handle QR code scanning
  const handleResult = (result: any, error: any) => {
    try {
      if (result) {
        let isValidQrCode = result.text.includes("mdoc:");
  
        if (!isValidQrCode) {
          setValidQrCode(false);
          setError("QR Code could not be read" as never);
          // ReactDOM.unmountComponentAtNode(QrReader as never);
          setShowQrReader(false)
        } else {
          setValidQrCode(true);
          setError(null); // Clear any previous error if QR code is valid
          setQRData(result.text);
          CreateKeys(result);
  
          // Unmount QrReader after successful scan
          // ReactDOM.unmountComponentAtNode(QrReader as never);
          setShowQrReader(false);
        }
      }
    } catch (error) {
      // ReactDOM.unmountComponentAtNode(QrReader as never);
      setShowQrReader(false);
      console.log('QR code Scanning Error: ',error);
    }
  };

  const RetryButton = () => {
    setError(null); // Clear the error message
    setValidQrCode(true); // Reset the valid QR code state
    setQRData(null); // Clear any existing QR data
  };

  // Navigate to step 3
  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (qRData && validQrCode && mobileSupportsBle) {
      event.preventDefault();
      setCompletedSteps((prev:any) => [...prev, 3]);
      navigate("/step3");
    }
  };

  // Define button style based on validQrCode, mobileSupportsBle & qRData state
  const nextButtonStyle =
    qRData && validQrCode && mobileSupportsBle
      ? "bg-blue-600 hover:bg-blue-700 shadow-sm rounded flex items-center gap-1.5 text-white text-sm font-semibold"
      : "bg-gray-300 cursor-not-allowed rounded flex items-center gap-1.5 text-white text-sm font-semibold";

  
  useEffect(() => {
    checkCameraPermission();
  }, []);

  let content;
  if (qRData && validQrCode) {
    if (mobileSupportsBle === false) {
      content = (
        <div
          style={{
            width: "100%",
            height: "300px",
            alignSelf: "center",
            marginBottom: "20px",
            backgroundColor: "#FDFCFC",
            marginTop: "30px",
            border: "#E33B32",
            borderWidth: "2px",
            borderStyle: "solid",
          }}
        >
          <div>
            <p
              style={{
                marginTop: "25%",
                marginLeft: "26%",
                color: "#DB3A33",
              }}
            >
              {"Mobile wallet does not support BLE"}
            </p>
          </div>
        </div>
      );
    } else if (mobileSupportsBle === true) {
      content = (
        <div
          style={{
            width: "100%",
            height: "300px",
            alignSelf: "center",
            marginBottom: "20px",
            backgroundColor: "#E9F8F1",
            marginTop: "30px",
            border: "#27B973",
            borderWidth: "2px",
            borderStyle: "solid",
          }}
        >
          <div>
            <p
              style={{
                marginTop: "25%",
                marginLeft: "25%",
                color: "#27B973",
              }}
            >
              QR Code was read successfully
            </p>
          </div>
        </div>
      );
    }
  } else if (error) {
    content = (
      <div
        style={{
          width: "100%",
          height: "300px",
          alignSelf: "center",
          marginBottom: "20px",
          backgroundColor: "#FDFCFC",
          marginTop: "30px",
          border: "#E33B32",
          borderWidth: "2px",
          borderStyle: "solid",
        }}
      >
        <div>
          <p
            style={{
              marginTop: "25%",
              marginLeft: "30%",
              color: "#DB3A33",
            }}
          >
            {"QR Code could not be read"}
            <div
              style={{
                backgroundColor: "#0A77FF",
                width: "66px",
                borderRadius: "8px",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "20%",
                marginTop: "10px",
                paddingLeft: "1px",
              }}
            >
              <button
                onClick={RetryButton}
                type="reset"
                className="btn text-white text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          </p>
        </div>
      </div>
    );
  } else {
    content = (
      <div
        style={{
          width: "399px",
          height: "335px",
          alignSelf: "center",
        }}
      >
        <QrReader
          onResult={handleResult}
          videoContainerStyle={{ width: "100%", height: "100%" }}
          constraints={{ facingMode: "environment" }}
          ViewFinder={() => <CustomViewFinder size={250} />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row  items-start justify-center ">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
        <div className="h-24 flex flex-col justify-center items-center gap-2">
          <div className="text-blue-600 text-sm font-semibold">STEP 2</div>
          <div className="flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
              Scan QR code
            </div>
            <div className="text-center text-gray-500 text-base">
              Using the camera on your computer, take a photo of the wallet QR
              Code in your mobile app.
            </div>
          </div>
        </div>
        {cameraPermissionGranted === "granted" ? (
          content
        ) : (
          // Prompt to grant camera permission if not granted
          <div style={style.container}>
            <h2 style={style.heading}>Allow Camera Access</h2>
            <p style={style.paragraph}>
              When prompted, you must enable camera access to continue.
            </p>
            <div style={style.cameraIconContainer}>
              <img
                src={CameraIcon}
                alt="Camera Icon"
                className="w-full max-w-xs sm:max-w-none"
              />
            </div>
          </div>
        )}
        {ServiceId && 
          <div style={style.ServiceInfo}>
            Support for mdoc peripheral server mode : <strong>{supportPeripheralServerMode === 1 ? 'true' : 'false'}</strong> <br/>
            Support for mdoc central client Mode : <strong>{supportCentralServerMode === 1 ? 'true' : 'false'}</strong> <br/>
            UUID for mdoc peripheral server mode : <strong>{ServiceId}</strong> <br/>
          </div>
        }

        <div className="self-stretch flex justify-between items-center mt-4">
          <div className="bg-[#ECF4FC] rounded flex my-6 items-center gap-1.5">
            <button
              onClick={() => navigate("/step1")}
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
      <StepsComponent currentStep={2} />
    </div>
  );
};

const style = {
  container: {
    backgroundColor: "#F7F7F7",
    display: "flex",
    width: "520px",
    height: "294px",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "50px",
  } as React.CSSProperties,
  heading: {
    fontSize: "18px",
    marginBottom: "16px",
    fontWeight: "500",
    lineHeight: "28px",
    color: "#333",
    textAlign: "center",
  } as React.CSSProperties,
  paragraph: {
    fontSize: "16px",
    marginBottom: "32px",
    color: "#666",
  } as React.CSSProperties,
  cameraIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    color: "#fff",
    fontSize: "24px",
    position: "relative",
  } as React.CSSProperties,
  ServiceInfo:{
    alignSelf:'center'
  } as React.CSSProperties
};

export default Step2Partial;
