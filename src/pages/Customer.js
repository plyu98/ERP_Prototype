import React, { 
  useState, 
  useEffect, 
  useRef 
} from 'react';

import { 
  HotkeysProvider, 
  InputGroup, 
  Button 
} from "@blueprintjs/core";

import { 
  Column, 
  Table2, 
  Cell, 
  TruncatedFormat,
  ColumnHeaderCell
} from "@blueprintjs/table";

// import style sheets
import '@blueprintjs/core/lib/css/blueprint.css'; 
import '@blueprintjs/table/lib/css/table.css';  

// for global variables
import constants from '../config';


const Part = () => {
  const [customers, setCustomer] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const fetchData = async () => {
    try {
      const searchQuery = encodeURIComponent(inputValue);
      const url = `${constants.BASE_URL}/api/customer?input=${searchQuery}`
      const response = await fetch(url);
      const data = await response.json();
      setCustomer(data)
    } catch (error) {
      console.error("error fetching data", error)
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  useEffect(() => {
    fetchData();
  }, [inputValue]);

  // map the fetched json result into a nested array to display using blueprint cell
  const customerMap = 
    customers.map(customer => {
      const cuid = (customer.CUID != null) ? customer.CUID : '';
      const title = (customer.TITLE != null) ? customer.TITLE : '';
      const contact = (customer.BILLCONTACT != null) ? customer.BILLCONTACT : '';
      const tel = (customer.BILLTEL != null) ? customer.BILLTEL : '';
      const fax = (customer.BILLFAX != null) ? customer.BILLFAX : '';

      return [cuid, title, contact, tel, fax];
    })

  // list of column names for customer search table
  const colNames = ["CUID", "Customer", "Billing Contact", "Billing Tel.", "Biling Fax."]

  // handle double-click on the cell to open selected customer's info page
  const handleDoubleClick = (rowIndex, colIndex) => {
    const cuid = customerMap[rowIndex][0]; // use column 0 to obtain the paid value
    const url = window.location.origin+`/custinfo?cuid=${cuid}`;
    const title = 'Customer Info';
    window.electronAPI.openWindow([url, title])
  }
  
  // renders each cell in the table
  const cellRenderer = (rowIndex, columnIndex) => {
    return (
    <Cell>
      <div onDoubleClick={() => handleDoubleClick(rowIndex, columnIndex)}>
        <TruncatedFormat detectTruncation={true}>
          {customerMap[rowIndex][columnIndex]}
        </TruncatedFormat>
      </div>
    </Cell>
    )
  };

  // column header cell rendedr
  const renderColumnHeader = (index) => {
    return <ColumnHeaderCell name={colNames[index]} index={index} nameRenderer={constants.renderName} />
  };

  // columns of customer search table
  const custColumns = colNames.map((index) => {
    return <Column key={index} columnHeaderCellRenderer={renderColumnHeader} cellRenderer={cellRenderer} />
  });

  // displays postgresql table in blueprint table2
  return (
    <div>
      <InputGroup
        placeholder="Type customer name..."
        type="search"
        value={inputValue}
        onChange={handleInputChange}
        asyncControl={true}
      />
      
      <Table2 numRows={customers.length}>
        {custColumns}
      </Table2>
      
    </div>
  );
};

export default Part;
