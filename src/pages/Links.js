import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HotkeysProvider, 
  InputGroup, 
  Button,
  Popover,
  Menu,
  MenuItem,
  Label,
  Text,
  Colors,
  Tag,
  TextArea,
  EditableText,
  Dialog,
  DialogBody,
  DialogFooter,
  Switch,
  Navbar,
  NavbarGroup,
  Alignment,
  Intent,
  Classes,
  Spinner,
  FileInput,
  ContextMenu,
  showContextMenu,
  hideContextMenu,
  OverlayToaster,
  Position
} from "@blueprintjs/core";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat,
  TableLoadingOption,
  EditableCell2,
  ColumnHeaderCell,
  SelectionModes,
} from "@blueprintjs/table";
import {useImmer} from 'use-immer';

// style sheets
import '@blueprintjs/core/lib/css/blueprint.css'; 
import '@blueprintjs/table/lib/css/table.css'; 
import '../styles/partinfo.scss'


// global variables for path, etc
import constants from '../config';

const Links = () => {

  // linked documents/web urls
  const [links, setLinks] = useState([]);

  // fetch data variabel
  const [isFetched, setFetched] = useState(false);

  // get part id
  const params = constants.getParams(window);
  const paid = params['paid'];

  const fetchData = async() => {
    try{
			const response = await fetch(`${constants.BASE_URL}/api/partinfo/links?input=${paid}`, {method: 'GET'});
			const data = await response.json();

			// parsed the fetched data; return the first index because parsed is a nested list
			const parsedData = data.map(item => {

        const parsed = []
        for (let key in item) {
          if (item[key] !== null) {
            parsed.push([key, item[key]]);
          } else {
            parsed.push([key, '-']);
          }
        }
				return parsed
				
			})[0]
			setLinks(parsedData);

      // marked fetched as complete
      setFetched(true);

    } catch (error) {
      console.error("Error fetching data ", error);
    }
  }

  // handle confirm for changes in links cell
  const handleConfirm = (value, rowIndex, colIndex) => {
    // initialize the toaster
    const myToaster = OverlayToaster.create({position: "top"});

    // check if the link cell has been edited; if not, display warning
    if (colIndex === 0){
      myToaster.show({
        message: "Only link can be edited!",
        intent: Intent.WARNING      
      })
    } else if (value === links[rowIndex][1]) {
      // do nothing if value hasn't changed
      return;
    } else {
      
      // record the doc column for update
      const docNo = links[rowIndex][0];
      
      // update the database with the edited link
      try {
        fetch(`${constants.BASE_URL}/api/links?input=${paid}`, {
          method: 'POST',
          headers: {
            'Content-type' : 'application/json'
          },
          body: JSON.stringify({
            path: value,
            doc: docNo
          })
        });
      } catch (error) {
        console.error('Error executing query', error);
      }

      myToaster.show({
        message: "New link has been saved!",
        intent: Intent.PRIMARY
      })

    }
  }
  
  // for attached links table
  const linksCellRenderer = (rowIndex, columnIndex) => {
    return (
      <EditableCell2
        value={links[rowIndex][columnIndex]}
        onConfirm={(value) => handleConfirm(value, rowIndex, columnIndex)}
      />
    )
  }

   // column list for attached links
   const linksNames = ["Type","Link"];

  // column header cell renderer
  const renderColumnHeader = (index) => {
    return <ColumnHeaderCell name={linksNames[index]} index={index} nameRenderer={constants.renderName} />;
  }

  // build actual attached links columns
  const linksColumns = linksNames.map((index) => {
    return <Column key={index} columnHeaderCellRenderer={renderColumnHeader} cellRenderer={linksCellRenderer}/>;
  })

  // get loading options for table loading state
  const getLoadingOptions = () => {
    const loadingOptions = [];
    if (isFetched !== true) {
      loadingOptions.push(TableLoadingOption.CELLS);
    }
    return loadingOptions;
  }

  // handle open file function 
  const handleOpenClick = (rowIndex) => {
    
    // console.log(links[rowIndex][1]);
    const filePath = links[rowIndex][1];
    window.electronAPI.openFile(filePath);
  }

  // handle insert file option
  const handleSelectClick = async (rowIndex) => {
    
    // initialize the toaster
    const myToaster = OverlayToaster.create({position: "top"});
    
    // record the doc column for update
    const docNo = links[rowIndex][0];

    // store the file path that has been selected
    const filePath = await window.electronAPI.selectFile();

    // check if file has been selected
    if (filePath === "") {
      myToaster.show({
        message: "No file has been selected",
        intent: Intent.NONE
      })
    } else {
      // update the database with the selected filepath
      try {
        fetch(`${constants.BASE_URL}/api/links?input=${paid}`, {
          method: 'POST',
          headers: {
            'Content-type' : 'application/json'
          },
          body: JSON.stringify({
            path: filePath,
            doc: docNo
          })
        });
      } catch (error) {
        console.error('Error executing query', error);
      }

      myToaster.show({
        message: "File has been saved.",
        intent: Intent.PRIMARY
      })
    }

  }

  // render body context menu for right-click options
  const renderBodyContextMenu = (event) => {
    const rowIndex = event.target.rows[0]
    // console.log(rowIndex, colIndex)
    return (
      <Menu>
        <MenuItem text="Open" onClick={() => handleOpenClick(rowIndex)}/>
        <MenuItem text="Select File" onClick={() => handleSelectClick(rowIndex)}/>
      </Menu>
    );
  };

  // column widths for each column
  const widths = {
    type: 60,
    link: 400
  }

  // Object.values returns just the values from key-value pair object
  const widthValues = Object.values(widths);
  	
	useEffect(() => {
		fetchData();  
	}, [linksColumns])
    
	return (
    <div className='page'>
      
      <Table2 
        numRows={links.length} 
        enableFocusedCell={true} 
        loadingOptions={getLoadingOptions()}
        bodyContextMenuRenderer={renderBodyContextMenu}
        columnWidths={Object.values(widthValues)}
      >
        {linksColumns}
      </Table2>
      				
    </div>
	);
};

export default Links;
