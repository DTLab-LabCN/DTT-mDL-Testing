import React from 'react';

interface StepsComponentProps {
	currentStep?: any;
  }

const StepsComponent: React.FC<StepsComponentProps> = ({ currentStep }) => {


    const steps = Array.from({ length: 8 }, (_, index) => {
      let state;
    
      if (currentStep > index + 1) {
        state = 'completed';
      } else if (currentStep === index + 1) {
        state = 'current';
      } else {
        state = 'upcoming';
      }
    
      return {
        label: `Step ${index + 1}`,
        state,
      };
    });
      
      steps[0].label = 'Mobile App Details';
      steps[1].label = 'Scan QR Code';
      steps[2].label = 'Connect to a Mobile Device';
      steps[3].label = 'Issuer Certificate Details';
      steps[4].label = 'Verifier Certificate Details';
      steps[5].label = 'Information Requested';
      steps[6].label = 'Information Received';
      steps[7].label = 'Download Certificate';
  
    const getStepClasses = (state:string) => {
      switch (state) {
        case 'completed':
          return 'bg-blue-600 text-white border-transparent flex justify-center items-center';
        case 'current':
          return 'text-white bg-blue-600 border-blue-600 flex justify-center items-center';
        case 'upcoming':
        default:
          return 'bg-gray-50 text-gray-400 border-gray-200 flex justify-center items-center';
      }
    };
  
  return (
    <div className="rounded-md bg-[#F7F7F7] justify-start items-start gap-3 p-2 sm:p-3 h-full">
      <ol className="space-y-8 pt-12">
        {steps.map((step, index) => (
          <li key={step.label} className={`relative flex-1 ${index < steps.length - 1 ? 'after:content-[""] after:w-0.5 after:h-full after:bg-gray-200 after:inline-block after:absolute after:-bottom-10 after:left-4 lg:after:left-5' : ''} ${step.state === 'completed' ? 'after:bg-blue-600' : ''}`}>
            <div className={`flex items-start font-medium w-full`}>
              <span className={`w-8 h-8 aspect-square rounded-full mr-3 text-sm lg:w-10 lg:h-10 ${getStepClasses(step.state)}`}>
                {step.state === 'completed' ? '✓' : index + 1}
              </span>
              <div className="block mt-2">
              <h4 className={`text-base mb-2 ${step.state === 'completed' || step.state === 'current' ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</h4>
            </div>
          </div>
        </li>
      ))}
    </ol>
  </div>
  );
};

export default StepsComponent;