import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { Toaster } from 'react-hot-toast';
import { App } from './App';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider>
            <BrowserRouter>
                <App />
                <Toaster position="top-right" />
            </BrowserRouter>
        </MantineProvider>
    </React.StrictMode>
);