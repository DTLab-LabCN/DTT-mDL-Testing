import React, { useContext, ReactNode } from "react";

// Define the type for the context state
interface BluetoothContextType {
  device: BluetoothDevice | null;
  setDevice: React.Dispatch<React.SetStateAction<BluetoothDevice | null>>;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  setCharacteristic: React.Dispatch<
    React.SetStateAction<BluetoothRemoteGATTCharacteristic | null>
  >;
  KeyPair: any;
  setKeyPair: React.Dispatch<React.SetStateAction<any>>;
  SkDeviceContext: any;
  setSkDeviceContext: React.Dispatch<React.SetStateAction<any>>;
  IssuerCert:any;
  setIssuerCert:React.Dispatch<React.SetStateAction<any>>
  VerifierCert:any;
  setVerifierCert:React.Dispatch<React.SetStateAction<any>>
  IsValidCert:any;
  setIsValidCert:React.Dispatch<React.SetStateAction<any>>
  ServiceId:any;
  setServiceId:React.Dispatch<React.SetStateAction<any>>
}

// Create the context with a default value
const BluetoothContext = React.createContext<BluetoothContextType | undefined>(
  undefined
);

// Custom hook to use the Bluetooth context
export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
};

// Define the provider props interface
interface BluetoothProviderProps {
  children: ReactNode;
}

// BluetoothProvider component
export const BluetoothProvider: React.FC<BluetoothProviderProps> = ({
  children,
}) => {
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] =
  React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [KeyPair, setKeyPair] = React.useState<any>();
  const [SkDeviceContext, setSkDeviceContext] = React.useState<any>();
  const [IssuerCert ,setIssuerCert] = React.useState<any>();
  const [VerifierCert ,setVerifierCert] = React.useState<any>();
  const [IsValidCert ,setIsValidCert] = React.useState<any>();
  const [ServiceId ,setServiceId] = React.useState<any>();

  return (
    <BluetoothContext.Provider
      value={{
        device,
        setDevice,
        characteristic,
        setCharacteristic,
        KeyPair,
        setKeyPair,
        SkDeviceContext,
        setSkDeviceContext,
        IssuerCert,
        setIssuerCert,
        VerifierCert,
        setVerifierCert,
        IsValidCert,
        setIsValidCert,
        ServiceId,
        setServiceId
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};
