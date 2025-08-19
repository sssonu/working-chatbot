import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { NhostClient, NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';

const nhost = new NhostClient({
  subdomain: 'xlcsafwkldfcycbjqimb', // <-- Nhost dashboard se copy karein
  region: 'ap-south-1'        // <-- Nhost dashboard se copy karein
});

const theme = createTheme({
  colorScheme: 'dark',
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NhostProvider nhost={nhost}>
        <NhostApolloProvider nhost={nhost}>
          <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <App />
          </MantineProvider>
        </NhostApolloProvider>
      </NhostProvider>
    </BrowserRouter>
  </React.StrictMode>
);