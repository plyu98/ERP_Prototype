import React, { useState, useEffect, useRef } from 'react';
import { HotkeysProvider, InputGroup, Button } from "@blueprintjs/core";
import { Column, Table2, Cell, TruncatedFormat } from "@blueprintjs/table";
import '@blueprintjs/core/lib/css/blueprint.css'; // Import Blueprint.js core styles
import '@blueprintjs/table/lib/css/table.css'; // Import Blueprint.js table styles


const Vendor = () => {
  const [vendors, setVendor] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const ref = useRef(null);

  const fetchData = async () => {
    try {
      const searchQuery = encodeURIComponent(inputValue);
      const url = `http://127.0.0.1:3000/api/vendor?input=${searchQuery}`;
    //   const url = `http://localhost:3000/api/vendor?input=${searchQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      setVendor(data)
    } catch (error) {
      console.error("error fetching data", error)
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  // not really necessary anymore
  const handleSearchClick = async () => {
    // if (ref.current) {
    //   const searchInput = ref.current.value;
    //   setInputValue(searchInput);
    //   fetchData();
    // }
    fetchData();
  };

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     // fetch data from express server which is on port 3001
    //     const searchQuery = encodeURIComponent(inputValue);
    //     console.log(searchQuery);
    //     const url = `http://localhost:3000/api/part?input=${searchQuery}`
    //     const response = await fetch(url);
    //     setPart(data);
    //   } catch (error) {
    //     console.error('Error fetching data', error);
    //   }
    // };

    fetchData();
  }, [inputValue]);

  // map the fetched json result into a nested array to display using blueprint cell
  const vendorMap = 
    vendors.map(vendor => (
      [vendor.NAME, vendor.ADD1+vendor.ADD2+vendor.CITY+vendor.ST+vendor.ZIP, vendor.TEL, vendor.FAX, vendor.CONTACT, vendor.EMAIL, vendor.BILLNAME, vendor.BILLADD1+vendor.BILLADD2+vendor.BILLCITY+vendor.BILLST+vendor.BILLZIP, vendor.BILLTEL, vendor.BILLFAX, vendor.BILLCONTACT, vendor.BILLEMAIL, vendor.ACCTNO, vendor.PAYTERM, vendor.STATUS, vendor.NOTES]
    ))
  
  // renders each cell in the table
  const cellRenderer = (rowIndex, columnIndex) => {
    return ( 
    <Cell>
        <TruncatedFormat detectTruncation={true}>
            {vendorMap[rowIndex][columnIndex]}
        </TruncatedFormat>
    </Cell>
    )
  };

  const searchButton = 
  <Button minimal={true} onClick={handleSearchClick}>
    Search
  </Button>

  // displays postgresql table in blueprint table2
  return (
    <div>
      {/* <InputGroup
        placeholder='Type Part No...'
        type="search"
        inputRef={ref}
        rightElement={searchButton}
      /> */}
      <InputGroup
        placeholder="Type vendor name..."
        type="search"
        rightElement={searchButton}
        value={inputValue}
        onChange={handleInputChange}
        asyncControl={true}
      />
      <HotkeysProvider>
        <Table2 numRows={vendors.length}>
            <Column name="Order To" cellRenderer={cellRenderer}/>
            <Column name="Address" cellRenderer={cellRenderer}/>
            <Column name="Tel" cellRenderer={cellRenderer}/>
            <Column name="Fax" cellRenderer={cellRenderer}/>
            <Column name="Contact" cellRenderer={cellRenderer}/>
            <Column name="Email" cellRenderer={cellRenderer}/>
            <Column name="Bill To" cellRenderer={cellRenderer}/>
            <Column name="Bill Address" cellRenderer={cellRenderer}/>
            <Column name="Bill Tel" cellRenderer={cellRenderer}/>
            <Column name="Bill Fax" cellRenderer={cellRenderer}/>
            <Column name="Bill Contact" cellRenderer={cellRenderer}/>
            <Column name="Bill Email" cellRenderer={cellRenderer}/>
            <Column name="Account No." cellRenderer={cellRenderer}/>
            <Column name="Pay Term" cellRenderer={cellRenderer}/>
            <Column name="Status" cellRenderer={cellRenderer}/>
            <Column name="Notes" cellRenderer={cellRenderer}/>
        </Table2>
      </HotkeysProvider>
    </div>
  );
};

export default Vendor;
