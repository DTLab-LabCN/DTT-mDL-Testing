import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { FormDataProvider } from './utils/FormDataContext';
import App from './App';
import { BluetoothProvider } from './utils/BluetoothContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BluetoothProvider>
      <Router>
        <FormDataProvider>
          <App />
        </FormDataProvider>
      </Router>
    </BluetoothProvider>
  </React.StrictMode>
);
