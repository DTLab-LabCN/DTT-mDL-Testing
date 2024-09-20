declare module '*.png' {
    const value: string;
    export default value;
  }
  
  declare module '*.jpg' {
    const value: string;
    export default value;
  }
  
  declare module '*.jpeg' {
    const value: string;
    export default value;
  }
  
  declare module '*.gif' {
    const value: string;
    export default value;
  }
  
  declare module '*.svg' {
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const value: string;
    export { ReactComponent };
    export default value;
  }
  
  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    // add other properties and methods as needed
  }
  
  interface BluetoothRemoteGATTServer {
    device: BluetoothDevice;
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    // add other properties and methods as needed
  }
  
  interface BluetoothRemoteGATTCharacteristic {
    uuid: string;
    value?: DataView;
    readValue(): Promise<DataView>;
    writeValue(value: ArrayBuffer | Uint8Array): Promise<void>;
    // add other properties and methods as needed
  }
  