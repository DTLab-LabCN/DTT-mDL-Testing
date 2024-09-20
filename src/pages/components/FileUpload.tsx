import React, { useState, DragEvent, ChangeEvent } from "react";
import { useBluetooth } from "../../utils/BluetoothContext";

interface FileUploaderProps {
  inputId?: string;
  acceptedTypes?: string;
  uploadType: 'issuer' | 'verifier';
  selectedOption?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  inputId = "",
  acceptedTypes = ".pem",
  uploadType,
  selectedOption
}) => {

  const { setIssuerCert, setVerifierCert } = useBluetooth();

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTime, setUploadTime] = useState(0);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
      simulateUpload(files[0]);
    }
    setIsDragOver(false);
  };

  const readFile = (file:File) => {
		const reader = new FileReader();
	
		reader.onload = (event:any) => {
		  const text = event.target.result;
      if(uploadType == 'issuer'){
        setIssuerCert(text)
      }else{
        setVerifierCert(text);
      }
		};
	
		reader.onerror = (error) => {
		  console.error('Error reading file:', error);
		};
	
		reader.readAsText(file);
	  };



  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      simulateUpload(e.target.files[0]);
      if (uploadType === 'issuer') {
        readFile(e.target.files[0]);
      } else if (uploadType === 'verifier') {
        if(selectedOption === 'upload'){
          readFile(e.target.files[0]);
        }

       
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadTime(0);
  };

  const simulateUpload = (file: File) => {
    const totalSize = file.size;
    let uploaded = 0;
    const startTime = Date.now();
    const interval = setInterval(() => {
      uploaded += totalSize * 0.05; // Simulate 5% upload progress
      if (uploaded >= totalSize) {
        uploaded = totalSize;
        clearInterval(interval);
        const endTime = Date.now();
        setUploadTime((endTime - startTime) / 1000); // Calculate time in seconds
      }
      setUploadProgress((uploaded / totalSize) * 100);
    }, 100); // Update progress every 100ms
  };

  return (
    <div
      className={`${file ? "border-none" : "border-2"} ${
        isDragOver ? "border-blue-500" : "border-gray-300"
      } flex w-full self-stretch justify-center transition bg-white border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById(inputId)?.click()}
      role="none"
    >
      {file ? (
        <div className="h-[110px] p-4 w-full bg-white rounded-[10px] shadow border border-[#eaebf0] flex-col justify-start items-start gap-4 inline-flex">
          <div className="self-stretch justify-start items-center gap-2 inline-flex">
            <div className="grow shrink basis-0 pr-8 flex-col justify-start items-start inline-flex">
              <div className="self-stretch text-[#0977ff] text-[15px] font-medium font-['Inter'] leading-snug">
                {file.name}
              </div>
              <div className="self-stretch text-[#68727d] text-sm font-medium font-['Inter'] leading-tight">
                {(file.size / 1024).toFixed(2)} kb - {uploadTime.toFixed(2)}{" "}
                seconds
              </div>
            </div>
            <div className="self-stretch justify-start items-start flex">
              <div className="rounded-md justify-center items-center flex">
                <button
                  className="text-red-500 text-sm pt-2"
                  onClick={handleRemoveFile}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <div className="self-stretch justify-start items-center gap-2 inline-flex">
            <div className="w-full bg-gray-200 rounded-full h-1.5 ">
              <div
                className="bg-blue-600 h-1.5 rounded-full "
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-[#252525] text-sm font-medium font-['Inter'] leading-tight">
              {uploadProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      ) : (
        <span className="flex px-4 h-28 items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="font-medium text-sm text-gray-600">
            Drag and Drop or
            {' '}<span className="text-blue-600 underline">
            choose your file
            </span>{' '}
            for upload
          </span>
        </span>
      )}
      <input
        id={inputId}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FileUploader;
