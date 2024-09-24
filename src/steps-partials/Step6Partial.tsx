import React, { useState, useEffect } from "react";
import { KJUR, KEYUTIL, hextob64, b64tohex, ASN1HEX } from "jsrsasign";
import cbor from 'cbor'
import cose from 'cose-js'
import { useLocation, useNavigate } from "react-router-dom";
import { Certificate, CertificateChainValidationEngine } from "pkijs";
import { fromBER } from "asn1js";
import * as x509 from "@peculiar/x509";
import { createCipheriv, createHash, randomBytes } from "crypto";

import Sidebar from "../components/Sidebar";
import StepsComponent from "../pages/components/StepsComponent";
import ModalBasic from "../components/ModalBasic";
import ProgressBar from "../pages/components/ProgressBar";
import { useBluetooth } from "../utils/BluetoothContext";

import { Buffer } from 'buffer'; if (!window.Buffer) {   window.Buffer = Buffer; } 
window.Buffer = window.Buffer || require("buffer").Buffer;


const Step6Partial = () => {


  type Attribute = {
    id: string;
    name: string;
    mDLName:string;
  };

  type Category = {
    name: string;
    attributes: Attribute[];
  };

  const categories: Category[] = [
		{
			name: "Name",
			attributes: [
				{ id: "1", name: "Family Name", mDLName:"family_name" },
				{ id: "2", name: "Family Name National Character", mDLName:"family_name_national_character" },
				{ id: "3", name: "Given Name", mDLName:"given_name" },
				{ id: "4", name: "Given Name National Character", mDLName:"given_name_national_character" },
			],
		},
		{
			name: "Age",
			attributes: [
				{ id: "5", name: "Birth Date", mDLName:"birth_date" },
				{ id: "6", name: "Age Over 18", mDLName:"age_over_18" },
				{ id: "7", name: "Age in Years", mDLName:"age_in_years" },
				{ id: "8", name: "Age Over 21", mDLName:"age_over_21" },
				{ id: "9", name: "Age Birth Year", mDLName:"age_birth_year" },
				{ id: "10", name: "Age Over 25", mDLName:"age_over_25" },
				{ id: "11", name: "Age Over 16", mDLName:"age_over_16" },
				{ id: "12", name: "Age Over 95", mDLName:"age_over_95" },
				{ id: "13", name: "Age Over 65", mDLName:"age_over_65" },
			],
		},
		{
			name: "Location",
			attributes: [
				{ id: "14", name: "Resident Address", mDLName:"resident_address" },
				{ id: "15", name: "Resident City", mDLName:"resident_city" },
				{ id: "16", name: "Resident State", mDLName:"resident_state" },
				{ id: "17", name: "Resident Postal Code", mDLName:"resident_postal_code" },
				{ id: "18", name: "Resident Country", mDLName:"resident_country" },
				{ id: "19", name: "Birth Place", mDLName:"birth_place" },
			],
		},
		{
			name: "Document",
			attributes: [
				{ id: "20", name: "Issue Date", mDLName:"issue_date" },
				{ id: "21", name: "Expiry Date", mDLName:"expiry_date" },
				{ id: "22", name: "Issuing Country", mDLName:"issuing_country" },
				{ id: "23", name: "Issuing Jurisdiction", mDLName:"issuing_jurisdiction" },
				{ id: "24", name: "Issuing Authority", mDLName:"issuing_authority" },
				{ id: "25", name: "Nationality", mDLName:"nationality" },
				{ id: "26", name: "Document Number", mDLName:"document_number" },
				{ id: "27", name: "UN Distinguishing Sign", mDLName:"un_distinguishing_sign" },
				{ id: "28", name: "Administrative Number", mDLName:"administrative_number" },
			],
		},
		{
			name: "Traits",
			attributes: [
				{ id: "29", name: "Height", mDLName:"height" },
				{ id: "30", name: "Weight", mDLName:"weight" },
				{ id: "31", name: "Hair Colour", mDLName:"hair_colour" },
				{ id: "32", name: "Eye Colour", mDLName:"eye_colour" },
				{ id: "33", name: "Sex", mDLName:"sex" },
			],
		},
		{
			name: "Privileges",
			attributes: [{ id: "34", name: "Driving Privileges", mDLName:"driving_privileges" }],
		},
		{
			name: "Photo",
			attributes: [
				{ id: "35", name: "Photo", mDLName:"portrait" },
				{ id: "36", name: "Photo Capture Date", mDLName:"portrait_capture_date" },
			],
		},
		{
			name: "Signature",
			attributes: [{ id: "37", name: "Signature Usual Mark", mDLName:"signature_usual_mark" }],
		},
	];

  const navigate = useNavigate();
  const { characteristic, KeyPair, setDevice, device, SkDeviceContext, VerifierCert, IssuerCert, setIsValidCert }:any = useBluetooth();
  const location = useLocation();
  const { selectedOption } = location.state || {}

  const [selectAll, setSelectAll] = useState(false);
  const [percent, setPercent] = useState(0);
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<{[key: string]: boolean;}>({});
  const [selectedMDLNames, setSelectedMDLNames] = useState<string[]>([]);
  const [modalText, setModalText] = useState("Waiting for response..");
  const [modalTitle, setModalTitle] = useState("Processing");
  const [showProgress, setShowProgress] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [progress, setProgress] = useState(0);
  const [expectedTotalLength, setExpectedTotalLength] = useState(9000);
  const [receivedLength, setReceivedLength] = useState(0);
  const [isStarted, setisStarted] = useState(false);
  const [mDLData, setmDLData] = useState([]);
  const [ismDLAltered, setismDLAltered] = useState('Altered');
  const [nameSpaceRead, setnameSpaceRead] = useState('');
  const [IssuerCertificateValid, setIssuerCertificateValid] = useState<any>(null);
  const [isvalid,setvalid] = useState<any>(null)
  const [ReaderAuthPassed, setReaderAuthPassed] = useState('');

  const isButtonEnabled = Object.values(selectedAttributes).some(
    (isSelected) => isSelected
  );

  // Define button style based on isButtonEnabled state
  const buttonStyle = isButtonEnabled
    ? "form-input  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    : "form-input w-full disabled:border-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed";


  // Function to handle select attribute
  const handleAttributeChange = (id: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReceivedData = (data:any) => {
    // Assuming data is a Uint8Array
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    return text;
  };


  // function handle Received data over BLE
  let completeMessage:any = '';
  const handleCharacteristicValueChanged = (event:any) => {
      const value = event.target.value;
      const receivedChunk = handleReceivedData(value);


      if(receivedChunk === 'EOM'){
          if(completeMessage.includes('mDocResponse')){
            if (completeMessage.endsWith('"}')) {
              let jsonparsed = JSON.parse(completeMessage)
              HandleMdocResponse(jsonparsed);
            }
          }
      }else{
        completeMessage += receivedChunk;
        const newReceivedLength = completeMessage.length;
        setReceivedLength(newReceivedLength);
        if (expectedTotalLength > 0) {
          const percent = Math.min((newReceivedLength / expectedTotalLength) * 100, 100);
          setPercent(percent);
        }
      }
  };

  useEffect(() => {
    if(characteristic){
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      return () => {
        characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        device.removeEventListener('gattserverdisconnected', handleDisconnected);
      };
    }
  },[])

  const navigateToStep7 = () => {
    const selectedAttributesQuery = Object.entries(selectedAttributes)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => `selected=${id}`)
      .join("&");

    // Extract selected mDLName values
    const selectedMDLNames = categories
    .flatMap((category) => category.attributes)
    .filter((attribute) => selectedAttributes[attribute.id])
    .map((attribute) => attribute.mDLName);

    setSelectedMDLNames(selectedMDLNames);


    navigate(`/step7`, { state: { mDLData, selectedAttributes, categories, ismDLAltered, IssuerCertificateValid, nameSpaceRead, ReaderAuthPassed, isvalid } });
  };

  // Handle Select all Attributes
  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const newSelectedAttributes: { [key: string]: boolean } = categories
      .flatMap((category) => category.attributes)
      .reduce<{ [key: string]: boolean }>((acc, attribute) => {
        acc[attribute.id] = newSelectAll;
        return acc;
      }, {});

    setSelectedAttributes(newSelectedAttributes);

    // Extract selected mDLName values
		const selectedMDLNames = categories
		.flatMap((category) => category.attributes)
		.filter((attribute) => newSelectedAttributes[attribute.id])
		.map((attribute) => attribute.mDLName);

		setSelectedMDLNames(selectedMDLNames);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => (prev < 100 ? prev + 1 : 0));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const allSelected =
      Object.keys(selectedAttributes).length ===
        categories.flatMap((category) => category.attributes).length &&
      Object.values(selectedAttributes).every(Boolean);
    setSelectAll(allSelected);
  }, [selectedAttributes, categories]);

  useEffect(() => {
    if(isStarted){
      // Set an interval to update the progress every second
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            setTimeout(() => {
              navigateToStep7();
              setBasicModalOpen(false);
            }, 1000);
           
            clearInterval(interval); // Clear the interval if progress reaches 100%
            return 100;
          }
          return prevProgress + 10;
        });
      }, 1000);
  
      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [isStarted]);

  useEffect(() => {
    let progressInterval: any;
    if (basicModalOpen) {
      setModalTitle("Waiting for response from mDL holder...");
      setModalText(
        "Please wait as we receive the mDL response from the card holder."
      );
      setProgressValue(0); // Reset progress to 0
      setShowProgress(false); // Hide progress initially

        const timer1 = setTimeout(() => {
          setModalTitle("Receiving response from mDL holder...");
          setModalText("This process could take up to 4 minutes.");
          setProgressValue(0); // Reset progress to 0 again before starting
          setShowProgress(true); // Show progress bar
  
          progressInterval = setInterval(() => {
            setProgressValue((prev) => {
              const newValue = prev < 100 ? prev + 1 : 100;
              if (newValue === 100) {
                clearInterval(progressInterval);
                setShowProgress(false);
                setBasicModalOpen(false); // Close the modal
                navigateToStep7(); // Navigate to step 6
              }
              return newValue;
            });
          }, 1000); // Progress every second to simulate 100 seconds
        }, 15000); // 15 seconds

        
        return () => {
          clearTimeout(timer1);
          clearInterval(progressInterval);
        };

      }
  }, [basicModalOpen]);

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

  // function to convert Date
  function formatDateAsYYMMDDHHMMSSZ(date:any) {
    const pad = (num:any) => String(num).padStart(2, '0');
    const year = String(date.getUTCFullYear()).slice(-2);
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    
    return `${year}${month}${day}${hours}${minutes}${seconds}Z`;
  }


  const createMdocRequest = async () => {
    try {
      
    var kp = KeyPair
  
    // Use this key to sign New Certificate to create ReaderAuth
    let PrivateKey_Root_cert = `
  -----BEGIN EC PRIVATE KEY-----
  MHcCAQEEIDYAVns9AO6B8Jw/hWtHuU1AxKJv+HiPeKovezzoyXyBoAoGCCqGSM49
  AwEHoUQDQgAEx/2KDT4NosJOlneq/1X4GgM/4hlOHWCg2p4QsSiBb2arBfIlEAiD
  Tm61wwORIWRAiqaKIuj4JbSatAqg+MqQDQ==
  -----END EC PRIVATE KEY-----
  `
  
    //@ts-ignore
    var pub = KEYUTIL.getPEM(kp.pubKeyObj, "PKCS8PUB");
    var priv = KEYUTIL.getPEM(kp.prvKeyObj, "PKCS8PRV");
  
    const now = new Date();
    const oneYearLater = new Date(now.setFullYear(now.getFullYear() + 1));
    const notafterString = formatDateAsYYMMDDHHMMSSZ(oneYearLater);
    

    // Use Certificate if user select use "provided" to use in readerAuth
    const VerifierCertificate = new KJUR.asn1.x509.Certificate({
        version: 3,
        //@ts-ignore
        serial: { int: String(Date.now()) },
        issuer: { str: "/C=CA/ST=ON/O=NB/CN=NB Verifier" },
        //@ts-ignore
        notbefore:  new Date(),
        notafter: notafterString,
        subject: { str: "/C=CA/ST=ON/O=NB/CN=NB Verifier Request" },
        // sbjprvkey:priv,
        sbjpubkey: kp.pubKeyObj,
        sigalg: "SHA256withECDSA",
        cakey: PrivateKey_Root_cert
    });
  
    const verifierCertPEM  = VerifierCertificate.getPEM()


    const deviceEngagement = {
      0: "1.0",
      1: [
        1,
        Buffer.from(pub, 'hex')
      ],
      2: [
        [  
          2,  
          1, 
          {}
        ]
      ]
    };


    const selectedMDLNames = categories
    .flatMap((category) => category.attributes)
    .filter((attribute) => selectedAttributes[attribute.id])
    .map((attribute) => attribute.mDLName);

    setSelectedMDLNames(selectedMDLNames);

    const nameSpaces = {
      'org.iso.18013.5.1.mDL': selectedMDLNames.reduce((acc: { [key: string]: boolean }, key: string) => {
        acc[key] = false;
        return acc;
      }, {})
    };

    // Select certificate based on option
    let Certificate;
    if(selectedOption == 'provided'){
      Certificate = verifierCertPEM;
    }else{
      Certificate = VerifierCert;
    }


    const readerAuthPayload = {
      readerAuth: [
        'ReaderAuthentication',
        cbor.encode({
          deviceEngagement,
          eReaderKey: {
            publicKey: kp.pubKeyObj,
          },
          handover: null,
        }),
        cbor.encode({
          itemsRequest: cbor.encode({
            docType: 'org.iso.18013.5.1.mDL',
            nameSpaces: {
              'org.iso.18013.5.1.mDL': nameSpaces["org.iso.18013.5.1.mDL"],
            },
          }),
          readerCert: Certificate
        }),
      ],
    };


    const headers = {
        p: { alg: 'ES256' },
        u: { kid: Buffer.from('11', 'utf8') },
        payload: null, // Detached payload
        external_aad: Buffer.alloc(0),
        signature: null
      };


    // Encode data with CBOR
    const readerAuthBytes = cbor.encode(readerAuthPayload.readerAuth[1]); // Detached content

    // Extract privateKey object from privateKey
    const privKeyObj:any = KEYUTIL.getKey(priv);
    const privKeyHex = privKeyObj.prvKeyHex;


    // Signer Object
    const signer = {
      key: {
        d: Buffer.from(privKeyHex, 'hex')
      }
    };

    // Generate the COSE_Sign1 signature
    const signature = await cose.sign.create(headers, readerAuthBytes, signer);
    

    // Assign signatue to readerAuth Payload
    let Assi = readerAuthPayload.readerAuth[1] = signature.toString('hex')

    // Assign certificate to readerAuth Payload
    let certAss = readerAuthPayload.readerAuth[2] = readerAuthPayload.readerAuth[2].toString('hex')


    // Include `signed ReaderAuth` in the mdoc request
    const mdocRequest = {
      version: '1.0',
      docRequests: [
        {
          itemsRequest: {
            docType: 'org.iso.18013.5.1.mDL',
            nameSpaces: {
              'org.iso.18013.5.1.mDL': nameSpaces["org.iso.18013.5.1.mDL"],
            },
          },
          readerAuth:readerAuthPayload.readerAuth,
        },
      ],
    };


    const readerAuthPayloadEncoded = JSON.stringify(mdocRequest)


    // Encrypt the readerAuth payload using AES-GCM with the session key (skDevice)
    const iv = randomBytes(12); // Random IV for AES-GCM
    const cipher = createCipheriv('aes-256-gcm', SkDeviceContext, iv);

    let encrypted = cipher.update(readerAuthPayloadEncoded);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Extract AuthTag from cipher
    const authTag = cipher.getAuthTag();
    
    const encryptedReaderAuthPayload = {
      iv: iv,
      authTag: Buffer.from(authTag),
      encryptedData: encrypted,
    };
    
    // Encapsulate the encrypted data, IV, and authentication tag in CBOR
    const mdocRequestBytes = cbor.encode(encryptedReaderAuthPayload);

    // PublicKey hex
    let publicKeyAHex = kp.pubKeyObj.pubKeyHex;

    let VerifierPublickey = publicKeyAHex.slice(2);

    // Extract x and y coordinates.
    const xHex = VerifierPublickey.slice(0, 64);
    const yHex = VerifierPublickey.slice(64);

    const xBuffer = Buffer.from(xHex, "hex");
    const yBuffer = Buffer.from(yHex, "hex");


    // Create a CBOR object
    const cborObj = new Map<number, number | Buffer>([
      [1, 2],
      [-1, 1],
      [-2, xBuffer],
      [-3, yBuffer]
    ] as const);

    // Encode the CBOR object
    const encoded = cbor.encode(cborObj);

    let CBOR_encodedKey = encoded.toString('hex')
  
    // Display the CBOR-encoded binary data as a hex string
    const taggedData = new cbor.Tagged(24, cborObj);
  
    let EReaderKey = cbor.encode(taggedData)


    // The session establishment message shall be CBOR encoded and formatted as follows:
    let SessionEstablishment = {
        "eReaderKey" : taggedData,
        "data":mdocRequestBytes.toString('base64')
    }

    let finalmDocRequest = cbor.encode(SessionEstablishment)


    console.log('finalmDocRequest:',finalmDocRequest.toString('hex'))
    console.log('finalcborData_base64',finalmDocRequest.toString('base64'))

    setTimeout(() => {
      sendDeviceData(finalmDocRequest.toString('base64'))
    }, 2000);

    } catch (error) {
        console.log("create mdoc error :",error)
    }

  };

  // Function to send large amount of data over BLE
  async function sendLargeData(jsonData:any) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(jsonData);
    
        // Split data into chunks of 512 bytes
        const chunkSize = 512;
        const chunks:any = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize));
        }

        // Append a final chunk with 0x00
        chunks.push(new Uint8Array([0x00]));
          
        // Send each chunk sequentially
        for (const chunk of chunks) {
            await characteristic.writeValueWithoutResponse(chunk);
            // Add a small delay if necessary to prevent overwhelming the receiver
            await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.log('Send Data Chunk Error:',error)
      }

  }

  const sendDeviceData = async(HexMessage:any) => {
    sendLargeData(HexMessage)
    .then(() => console.log('Data sent successfully'))
    .catch(error => console.error('Error sending data:', error));
  }

  //@ts-ignore
  function pemToArrayBuffer(pem) {
    const base64 = pem.replace(/(-----(BEGIN|END) CERTIFICATE-----|\s)/g, "");
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }



  // Function to Handle mdoc Response from mDL holder

  const HandleMdocResponse = async(data:any) => {
    try {


      let RessponseData = data?.mDocResponse

      const buffer = Buffer.from(RessponseData, "base64");
      let DataItems:any = [];
      let RessponseDataInHex = buffer.toString("hex");

      cbor.decodeFirst(RessponseDataInHex, async (error, obj) => {
        if (error) {
          console.error("Error decoding CBOR:", error);
          setBasicModalOpen(false)
          alert('Unknown Error has been occurred');
          return;
        }

        // Extract namespace if available
        if(obj.nameSpaces){
          let namespace = Object.keys(obj.nameSpaces)[0]
          setnameSpaceRead(namespace)
        }

        // Extract mso data
        let Mso = obj["issuerAuth"][2].toString("base64");

        // Extract Certificate from issuerAuth
        let CERT = obj["issuerAuth"][1];

        for (let [key, value] of CERT.entries()) {


          const HexStringOfCertificate = value.toString("hex");
          
          // Create Map object to assign cbor tag 33
          const map = new Map();
          map.set(33, Buffer.from(HexStringOfCertificate, "hex"));

          // Extract buffer value 
          const bufferValue = map.get(33);

          // convert into base64
          const base64String = bufferValue.toString("base64");

          // create PEM string
          const pemCert = `-----BEGIN CERTIFICATE-----
  ${base64String.match(/.{1,64}/g).join("\n")}
  -----END CERTIFICATE-----`;
          
          try {
            const IssuerCertificate = new x509.X509Certificate(base64String);
            
            // Extract PublicKey from certificate
            let PublicKey = IssuerCertificate.publicKey;

            let PublicKeyString = PublicKey.toString()

            const pemPublicKey = PublicKeyString.trim();

            // remove pem certificate data from PublicKey
            const publicKeyData = pemPublicKey
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\s/g, '');


            const publicKeyBufferCert = Buffer.from(publicKeyData, 'base64');

            // Extract the x and y coordinates from the buffer
            const xcert = publicKeyBufferCert.slice(27, 59).toString('hex');
            const ycert = publicKeyBufferCert.slice(59, 91).toString('hex');

            // Create Signature of issuerAuth data and verify it with above x and y curves 
            try {


              const IssuerAuthTaggedData = { ...obj, [18]: obj["issuerAuth"] };

              let Updated = IssuerAuthTaggedData["18"];

              // Encode data in CBOR
              const encodedData = cbor.encode(Updated);

              // Manually construct CBOR-encoded data with tag 18
              const taggedData = Buffer.concat([
                Buffer.from([0xd8, 0x12]), // Tag 18
                encodedData,
              ]);

              try {

                // hex string data of issuerAuth
                let FinalTagged = taggedData.toString("hex");

                const verifier = {
                  key: {
                    x: Buffer.from(xcert,"hex"),
                    y: Buffer.from(ycert,"hex"),
                  },
                };
    
                const IssuerAuthSignature = Buffer.from(FinalTagged, "hex");
    
                const buf = await cose.sign.verify(IssuerAuthSignature, verifier);
                
                if (buf) {
                  setReaderAuthPassed('Passed')
                }else{
                  setReaderAuthPassed('Failed')
                }
    
              } catch (error) {
                  setReaderAuthPassed('Failed')
                  console.log('Decoding Error',error)
              }

          
            } catch (error) {
              console.log('error Verifying Signature',error);
            }
            
            // Valid Certificate
            let certPEM = pemCert

            if(IssuerCert){

              // Convert PEM to ArrayBuffer
              const rootCertBuffer = pemToArrayBuffer(IssuerCert);
              const leafCertBuffer = pemToArrayBuffer(certPEM);
  
              // Parse certificates
              const rootCert = new Certificate({ schema: fromBER(rootCertBuffer).result });
              const leafCert = new Certificate({ schema: fromBER(leafCertBuffer).result });
  
              // Create a certificate chain validation engine
              const certChainValidationEngine = new CertificateChainValidationEngine({
                trustedCerts: [rootCert],
                certs: [leafCert]
              });
  
              // Validate the certificate chain
              certChainValidationEngine.verify()
                .then(result => {
                  if (result.result) {
                    console.log("Certificate chain is valid", result.result);
                    setIssuerCertificateValid('Valid');
                    setvalid('Valid');
                    setIsValidCert('Valid')
                  } else {
                    console.log("Certificate chain is invalid.");
                    setIssuerCertificateValid('InValid');
                    setvalid('Invalid');
                    setIsValidCert('Invalid')
                    setReaderAuthPassed('Failed')
                  }
                })
                .catch(error => {
                  console.error("Error verifying certificate chain:", error);
                });
       
            }else{
              setIssuerCertificateValid('InValid');
              setReaderAuthPassed('Failed');
              setvalid('Invalid');
              setIsValidCert('Invalid')
            }

          } catch (error) {
            console.log('error:',error)
          }

  

          const ArrayOfnameSpace = obj.nameSpaces["org.iso.18013.5.1"]; // mDL

          
          //@ts-ignore
          ArrayOfnameSpace.map(async (item) => {

            let AttrValueHex = item?.value.toString("hex");
            let CborDecodedValues = cbor.decode(AttrValueHex);
      
            // Add Data elements to array
            DataItems.push(CborDecodedValues);

            let EncodedAttribute = cbor.encode(item);

            const byteData = Buffer.from(EncodedAttribute);
            
            // Create hash of Data elements
            const sha256Hash = createHash("sha256")
                  .update(byteData)
                  .digest("hex");


            let data_mso = Buffer.from(Mso, "base64");
            const decodedData = cbor.decodeFirstSync(data_mso);


            let DecodedMsoValue:any = Object.values(decodedData.value);
            let DecodedMso = cbor.decode(Buffer.from(DecodedMsoValue));

            // Extract valueDigests from mso 
            let ValueDigest = DecodedMso.valueDigests["org.iso.18013.5.1"];

            const map = new Map(ValueDigest);
            const ArrayofMap = [...map.entries()];

            try {
              ArrayofMap.map((item:any) => {
                let Digest = item[0];
                let value1 = Buffer.from(item[1], "hex");

                const msoData = {
                  "org.iso.18013.5.1": {
                    [Digest]: value1.toString("hex"),
                  },
                };

                const keys = Object.keys(msoData["org.iso.18013.5.1"]);
                const key = keys[0];

                //@ts-ignore
                // Get the hash value from the MSO data
                const msoHash = msoData["org.iso.18013.5.1"][key]; 
      
                // Verify the received data
                const isDataValid = msoHash == sha256Hash;

                if (isDataValid) {
                  setismDLAltered('Unaltered')
                  console.log("Data Element hash Matched with MSO hash");
                }

              })
            } catch (error) {
              console.log("Error While Decode Hash", error);
            }
          })
        }
        setmDLData(DataItems);
        setisStarted(true);
      });

    } catch (error) {
        console.error("Error decoding CBOR:", error);
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-start justify-center">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
        <div className="h-24 flex flex-col justify-center items-center gap-2">
          <div className="text-blue-600 text-sm font-semibold">STEP 6</div>
          <div className="flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
              Information Requested
            </div>
            <div className="text-center text-gray-500 text-base">
              Select the information below that you wish to request from the mDL
              holder.
            </div>
          </div>
        </div>

        <form
          className="self-stretch pt-8 flex flex-col justify-start items-start gap-4"
          onSubmit={(e) => {
            console.log('From here: Select/Deselect All')
            e.preventDefault();
            setBasicModalOpen(true);
          }}
        >
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <label className="flex items-center my-2 px-3">
              <input
                className="form-checkbox"
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <span className="text-sm ml-2">Select/Deselect All</span>
            </label>
          </div>
          <div className="flex flex-col gap-4 w-full">
            {categories.map((category) => (
              <div key={category.name} className="w-full ">
                <div className="text-slate-500 text-base bg-slate-100 p-3 rounded w-full font-medium leading-normal mb-2">
                  {category.name}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {category.attributes.map((attribute) => (
                    <label
                      key={attribute.id}
                      className="flex items-center px-3 gap-2.5"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        value={attribute.id}
                        checked={!!selectedAttributes[attribute.id]}
                        onChange={() => handleAttributeChange(attribute.id)}
                      />
                      <span className="text-sm">{attribute.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="self-stretch flex justify-between items-center mt-4">
            <div className="bg-[#ECF4FC] rounded flex items-center gap-1.5">
              <button
                onClick={() => navigate("/step5")}
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
            <div className="">
              <button
                id="basic-modal"
                onClick={(e) => {
                  e.stopPropagation();
                  createMdocRequest()
                  console.log('From here: Send Request')
                  setBasicModalOpen(true);
                  // navigateToStep7();
                }}
                type="submit"
                disabled={!isButtonEnabled}
                className={buttonStyle}
              >
                Send Request →
              </button>
            </div>
          </div>
        </form>

       
        <ModalBasic
            id="basic-modal"
            modalOpen={basicModalOpen}
            setModalOpen={setBasicModalOpen}
            title="Information Requested"
            showProgress={showProgress}
            className="flex w-[730px] h-[593px]"
          >
            <div className="px-5 pt-4 pb-1">
              <div className="text-center"> {/* Center-align the content */}
                {showProgress && (
                  <div className="px-5 py-4">
                    <ProgressBar percent={progress} />
                  </div>
                )}
                <div className="font-medium text-lg text-slate-800 mb-2">
                  {modalTitle}
                </div>
                <div className="space-y-2">
                  <p>{modalText}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-5">
              <div className="flex flex-wrap justify-center space-x-2 mb-10 mt-10">
                <button
                  className="btn-sm border-[#009AFF] hover:border-[#009AFF] text-[#009AFF] w-full h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBasicModalOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </ModalBasic>
      </div>
      <StepsComponent currentStep={6} />
    </div>
  );
};

export default Step6Partial;