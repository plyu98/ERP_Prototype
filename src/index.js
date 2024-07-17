import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Home from './pages/Home';
import Part from './pages/Part';
import PartInfo from './pages/PartInfo';
import Payterm from './pages/Payterm';
import Customer from './pages/Customer';
import Vendor from './pages/Vendor';
import VpoHist from './pages/VpoHist';
import QuotHist from './pages/QuotHist';
import EccnHist from './pages/EccnHist';
import Inventory from './pages/Inventory';
import Links from './pages/Links';
import CustomerInfo from './pages/CustomerInfo';
import VendorInfo from './pages/VendorInfo';
import CRFQ from './pages/CRFQ';
import { HotkeysProvider, OverlaysProvider, BlueprintProvider } from '@blueprintjs/core';

import {
  createBrowserRouter, 
  RouterProvider,
  createHashRouter
} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

// need to use createHashRouter for react-electron
const router = createHashRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/part",
    element: <Part />
  },
  {
    path: "/payterm",
    element: <Payterm />
  },
  {
    path: "/customer",
    element: <Customer />
  },
  {
    path: "/vendor",
    element: <Vendor />
  },
  {
    path:"/partinfo",
    element: <PartInfo />
  },
  {
    path:"/vpohist",
    element: <VpoHist />
  },
  {
    path:"/quothist",
    element: <QuotHist />
  },
  {
    path:"/eccnhist",
    element: <EccnHist />
  },
  {
    path:"/inventory",
    element: <Inventory />
  },
  {
    path:"/links",
    element: <Links />
  },
  {
    path:"/custinfo",
    element: <CustomerInfo />
  },
  {
    path:"/vendinfo",
    element: <VendorInfo />
  },
  {
    path:"/crfqinfo",
    element: <CRFQ />
  }
]);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Home />
//   },
//   {
//     path: "/part",
//     element: <Part />
//   },
//   {
//     path: "/payterm",
//     element: <Payterm />
//   },
//   {
//     path: "/customer",
//     element: <Customer />
//   },
//   {
//     path: "/vendor",
//     element: <Vendor />
//   },
//   {
//     path:"/partinfo",
//     element: <PartInfo />
//   },
//   {
//     path:"/vpohist",
//     element: <VpoHist />
//   },
//   {
//     path:"/quothist",
//     element: <QuotHist />
//   },
//   {
//     path:"/eccnhist",
//     element: <EccnHist />
//   },
//   {
//     path:"/inventory",
//     element: <Inventory />
//   },
//   {
//     path:"/links",
//     element: <Links />
//   },
//   {
//     path:"/custinfo",
//     element: <CustomerInfo />
//   },
//   {
//     path:"/vendinfo",
//     element: <VendorInfo />
//   },
//   {
//     path:"/crfqinfo",
//     element: <CRFQ />
//   }
// ]);

root.render(
  
  // disabled strict mode to avoid context menu snaps to top left corner bug
  //<React.StrictMode>
    <BlueprintProvider>
      
      <RouterProvider router={router}/>
    </BlueprintProvider>
  //</React.StrictMode>
  
  // <React.StrictMode>
  //   <HotkeysProvider>
  //     <RouterProvider router={router}/>
  //   </HotkeysProvider>
  // </React.StrictMode>
);
// root.render(
//   <React.StrictMode>
//     <Home />
//   </React.StrictMode>
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
