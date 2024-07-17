/**
 * Global varaibles
 */

import {
  Classes
} from "@blueprintjs/core";

// base url of new tm application depending on development and production mode
// port number refers to the node.js server's port number
// ip address has been replaced for security
const BASE_URL = process.env.NODE_ENV === 'production' ? 'http://test:3001' : 'http://localhost:3001';

// column header name renderer for tables
const renderName = (name) => {
  return (
    <div className={Classes.TEXT_LARGE}>
      <strong>{name}</strong>
    </div>
  );
}

// preload script's filepath
const PRELOAD_PATH = 'C:\dev\projects\electron-app\public\preload.js'

// status codes dictionary for CPO, Customer, Vendor, and Order
const status = {
  3: 'Open',
  4: 'Closed'
}

// quotation category for CRFQ
const category = {
  0: "Mass",
  1: "R&D",
  2: "Budget",
  3: "Feasibility",
  4: "Mass(Pre)",
  5: "R&D(Pre)"
}

// get params from hash url string
const getParams = (window) => {
  const parsedUrl = window.location.hash.split('?')[1];
  const hashParams = {};

  if (parsedUrl.includes('&')) {
    const params = parsedUrl.split('&');
    for (let param of params) {
      const [key, value] = param.split('=');
      hashParams[key] = decodeURIComponent(value);
    }
  } else {
    const [key, value] = parsedUrl.split('=');
    hashParams[key] = decodeURIComponent(value);
  }

  return hashParams;
}

// map worker id to name
const idToWorker = {
  5: "worker1",
  60: "worker2",
  56: "worker3",
  107: "worker4",
  42: "worker5",
  64: "worker6",
  58: "worker7",
  59: "worker8",
  82: "worker9",
  66: "worker10",
  77: "worker11",
  81: "worker12",
  86: "worker13",
  91: "worker14",
  103: "worker15",
  105: "worker16",
  106: "worker17",
  108: "worker18",
  112: "worker19" 
}

// map receive type code
const receiveCodes = {
  0: "Receive",
  2: "Tie",
  5: "CPO",
  6: "VPO",
  7: "CSHIP",
  8: "CRMA",
  9: "VRMA"
}

// constants to export
const contants = {
  BASE_URL,
  renderName,
  PRELOAD_PATH,
  status,
  getParams,
  category,
  idToWorker
}

export default contants; 
