import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HotkeysProvider, 
  NonIdealState,
  Spinner,
  Card
} from "@blueprintjs/core";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat,
  RenderMode,
  ColumnHeaderCell
} from "@blueprintjs/table";
import '@blueprintjs/core/lib/css/blueprint.css'; // Import Blueprint.js core styles
import '@blueprintjs/table/lib/css/table.css'; // Import Blueprint.js table styles
import '../styles/partinfo.scss'
import {useImmer} from 'use-immer';
import { OverlayToaster, Position } from "@blueprintjs/core";
import {format} from 'date-fns';

import constants from '../config';

const VpoHist = () => {

  // vpo history data variable; initialized with empty array because there will be multiple vpo history entries
  const [vpoHistory, setVpoHistory] = useState([]);

  // fetch data variabel
  const [isFetched, setFetched] = useState(false);

  // get part id
  const params = constants.getParams(window);
  const paid = params['paid'];

  const fetchData = async() => {
    try{
			const response = await fetch(`${constants.BASE_URL}/api/vpohist?input=${paid}`, {method: 'GET'});
			const data = await response.json();

			// parsed the fetched data
			const parsedHistory = data.map(item => {
				const qty = (item.QTY != null) ? item.QTY : '-';
				const units = (item.UNITS != null) ? item.UNITS : '-';
				const unitPrice = (item.UNITPRICE != null) ? Math.round(item.UNITPRICE*100)/100 : '-';
				const amount = (item.AMOUNT != null) ? Math.round(item.AMOUNT*100)/100 : '-';
				const vendor = (item.VENDOR != null) ? item.VENDOR : '-';
				const vdel = (item.VDEL != null) ? item.VDEL : '-';
				const ponum = (item.PONUM != null) ? item.PONUM : '-';
				const dates = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '-';

				return [ponum, dates, vendor, qty, units, unitPrice, amount, vdel];
				
			})
			setVpoHistory(parsedHistory);

      // marked fetched as complete
      setFetched(true);

    } catch (error) {
      console.error("Error fetching data ", error);
    }
  }
  
  // for VPO History Dialog
  const vpoCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {vpoHistory[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  }

  // column list for vpo history
  const vpoNames = ["VPO No.", "Date" , "Vendor", "Qty", "UI", "Unit Price", "Amount", "V.Del"];

  // column header cell render
  const renderColumnHeader = (index) => {
    return <ColumnHeaderCell name={vpoNames[index]} index={index} nameRenderer={constants.renderName} />
  }

  // build actual vpo history columns
  const vpoColumns = vpoNames.map((index) => {
    return <Column key={index} columnHeaderCellRenderer={renderColumnHeader} cellRenderer={vpoCellRenderer}/>
  })

  // assign column widths
  const widths = {
    vpono: 150,
    date: 90,
    vendor: 200,
    qty: 50,
    ui: 40,
    unitprice: 90,
    amount: 80,
    vdel: 60
  }
  const widthValues = Object.values(widths);
	
	useEffect(() => {
		fetchData();  
	}, [])

  const renderVpoHist = () => {
    var content;
    if (isFetched && vpoHistory.length > 0) {
      content = (
        <Table2 
          numRows={vpoHistory.length} 
          enableFocusedCell={true} 
          columnWidths={widthValues}
          renderMode={RenderMode.BATCH}
        >
          {vpoColumns}
        </Table2>
      )
    } else if (isFetched && vpoHistory.length < 1) {
      content = (
        <NonIdealState
          icon="search"
          description={"No VPO history record found!"}
        />
      )
    } else {
      content = (
        <Spinner />
      )
    }
    return content;
  }


    
	return (
    <div className='page'>
      <Card>
        {renderVpoHist()}
      </Card>
    </div>
	);
};

export default VpoHist;
