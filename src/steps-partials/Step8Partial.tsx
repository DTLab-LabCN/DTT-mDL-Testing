import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import StepsComponent from "../pages/components/StepsComponent";
import { useFormData } from "../utils/FormDataContext";
import { useBluetooth } from "../utils/BluetoothContext";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Step8Partial = () => {
  const { setDevice, device, IsValidCert }:any = useBluetooth();
  const { completedSteps } = useFormData();
  const location = useLocation();
  const formData = useFormData();
  const navigate = useNavigate();
  const [base64Images, setBase64Images] = useState<any>({});
  const [downloadSuccess,setDownloadSuccess] = useState<any>()
  const { mDLData,selectedAttributes, ismDLAltered, nameSpaceRead, ReaderAuthPassed } = location.state || {}; // Get selectedAttributes from state or default to an empty object

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
        { id: "31", name: "Hair Color", mDLName:"hair_colour" },
        { id: "32", name: "Eye Color", mDLName:"eye_colour" },
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



  // Download the information
  const generatePDF = (data:any) => {

      const AppData = {
          "Date Tested" : `${new Date().toLocaleDateString()}`,
          "Application Name:" : `${formData.formData.applicationName ?? ""}`,
          "Company Name" : `${formData.formData.companyName ?? ""}`,
          "Application Version" : `${formData.formData.applicationVersion ?? ""}`,
          "Short Description of the App" : `${formData.formData.description ?? ""}`,
          "Mobile Type" : `${formData.formData.mobileType ?? ""}`
        }
    
      const doc:any = new jsPDF();

      // Helper function to add a section heading
      const addSectionHeading = (heading:any,startY:any) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(heading, 14, doc.autoTable.previous.finalY + 10 || 30);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const headingBottomMargin = 15; 
        return startY + headingBottomMargin;
      };

      // Add application information section
      let yPosition =  addSectionHeading("Application Information", 18);

      const appInfoData = Object.entries(AppData).map(([key, value]) => {
        return [key, value];
      });
  
      // Create table to display data
      doc.autoTable({
        head: [['elementIdentifier', 'elementIdentifier']],
        body: appInfoData,
        startY: yPosition,
        margin: { top: 5 },
      });

      yPosition = doc.autoTable.previous.finalY + 50;

      // Add a section break
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(14, yPosition, 195, 100);

      yPosition += 40;

      // Add user information section
      addSectionHeading("User Information",20);

      // Format the data into key-value pairs
      const formattedData = Object.entries(data).map(([key, value]:any) => {
        if (key === 'portrait' || key === 'signature_usual_mark') {
          return null; // Skip adding this for now, handle it separately
        }
        if (key === 'signature_usual_mark') {
          key += ' '; // Add a space to the key if it's 'signature_usual_mark'
        }
        if (key === 'sex') {
          value = genderMap[value] || value; // Map 1/2 to 'Male'/'Female', fallback to original value if not found
        }
        return [key, value];
      }).filter(item => item !== null);

      // Check for the presence of an image
      const portraitItem = data.portrait;
      const signatureItem = data.signature_usual_mark;

      const headerRow = [
        ['portrait', 'signature_usual_mark']
      ];
    
      // Create a row for the images
      const imageRow = [
          { content: '', styles: { cellPadding: 10, minCellHeight: 40 } }, // Placeholder for the first column (image will be drawn manually)
          { content: '', styles: { cellPadding: 10, minCellHeight: 40 } }  // Placeholder for the second column (image will be drawn manually)
      ];
    
      
      if(portraitItem || signatureItem){
        doc.autoTable({
          head: headerRow,
          body: [imageRow],
          startY: doc.autoTable.previous.finalY + 12 || 30,
          didDrawCell: (data:any) => {
              // Add portrait image in the first column
              if (data.row.index === 0 && data.column.index === 0 && portraitItem) {
                  data.cell.y += 3;
                  doc.addImage(portraitItem, 'PNG', data.cell.x + 5, data.cell.y + 5, 25, 25);
              }
      
              // Add signature image in the second column
              if (data.row.index === 0 && data.column.index === 1 && signatureItem) {
                  data.cell.y += 3;
                  doc.addImage(signatureItem, 'PNG', data.cell.x + 5, data.cell.y + 5, 25, 25);
              }
          },
          margin: { top: 12 },
        });
      }
    
      // Add any additional rows of text data after the image row
      doc.autoTable({
          head: [['elementIdentifier', 'elementValue']],
          body: formattedData, // Assuming this contains the remaining key-value pairs
          startY: doc.autoTable.previous.finalY + 10,  // Continue from where the images end
      });

      doc.save('user-information.pdf');
      setDownloadSuccess(true);
  };


  // Step 1: Extract Selected Attributes
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

  const fetchBase64Images = useCallback(async () => {
    const images = {};

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
      // Set a timeout to disconnect after 300 seconds (5 minutes)
      const timerId = setTimeout(() => {
        if (device) {
            device.gatt.disconnect();
            console.log('Disconnected from Bluetooth Device after 300 seconds');
          }
        }, 30000); // 300000 milliseconds = 300 seconds

  
        // Clean up function to clear the timeout and disconnect if the component unmounts
        return () => {
            clearTimeout(timerId);
            if (device && device.gatt.connected) {
                // server.disconnect();
                console.log('Disconnected from Bluetooth Device on component unmount');
            }
          };
    })

    useEffect(() => { 
      if (!completedSteps.includes(2)) {
        navigate("/"); // Navigate back to Step 1
      }
  }, [completedSteps, navigate]);

    useEffect(() => {
      if(device){
        device.addEventListener('gattserverdisconnected', onDeviceDisconnected);
      
        console.log('device:',device)

      return () => {
        device.removeEventListener('gattserverdisconnected', handleDisconnected);
        };
      }
	  },[device])

    const genderMap:any = {
      1: "Male",
      2: "Female"
    };


  return (
    <div className="flex flex-col md:flex-row items-start justify-center">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
        <div className="h-24 flex flex-col justify-center items-center gap-2 mb-8">
          <div className="text-blue-600 text-sm font-semibold">STEP 8</div>
          <div className="flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
            Download Results
            </div>
            <div className="text-center text-gray-500 text-base">
              Download your app certification using the button below. After
              downloading, remember to disconnect Bluetooth for added security.
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
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5833 11.6667V14.5833M14.5833 14.5833V17.5M14.5833 14.5833H17.5M14.5833 14.5833H11.6667M4.16667 8.33333H6.66667C7.58714 8.33333 8.33333 7.58714 8.33333 6.66667V4.16667C8.33333 3.24619 7.58714 2.5 6.66667 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V6.66667C2.5 7.58714 3.24619 8.33333 4.16667 8.33333ZM4.16667 17.5H6.66667C7.58714 17.5 8.33333 16.7538 8.33333 15.8333V13.3333C8.33333 12.4129 7.58714 11.6667 6.66667 11.6667H4.16667C3.24619 11.6667 2.5 12.4129 2.5 13.3333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5ZM13.3333 8.33333H15.8333C16.7538 8.33333 17.5 7.58714 17.5 6.66667V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5H13.3333C12.4129 2.5 11.6667 3.24619 11.6667 4.16667V6.66667C11.6667 7.58714 12.4129 8.33333 13.3333 8.33333Z"
                        stroke="#0A77FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 h-7 flex items-center justify-center">
                  <div className="flex-1 text-[#252525] text-md font-medium leading-7 break-words">
                    App Information
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start w-full">
            <div className="flex flex-col items-start gap-3 p-6 w-full">
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">
                  Date Tested
                </div>
                <div className="text-gray-500 text-base">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">
                  Application Name
                </div>
                <div className="text-gray-500 text-base">
                  {formData.formData.applicationName ?? ""}
                </div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">
                  Company Name
                </div>
                <div className="text-gray-500 text-base">
                  {formData.formData.companyName || ""}
                </div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">
                  Application Version
                </div>
                <div className="text-gray-500 text-base">
                  {formData.formData.applicationVersion || ""}
                </div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full gap-5">
                <div className="text-gray-700 text-base font-medium">
                  Short Description of the App
                </div>
                <div className="text-gray-500 text-base text-right flex-1">
                  {formData.formData.description || ""}
                </div>
              </div>
              <div className="flex border-b border-slate-200 pb-2 justify-between w-full">
                <div className="text-gray-700 text-base font-medium">
                  Mobile Type
                </div>
                <div className="text-gray-500 text-base">
                  {formData.formData.mobileType || ""}
                </div>
              </div>
            </div>
          </div>{" "}
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
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col items-start gap-3 p-3 w-full">
                {attributeValues.map((group, index) => (
                  <div key={index} className="w-full">
                    <div className="text-slate-500 text-base bg-slate-100 p-3 rounded w-full font-medium leading-normal mb-2">
                      {group.categoryName}
                    </div>
                    {group.attributes.map((attribute, idx) => (
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
                          {/* {attribute.rightText} */}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
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
                {nameSpaceRead ?? ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        {downloadSuccess &&
          <div
          className="inline-flex justify-center items-center hover:border-blue-600 gap-1.5 w-full h-full p-2.5 bg-[#E9F8F1] border border-[#A9E3C7] rounded-md shadow-sm "
        >
            {/* <div className="relative w-4 h-4"> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V13M12 16V16.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#1F945C" stroke-width="2" stroke-linecap="round"/>
            </svg>
          {/* </div> */}
          <div
            className="text-[#1F945C] text-sm font-semibold "
          >
            Download completed successfully.
          </div>
        </div>
        }
       
        <div className="self-stretch flex justify-between items-center w-full">
        <button
          onClick={()=>generatePDF(dynamicData)}
          className="inline-flex justify-center items-center hover:border-blue-600 gap-1.5 w-full h-full p-2 bg-blue-600 border border-[#EAEBF0] rounded-md shadow-sm "
        >
          <div
            className="text-[white] text-sm font-semibold "
          >
            Download
          </div>
          <div className="relative w-4 h-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.75 2C8.75 1.58579 8.41421 1.25 8 1.25C7.58579 1.25 7.25 1.58579 7.25 2L8.75 2ZM7.25 9.33333C7.25 9.74755 7.58579 10.0833 8 10.0833C8.41421 10.0833 8.75 9.74755 8.75 9.33333L7.25 9.33333ZM11.197 8.53033C11.4899 8.23744 11.4899 7.76256 11.197 7.46967C10.9041 7.17678 10.4292 7.17678 10.1363 7.46967L11.197 8.53033ZM8.4714 10.1953L7.94107 9.66493L7.94107 9.66493L8.4714 10.1953ZM7.5286 10.1953L8.05893 9.66493L8.05893 9.66493L7.5286 10.1953ZM5.86366 7.46967C5.57077 7.17678 5.0959 7.17678 4.803 7.46967C4.51011 7.76256 4.51011 8.23744 4.803 8.53033L5.86366 7.46967ZM2.75 10.6667C2.75 10.2525 2.41421 9.91667 2 9.91667C1.58579 9.91667 1.25 10.2525 1.25 10.6667H2.75ZM14.75 10.6667C14.75 10.2525 14.4142 9.91667 14 9.91667C13.5858 9.91667 13.25 10.2525 13.25 10.6667H14.75ZM12.908 13.782L12.5675 13.1138L12.5675 13.1138L12.908 13.782ZM13.782 12.908L14.4503 13.2485L14.4503 13.2485L13.782 12.908ZM2.21799 12.908L1.54973 13.2485L2.21799 12.908ZM3.09202 13.782L2.75153 14.4503L2.75153 14.4503L3.09202 13.782ZM7.25 2L7.25 9.33333L8.75 9.33333L8.75 2L7.25 2ZM10.1363 7.46967L7.94107 9.66493L9.00173 10.7256L11.197 8.53033L10.1363 7.46967ZM8.05893 9.66493L5.86366 7.46967L4.803 8.53033L6.99827 10.7256L8.05893 9.66493ZM7.94107 9.66493C7.97362 9.63239 8.02638 9.63239 8.05893 9.66493L6.99827 10.7256C7.55151 11.2788 8.44849 11.2788 9.00173 10.7256L7.94107 9.66493ZM1.25 10.6667V10.8H2.75V10.6667H1.25ZM5.2 14.75H10.8V13.25H5.2V14.75ZM14.75 10.8V10.6667H13.25V10.8H14.75ZM10.8 14.75C11.3477 14.75 11.8035 14.7506 12.1747 14.7203C12.5546 14.6892 12.9112 14.6221 13.2485 14.4503L12.5675 13.1138C12.4769 13.1599 12.3396 13.2018 12.0525 13.2252C11.7566 13.2494 11.3724 13.25 10.8 13.25V14.75ZM13.25 10.8C13.25 11.3724 13.2494 11.7566 13.2252 12.0525C13.2018 12.3396 13.1599 12.4769 13.1138 12.5675L14.4503 13.2485C14.6221 12.9112 14.6892 12.5546 14.7203 12.1747C14.7506 11.8035 14.75 11.3477 14.75 10.8H13.25ZM13.2485 14.4503C13.7659 14.1866 14.1866 13.7659 14.4503 13.2485L13.1138 12.5675C12.9939 12.8027 12.8027 12.9939 12.5675 13.1138L13.2485 14.4503ZM1.25 10.8C1.25 11.3477 1.24942 11.8035 1.27974 12.1747C1.31078 12.5546 1.37789 12.9112 1.54973 13.2485L2.88624 12.5675C2.8401 12.4769 2.79822 12.3396 2.77476 12.0525C2.75058 11.7566 2.75 11.3724 2.75 10.8H1.25ZM5.2 13.25C4.62757 13.25 4.24336 13.2494 3.94748 13.2252C3.66035 13.2018 3.52307 13.1599 3.43251 13.1138L2.75153 14.4503C3.08879 14.6221 3.44545 14.6892 3.82533 14.7203C4.19646 14.7506 4.65232 14.75 5.2 14.75V13.25ZM1.54973 13.2485C1.81338 13.7659 2.23408 14.1866 2.75153 14.4503L3.43251 13.1138C3.19731 12.9939 3.00608 12.8027 2.88624 12.5675L1.54973 13.2485Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </button>
          {/* <button
            onClick={handleNextStep}
            className="btn-sm w-full py-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Disconnect Bluetooth
          </button> */}
        </div>
      </div>
      <StepsComponent currentStep={8} />
    </div>
  );
};

export default Step8Partial;
