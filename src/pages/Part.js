import React, { useState, useEffect, useRef } from 'react';
import { 
  HotkeysProvider, 
  InputGroup, 
  Button,
  Popover,
  Menu,
  MenuItem,
  Classes
} from "@blueprintjs/core";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat, 
  ColumnHeaderCell,
  SelectionModes
} from "@blueprintjs/table";
import '@blueprintjs/core/lib/css/blueprint.css'; // Import Blueprint.js core styles
import '@blueprintjs/table/lib/css/table.css'; // Import Blueprint.js table styles
import { ColorFill } from '@blueprintjs/icons';

// for global variables
import constants from '../config';

const Part = () => {
  const [parts, setPart] = useState([]);

  // state variable for search key
  const [inputValue, setInputValue] = useState('');

  // state variable for search option (menu option of popover item)
  const [selectedOption, setOption] = useState('Part No.');

  // state variable for search option popover
  const [isOpen, setIsOpen] = useState(false);

  // list of column names for part search table
  const partNames = ["PAID", "Part No.", "NSN", "Description", "Notes"];

  const fetchData = async () => {
    try {
      const searchQuery = encodeURIComponent(inputValue);
      const optionQuery = encodeURIComponent(selectedOption);
      // const url = `http://127.0.0.1:3000/api/part`;
      const url = `${constants.BASE_URL}/api/part?input=${searchQuery}&option=${optionQuery}`;
      // const url = `http://localhost:3000/api/part?input=${searchQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      setPart(data)
    } catch (error) {
      console.error("error fetching data", error)
    }
  }

  // handles search input vale change
  const handleInputChange = (e) => {
    setInputValue(e);
  }

  // fetches data whenever there's a change in search input field or option
  useEffect(() => {
    fetchData();
  }, [inputValue, selectedOption]);

  // map the fetched json result into a nested array to display using blueprint cell
  const partMap = 
    parts.map(part => {

      const paid = (part.PAID != null) ? part.PAID : '';
      const partno = (part.PARTNO != null) ? part.PARTNO : '';
      const nsn = (part.INT_PID != null) ? part.INT_PID : '';
      const descr = (part.DESCRIPTION != null) ? part.DESCRIPTION : '';
      const notes = (part.NOTES != null) ? part.NOTES : '';

      return [paid, partno, nsn, descr, notes];
    })

  // handle double-click on the cell within the table
  const handleDoubleClick = (rowIndex, colIndex) => {
    const paid = partMap[rowIndex][0]; // use column 0 to obtain the paid value
    const url = window.location.origin+`/partinfo?paid=${paid}`;
    const title = 'Part Info';
    window.electronAPI.openWindow([url, title])
  }
  
  // renders each cell in the table
  const cellRenderer = (rowIndex, columnIndex) => {
    return (
    <Cell interactive={true}>
      <div onDoubleClick={() => handleDoubleClick(rowIndex, columnIndex)}>
        <TruncatedFormat detectTruncation={true}>
          {partMap[rowIndex][columnIndex]}
        </TruncatedFormat>
      </div>
    </Cell>
    )
  };

  // column header cell renderer
  const renderColumnHeader = (index) => {
    return <ColumnHeaderCell name={partNames[index]} index={index} nameRenderer={constants.renderName} />
  }

  // build actual columns of part search table
  const partColumns = partNames.map((index) => {
    return <Column key={index} columnHeaderCellRenderer={renderColumnHeader} cellRenderer={cellRenderer}/>
  });

  // assign column width values
  const widths = {
    paid: 60,
    partno: 150,
    nsn: 150,
    descr: 150,
    notes: 150
  }
  const widthValues = Object.values(widths);

  // handle part click for the search options
  const handleItemClick = (value) => {
    setOption(value);
    setIsOpen(false);
  };

  // Popover interaction handler
  const handlePopoverInteraction = (nextOpenState) => {
    setIsOpen(nextOpenState);
  };

  // popover search option
  const searchOption = (
    <Popover
      content={
        <Menu>
          <MenuItem text="Part No." onClick={() => handleItemClick('Part No.')}/>
          <MenuItem text="NSN"  onClick={() => handleItemClick('NSN')}/>
          <MenuItem text="Desc." onClick={() => handleItemClick('Desc.')}/>
          <MenuItem text="Vendor Part No." onClick={() => handleItemClick('Vendor Part No.')}/>
          <MenuItem text="Notes" onClick={() => handleItemClick('Notes')}/>
        </Menu>
      }
      placement="bottom-end"
      isOpen={isOpen}
      onInteraction={handlePopoverInteraction}
    >
      <Button minimal={true} rightIcon="caret-down">
        {selectedOption}
      </Button>
    </Popover>
  );

  // displays postgresql table in blueprint table2
  return (
    <div>
      <InputGroup
        placeholder="Search"
        type="search"
        leftIcon="search"
        rightElement={searchOption}
        value={inputValue}
        onValueChange={handleInputChange}
        fill={true}
      />
      
      <Table2 
        numRows={parts.length} 
        enableFocusedCell={true}
      >
        {partColumns}
      </Table2>
      
    </div>
  );
};

export default Part;
