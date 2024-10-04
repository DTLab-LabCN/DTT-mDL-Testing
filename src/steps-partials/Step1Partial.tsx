import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import StepsComponent from "../pages/components/StepsComponent";
import { useFormData } from "../utils/FormDataContext";

const Step1Partial = () => {
  const { formData, updateFormData, completedSteps, setCompletedSteps } = useFormData();
  const navigate = useNavigate();
  // State to track if all required fields are filled
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => { 
    // Check if the current step is allowed
    if (!completedSteps.includes(1)) {
      navigate("/"); // Navigate back to Step 0
    }
  }, [completedSteps, navigate]);

	useEffect(() => {
    if (formData.mobileType !== 'Android') {
        updateFormData({ mobileType: 'Android' });
    }
  }, [formData.mobileType, updateFormData]);

  // Update isFormValid whenever formData changes
	useEffect(() => {
    const isValid:any = formData.companyName && formData.applicationName && formData.applicationVersion;
    setIsFormValid(isValid);
}, [formData]);

  // Navigate to step 2
  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setCompletedSteps((prev:any) => [...prev, 2]);
    navigate("/step2");
  };

  // Define button style based on isFormValid state
  const nextButtonStyle = isFormValid
    ? "bg-blue-600 hover:bg-blue-700 shadow-sm rounded flex items-center gap-1.5 text-white text-sm font-semibold"
    : "bg-gray-300 cursor-not-allowed rounded flex items-center gap-1.5 text-white text-sm font-semibold";

  return (
    <div className="flex flex-col md:flex-row items-start justify-center ">
      <Sidebar className="w-full md:w-1/4" />
      <div className="flex flex-col items-start h-full p-4 md:p-12 space-y-4 w-full md:w-2/4">
        <div className="h-24 flex flex-col justify-center items-center gap-2">
          <div className="text-blue-600 text-sm font-semibold">STEP 1</div>
          <div className="flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center text-gray-900 text-2xl font-bold">
              Mobile App Details
            </div>
            <div className="text-center text-gray-500 text-base">
              Enter details of your mobile app below to begin the certification
              process.
            </div>
          </div>
        </div>
        <form
          onSubmit={() => handleSubmit}
          className="self-stretch h-[488px] flex flex-col justify-start items-start gap-4"
        >
          <div className="self-stretch h-16 flex flex-col justify-start items-start gap-1.5">
            <label
              htmlFor="companyName"
              className="self-stretch text-gray-900 text-sm font-medium"
            >
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              className="self-stretch h-10 px-3 py-2 bg-white shadow-sm border border-gray-200 rounded flex items-center gap-2"
              value={formData.companyName}
              onChange={(e) => updateFormData({ companyName: e.target.value })}
            />
          </div>
          <div className="self-stretch h-16 flex flex-col justify-start items-start gap-1.5">
            <label
              htmlFor="applicationName"
              className="self-stretch text-gray-900 text-sm font-medium"
            >
              Application Name
            </label>
            <input
              id="applicationName"
              type="text"
              className="self-stretch h-10 px-3 py-2 bg-white shadow-sm border border-gray-200 rounded flex items-center gap-2"
              value={formData.applicationName}
              onChange={(e) =>
                updateFormData({ applicationName: e.target.value })
              }
            />
          </div>

          <div className="self-stretch h-16 flex flex-col justify-start items-start gap-1.5">
            <label
              htmlFor="applicationVersion"
              className="self-stretch text-gray-900 text-sm font-medium"
            >
              Application Version
            </label>
            <input
              id="applicationVersion"
              type="text"
              className="self-stretch h-10 px-3 py-2 bg-white shadow-sm border border-gray-200 rounded flex items-center gap-2"
              value={formData.applicationVersion}
              onChange={(e) =>
                updateFormData({ applicationVersion: e.target.value })
              }
            />
          </div>
          <div className="self-stretch h-18 flex flex-col justify-end items-start gap-2">
            <label
              htmlFor="mobileType"
              className="text-gray-900 text-sm font-medium"
            >
              Mobile Type
            </label>
            <select
              id="mobileType"
              className="self-stretch  h-12 px-4 py-3 bg-gray-100 border border-gray-200 rounded flex items-center gap-3"
              value="Android"
              onChange={(e) => updateFormData({ mobileType: "Android" })}
              disabled
            >
              <option value="iOS">iOS</option>
              <option value="Android">Android</option>
            </select>
          </div>
          <div className="self-stretch h-38 flex flex-col justify-start items-start gap-2">
            <label
              htmlFor="description"
              className="self-stretch text-gray-900 text-sm font-medium"
            >
              Short Description of the App
            </label>
            <textarea
              id="description"
              className="self-stretch h-31 px-4 py-3 bg-white shadow-sm border border-gray-200 rounded flex items-start gap-2"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>

          <div className="self-stretch flex justify-between items-center mt-4">
            <div className="bg-[#ECF4FC] rounded flex items-center gap-1.5">
              <button
                onClick={() => navigate("/")}
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
                disabled={!isFormValid}
                className="btn text-sm font-semibold"
              >
                Next →
              </button>
            </div>
          </div>
        </form>
      </div>
      <StepsComponent currentStep={1} />
    </div>
  );
};

export default Step1Partial;
