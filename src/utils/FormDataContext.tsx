import React, {  useContext, ReactNode, useState, useEffect } from "react";

// Define the shape of the form data
interface FormData {
  companyName: string;
  applicationName: string;
  applicationVersion: string;
  description: string;
  mobileType: "iOS" | "Android"; // Update with actual options if needed
  // Add other fields as necessary
}

// Define the shape of the context value
interface FormDataContextType {
  formData: FormData;
  updateFormData: (newData: Partial<FormData>) => void;
  completedSteps:any;
  setCompletedSteps:React.Dispatch<React.SetStateAction<any>>
}

const FormDataContext = React.createContext<FormDataContextType | undefined>(
  undefined
);

// Custom hook to use the form data context
export const useFormData = () => {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error("useFormData must be used within a FormDataProvider");
  }
  return context;
};

// Define the props for the FormDataProvider component
interface FormDataProviderProps {
  children: ReactNode;
}

// FormDataProvider component
export const FormDataProvider: React.FC<FormDataProviderProps> = ({
  children,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    companyName: "",
    applicationName: "",
    applicationVersion: "",
    description: "",
    mobileType: "Android",
    // Add other fields as necessary
  });
  const [completedSteps, setCompletedSteps] = useState([0]);

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
  };

  return (
    <FormDataContext.Provider value={{ formData, updateFormData, setCompletedSteps, completedSteps }}>
      {children}
    </FormDataContext.Provider>
  );
};
