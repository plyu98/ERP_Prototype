import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CompoundTag,
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
import {useImmer} from 'use-immer';
import { OverlayToaster, Position } from "@blueprintjs/core";
import {format} from 'date-fns';

import constants from '../config';
import '../styles/quothist.scss'

const QuotHist = () => {

  // quotation history data variable
  const [quotHistory, setQuotHistory] = useState([]);

  // fetch data state variable
  const [isFetched, setFetched] = useState(false);

  // retrieve part id from the url
  const params = constants.getParams(window);
  const paid = params['paid'];

  const fetchData = async() => {
    try {
      const response = await fetch(`${constants.BASE_URL}/api/partinfo/quothist?paid=${paid}`, {method: 'GET'});
      // const response = await fetch(`${constants.BASE_URL}/api/quothist?input=${paid}`, {method: 'GET'});
      // if (!response.ok) {
      //   throw new Error('Quotation history fetch request error.');
      // }
      const data = await response.json();

      // parse the quotation history data
      const parsedData = data.map(item => {
        const partno = (item.PARTNO != null) ? item.PARTNO : '';
        const dateReceived = (item.
          DTRECIEVE != null) ? format(new Date(item.DTRECIEVE), 'yyyy-MM-dd') : '';
        const vendor = (item.VENDOR != null) ? item.VENDOR : '';
        const vendorPartNo = (item.VITEMNO != null) ? item.VITEMNO : '';
        const mfr = (item.MFG != null) ? item.MFG : '';
        const del = (item.VDEL != null) ? item.VDEL : '';
        const qty = (item.NEEDED != null) ? item.NEEDED : ''
        const moq = (item.QTY != null) ? item.QTY : '';
        const units = (item.UNITS != null) ? item.UNITS : '';
        const price = (item.PRICE != null) ? Math.round(item.PRICE*100)/100 : '';
        const markupPrice = (item.MPRICE != null) ? Math.round(item.MPRICE*100)/100 : '';
        const customer = (item.CUSTOMER != null) ? item.CUSTOMER : '';
        const cat = (item.QUOTECAT != null) ? item.QUOTECAT : '';
        const note = (item.SHORTNOTE != null) ? item.SHORTNOTE: '';

        // concatenate the proj name with rq id
        const tempProjName = (item.PRJNAME != null) ? item.PRJNAME : '';
        const rqid = (item.RQID != null) ? item.RQID : '';
        const ordered = (item.ORDERED != null) ? item.ORDERED : '';
        const projName = tempProjName + ' [' + rqid + ']';

        // worker's name
        const rep = (item.RECIEVEBY != null) ? constants.idToWorker[item.RECIEVEBY] : 'N/A';
        // const rep = (item.FULLNAMES != null) ? item.FULLNAMES : '';

        // parse the quote category
        var category = '';
        if (cat === '0' || cat === '4') {
          category = 'M'
        } else if (cat === '1' || cat === '5') {
          category = 'R';
        } else if (cat === '2') {
          category = 'B';
        } else if (cat === '3') {
          category = 'F';
        }

        // var cpo = '';
        // var vpo = '';
        // if (ordered == 'Y') {
        //   cpo = (item.ORDERNO != null) ? item.ORDERNO + '[' + item.CPID + ']' : '';
        //   vpo = (item.PONUM != null) ? item.PONUM + '[' + item.VPID + ']' : '';
        // }

        const cpo = (item.ORDERNO != null) ? item.ORDERNO + '[' + item.CPID + ']' : '';
        const vpo = (item.PONUM != null) ? item.PONUM + '[' + item.VPID + ']' : '';
        
        return [partno, dateReceived, vendor, vendorPartNo, mfr, del, qty, moq, units, price, ordered, markupPrice, customer, category, projName, rep, cpo, vpo, note]


        // // intialize the parsed data array to return
        // const parsed = [partno, dateReceived, vendor, vendorPartNo, mfr, del, qty, moq, units, price, ordered, minPrice, customer, category, projName, rep];

        // // initialize cpo and vpo info variables for quot history
        // var cpo = '';
        // var vpo = '';

        // // get cpo & vpo no. if quot was ordered
        // if (ordered === 'Y'){

        //   // first fetch cpo no.
        //   fetch(`${constants.BASE_URL}/api/partinfo/cpo?input1=${paid}&input2=${rqid}`, {method: 'GET'})
        //   .then(response => {
        //     if (!response.ok) {
        //       throw new Error('CPO fetch response was not ok!');
        //     }
        //     return response.json();
        //   })
        //   .then(data => {
        //     const result = data[0];
        //     cpo = ((result.ORDERNO != null) ? result.ORDERNO : '')  + ' [' + result.CPID + ']';
        //     parsed.push(cpo);

        //       // now fetch vpo no.
        //     fetch(`${constants.BASE_URL}/api/partinfo/vpo?input1=${paid}&input2=${rqid}`, {method: 'GET'})
        //     .then(response => {
        //       if (!response.ok) {
        //         throw new Error('VPO fetch response was not ok!');
        //       }
        //       return response.json();
        //     })
        //     .then(data => {
        //       const result = data[0];
        //       vpo = ((result.PONUM != null) ? result.PONUM : '') + ' [' + result.VPID + ']';
        //       parsed.push(vpo, note)

        //       // set fetch state as complete
        //       setFetched(true);
        //     })
        //     .catch(error => {
        //       console.error('Error: ', error);
        //     });
        //   })
        //   .catch(error => {
        //     console.error('Error: ', error);
        //   });

        // } else {
        //   parsed.push(cpo, vpo, note);
        // }
        // return parsed;
      })

      // assign the completely parsed data to quot history state variable
      setQuotHistory(parsedData);
      setFetched(true);

    } catch (error) {
        console.error('Error fetching data ', error);
      }
    }
  
  // for Quotation History Dialog
  const quotCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {quotHistory[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  }
  // columns list for quotation history
  const quotNames = [
    "P/N", 
    "Date", 
    "Vendor", 
    "Vendor P/N", 
    "MFR", 
    "DEL", 
    "Qty", 
    "MOQ", 
    "UI", 
    "Price", 
    "Ordered", 
    "Markup Price", 
    "Customer", 
    "CAT", 
    "Project", 
    "Rep", 
    "CPO #", 
    "VPO #", 
    "Notes"
  ]

  // assign column widths
  const widths = {
    pn: 100,
    date: 100,
    vendor: 200,
    vendorPn: 100,
    mfr: 100,
    del: 50,
    qty: 70,
    moq: 60,
    ui: 40,
    price: 80,
    ordered: 80,
    minPrice: 120,
    customer: 160,
    cat: 50,
    cat: 50,
    project: 220,
    rep: 100,
    custpo: 170,
    vpo: 200,
    notes: 100
  }
  const widthValues = Object.values(widths);
  
  // column header cell render
  const renderColumnHeader = (index) => {
    return (
      <ColumnHeaderCell 
        name={quotNames[index]} 
        index={index} 
        nameRenderer={constants.renderName} 
      />
    )
  }

 // actual quotation history columns
 const quotColumns = quotNames.map((index) => {
	 return (
    <Column 
      columnHeaderCellRenderer={renderColumnHeader} 
      cellRenderer={quotCellRenderer}
      key={index}
    />
   )
 })
	
	useEffect(() => {
		fetchData();  
	}, [])

  // tag names for category
  const categoryNames = [
    "M",
    "R",
    "B",
    "F"
  ]

  // tag description for category
  const categoryDescr = [
    "Mass Production",
    "R&D",
    "Budgetary",
    "Feasibility"
  ]

  // category tags
  const categoryTags = categoryNames.map((item, index) => {
    return (
      <CompoundTag
        leftContent={item}
        children={categoryDescr[index]}
        key={index}
        round={true}
        large={true}
        intent="primary"
      />
    )
  })

  const renderQuotHist = () => {
    var content;
    if (isFetched) {
      if (quotHistory.length > 0) {
        content = (
          <Table2 
            numRows={quotHistory.length} 
            enableFocusedCell={true} 
            columnWidths={widthValues}
            renderMode={RenderMode.BATCH}
            className='quot-hist-table'
          >
            {quotColumns}
          </Table2>
        )
      } else {
        content = (
          <NonIdealState
            icon="search"
            description={"No quotation history record found!"}
          />
        )
      }
    } else {
      content = (
        <Spinner />
      )
    }
    return content;
  }
    
	return (
    <div className='page'>
      <Card className='category-card'>
        <div>
          <h2>Category Description</h2>
          {categoryTags}
        </div>
      </Card>  
      <Card>
        {renderQuotHist()}
      </Card>
    </div>
	);
};

export default QuotHist;
