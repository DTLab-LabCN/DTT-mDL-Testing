import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import StepsComponent from "../pages/components/StepsComponent";
import { useBluetooth } from "../utils/BluetoothContext";
import { useFormData } from "../utils/FormDataContext";

const Step7Partial = () => {
  const navigate = useNavigate();
  const { setDevice, device, IsValidCert }:any = useBluetooth();
  const { setCompletedSteps, completedSteps } = useFormData();
  const location = useLocation();
  const [base64Images, setBase64Images] = useState<any>({});
  const { mDLData, selectedAttributes,ismDLAltered, IssuerCertificateValid, nameSpaceRead, ReaderAuthPassed, isvalid } = location.state || {}; // Get selectedAttributes from state or default to an empty object


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
      attributes: [{ id: "34", name: "Driving Privileges", mDLName:"driving_privileges"  }],
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
      attributes: [{ id: "37", name: "Signature Usual Mark", mDLName:"signature_usual_mark"  }],
    },
  ]; 

  const dynamicData = mDLData?.reduce((acc:any, item:any) => {
    if (item.elementIdentifier === 'driving_privileges') {
      // Process the driving privileges to extract vehicle_category_code
      const vehicleCategories = item.elementValue.map((privilege:any) => privilege.vehicle_category_code);
      acc[item.elementIdentifier] = vehicleCategories.join(', '); // Join them into a single string or adjust as needed
    } else {
      acc[item.elementIdentifier] = item.elementValue.value || item.elementValue;
    }
    return acc;
  }, {});

  // Step 1: Extract Selected Attributes
  const selectedAttributeIds = Object.entries(selectedAttributes || {})
    .filter(([_, isSelected]) => isSelected)
    .map(([id, _]) => id);

  // Step 2: Group selected attributes by category
  const groupedAttributes = categories.map((category) => {
    const selectedAttributes = category.attributes
      .map((attribute) => {
        if (selectedAttributeIds.includes(attribute.id)) {
          return attribute; // Include the attribute if it's selected
        }
        return null; // Otherwise, return null
      })
      .filter(Boolean); // Filter out null values

    return {
      categoryName: category.name,
      attributes: selectedAttributes,
    };
  }).filter((group) => group.attributes.length > 0);
   

    function hexToUint8Array(hex:any) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    }
    
    function hexToBlob(hex:any, type = 'image/jpeg') {
      const binary = hexToUint8Array(hex);
      return new Blob([binary], { type });
    }
    
    function blobToBase64(blob:any) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    async function hexToBase64(hex:any, type = 'image/jpeg') {
      const blob = hexToBlob(hex, type);
      const base64 = await blobToBase64(blob);
      return base64;
    }
    
    // Function to extract image data and convert into base64
    const fetchBase64Images = useCallback(async () => {
      const images:any = {};
      for (let attribute of groupedAttributes.flatMap(group => group.attributes)) {
        //@ts-ignore
        if (attribute.mDLName === 'portrait' || attribute.mDLName === 'signature_usual_mark') {
          //@ts-ignore
          let hexString = Buffer.from(dynamicData[attribute.mDLName]).toString('hex');
          const base64 = await hexToBase64(hexString, 'image/jpeg');
          //@ts-ignore
          images[attribute.mDLName] = base64;
        }
      }
  
      //@ts-ignore
      // Set the images only if they are different from the current state
      setBase64Images(prevImages => {
        if (JSON.stringify(prevImages) !== JSON.stringify(images)) {
          return images;
        }
        return prevImages;
      });
    }, [groupedAttributes, dynamicData]);
  
    useEffect(() => {
      fetchBase64Images();
    }, [fetchBase64Images]);


  // Step 3: Map grouped attributes to UI format
  const attributeValues = groupedAttributes.map((group) => ({
    categoryName: group.categoryName,
    attributes: group.attributes.map((attribute:any) => ({
      leftText: attribute.name,
      rightText:
        attribute.mDLName === 'portrait' || attribute.mDLName === 'signature_usual_mark' ? (
          <img src={base64Images[attribute.mDLName]} alt={attribute.mDLName} />
        ) : (
          dynamicData[attribute.mDLName]
        ),
    })),
  }));


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

    useEffect(() => { 
      if (!completedSteps.includes(2)) {
        navigate("/"); // Navigate back to Step 1
      }
  }, [completedSteps, navigate]);

    const genderMap:any = {
      1: "Male",
      2: "Female"
    };

    const navigateToStep8 = () => {
      const selectedAttributesQuery = Object.entries(selectedAttributes)
        .filter(([_, isSelected]) => isSelected)
        .map(([id, _]) => `selected=${id}`)
        .join("&");
        setCompletedSteps((prev:any) => [...prev, 8]);
      navigate(`/step8`, { state: { mDLData, selectedAttributes, categories, ismDLAltered, IssuerCertificateValid, nameSpaceRead, ReaderAuthPassed }});
    };

  return (
    <div className="flex flex-col md:flex-row  items-start justify-center ">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
        <div className="h-24 flex flex-col justify-center items-center gap-2 mb-8">
          <div className="text-blue-600 text-sm font-semibold">STEP 7</div>
          <div className="flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
              Information Received
            </div>
            <div className="text-center text-gray-500 text-base">
              Review the information below that was received from the mDL
              holder.
            </div>
          </div>
        </div>
        <div className="border self-stretch border-slate-200 rounded">
          <div className="rounded border-b">
            <div className="flex justify-between items-center rounded-md">
              <div className="w-full h-full p-3.5 bg-[#ECF4FC] flex items-center gap-2">
                <div className="p-1.25 bg-white rounded flex items-center gap-2.5">
                  <div className="w-5 h-5 relative flex items-center p-0.5 justify-center">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.666 6.66666H14.9993M11.666 9.99999H14.9993M11.666 13.3333H14.9993M4.33268 16.6667H15.666C16.5994 16.6667 17.0661 16.6667 17.4227 16.485C17.7363 16.3252 17.9912 16.0702 18.151 15.7566C18.3327 15.4001 18.3327 14.9334 18.3327 14V5.99999C18.3327 5.06657 18.3327 4.59986 18.151 4.24334C17.9912 3.92974 17.7363 3.67477 17.4227 3.51498C17.0661 3.33333 16.5994 3.33333 15.666 3.33333H4.33268C3.39926 3.33333 2.93255 3.33333 2.57603 3.51498C2.26243 3.67477 2.00746 3.92974 1.84767 4.24334C1.66602 4.59986 1.66602 5.06657 1.66602 5.99999V14C1.66602 14.9334 1.66602 15.4001 1.84767 15.7566C2.00746 16.0702 2.26243 16.3252 2.57603 16.485C2.93255 16.6667 3.39926 16.6667 4.33268 16.6667ZM5.41602 9.99999H7.91602C8.14613 9.99999 8.33268 9.81345 8.33268 9.58333V7.08333C8.33268 6.85321 8.14613 6.66666 7.91602 6.66666H5.41602C5.1859 6.66666 4.99935 6.85321 4.99935 7.08333V9.58333C4.99935 9.81345 5.1859 9.99999 5.41602 9.99999Z"
                        stroke="#0A77FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 h-7 flex items-center justify-center">
                  <div className="flex-1 text-[#252525] text-md font-medium leading-7 break-words">
                    Driver's License
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start w-full">
            <div className="flex flex-col items-start gap-3 p-3 w-full">
              {attributeValues.map((group:any, index:any) => (
                <div key={index} className="w-full">
                  <div className="text-slate-500 text-base bg-slate-100 p-3 rounded w-full font-medium leading-normal mb-2">
                    {group.categoryName}
                  </div>
                  {group.attributes.map((attribute:any, idx:any) => (
                    <div
                      key={idx}
                      className="flex border-b border-slate-200 px-4 py-3  justify-between w-full"
                    >
                      <div className="text-gray-700 text-base font-medium">
                        {attribute.leftText}
                      </div>
                      <div className="text-gray-500 text-base">
                      {typeof attribute.rightText === 'boolean'
                        ? attribute.rightText
                          ? "Yes"
                          : "No"
                        : genderMap[attribute.rightText] || attribute.rightText}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start w-full">
            <div className="flex flex-col items-start gap-3 px-6 pt-4 pb-6 w-full">
              <div className="flex-1 text-[#252525] pb-2 text-lg font-medium leading-7 break-words">
                Technical Specification
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">
                  Issuer Certificate
                </div>
                <div className="text-gray-500 text-base">{IsValidCert ?? ''}</div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">mDL</div>
                <div className="text-gray-500 text-base">{ismDLAltered ?? ''}</div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">IssuerAuth</div>
                <div className="text-gray-500 text-base">{ReaderAuthPassed ?? ''}</div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">
                  Namespace Read
                </div>
                <div className="text-gray-500 text-base">
                  {/* org.iso.18013.5.1.mDL */}
                  {nameSpaceRead ?? ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex justify-between items-center py-8 w-full">
          <button
            onClick={navigateToStep8}
            className="btn-sm w-full py-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Generate Certificate →
          </button>
        </div>
      </div>
      <StepsComponent currentStep={7} />
    </div>
  );
};

export default Step7Partial;
