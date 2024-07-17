// Modify your React component to fetch data from the backend
import React, { useState, useEffect, Component } from 'react';
import { HotkeysProvider } from "@blueprintjs/core";
import { Column, Table2, Cell } from "@blueprintjs/table";
import '@blueprintjs/core/lib/css/blueprint.css'; // Import Blueprint.js core styles
import '@blueprintjs/table/lib/css/table.css'; // Import Blueprint.js table styles


const Payterm = () => {
  const [payterms, setPayterms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch data from express server which is on port 3001
        const response = await fetch('http://localhost:3000/api/payterm');
        // const response = await fetch('http://localhost:3001/api/payterm');
        const data = await response.json();
        setPayterms(data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
      
    };

    fetchData();
  }, []);

  // map the fetched json result into a nested array to display using blueprint cell
  const map1 = 
    payterms.map(payterm => (
      [payterm.PTID, payterm.TERMINT, payterm.DESCR]
    ))
  

  const cellRenderer = (rowIndex, columnIndex) => {
    return <Cell>
      {map1[rowIndex][columnIndex]}
    </Cell>
  };

  // displays postgresql table in blueprint table2
  return (
    <HotkeysProvider>
      <Table2 numRows={payterms.length}>
          <Column name="PTID"cellRenderer={cellRenderer}/>
          <Column name="TERMINT" cellRenderer={cellRenderer}/>
          <Column name="DESCR" cellRenderer={cellRenderer}/>
      </Table2>
    </HotkeysProvider>
  );

  // simply displays table in a list
  // return (
  //   <div>
  //     <h1>Payterm Data</h1>
  //     <ul>
  //       {payterms.map(payterm => (
  //         <li key={payterm.PTID}>
  //           {payterm.PTID}, {payterm.TERMINT}, {payterm.DESCR}
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
};

export default Payterm;
