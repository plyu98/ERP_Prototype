import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  NonIdealState,
	Card,
	Spinner
} from "@blueprintjs/core";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat,
	ColumnHeaderCell,
	RenderMode
} from "@blueprintjs/table";
import '@blueprintjs/core/lib/css/blueprint.css'; // Import Blueprint.js core styles
import '@blueprintjs/table/lib/css/table.css'; // Import Blueprint.js table styles
import {useImmer} from 'use-immer';
import { OverlayToaster, Position } from "@blueprintjs/core";
import {format} from 'date-fns';
import constants from '../config';
import '../styles/inventory.scss';

const Inventory = () => {

  // stock table data
  const [inventory, setInventory] = useState([]);

	// incoming items data
	const [incoming, setIncoming] = useState([]);

  // fetch state variable
  const [isFetched, setFetched] = useState(false);

	// retrieve part id
	const params = constants.getParams(window);
  const paid = params['paid'];

  const fetchData = async() => {

		// first fetch data for inventory table
    try{
			const response = await fetch(`${constants.BASE_URL}/api/inventory?input=${paid}`, {method: 'GET'});
			const data = await response.json();

			// parsed the fetched data
			const parsedData = data.map(item => {
				const oiid = (item.OIID != null) ? item.OIID : '-';
				const smid = (item.SMID != null) ? item.SMID : '-';
				const smcode = (item.SMCODES != null) ? item.SMCODES : '-';
				const dates = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '-';
				const refno = (item.REFNO != null) ? item.REFNO : '-';
				const customer = (item.CUSTOMER != null) ? item.CUSTOMER : '-';
				const vendor = (item.VENDOR != null) ? item.VENDOR : '-';
				const unitprice = (item.UNITPRICE != null) ? Math.round(item.UNITPRICE*100)/100 : '-';
				const cod = (item.COD != null) ? item.COD : '-';
				const qty = (item.QTY != null) ? item.QTY : '-';
				const units = (item.UNITS != null) ? item.UNITS : '-';
				const potieqty = (item.POTIEQTY != null) ? item.POTIEQTY : '-';
				const shipped = (item.SHIPPED != null) ? item.SHIPPED : '-';
				const available = (item.AVAIL != null) ? item.AVAIL : '-';
				const invcheckdate = (item.INVCHECKDATE != null) ? format(new Date(item.INVCHECKDATE), 'yyyy-MM-dd') : '-';
				const badqty = (item.BADQTY != null) ? item.BADQTY : '-';
				const badcat = (item.BADCAT != null) ? item.BADCAT : '-';

				// initialize the parsed array to return
				const parsed = [oiid, smid, smcode, dates, refno, customer, vendor, unitprice, cod, qty, units, potieqty, shipped, available, invcheckdate, badqty, badcat];

				// initialize on-pack and warehouse qty variables
				var warehouseQty = 0
				var onPackQty = 0

				// get on-pack qty
				fetch(`${constants.BASE_URL}/api/inventory/standby?input=${oiid}`, {method: 'GET'})
				.then(response => {
					if (!response.ok) {
						throw new Error('Standby qty fetch response was not ok!');
					}
					return response.json();
				})
				.then(data=> {
					onPackQty += data[0].SHIPQTY;

					// now get non-tied qty
					fetch(`${constants.BASE_URL}/api/inventory/nontied?input=${oiid}`, {method: 'GET'})
					.then(response => {
						if (!response.ok) {
							throw new Error('Non-tied qty fetch response was not ok!');
						}
						return response.json();
					})
					.then(data => {
						onPackQty += data[0].TIEAVAIL;
						warehouseQty = onPackQty + available;
						parsed.push(warehouseQty, onPackQty);

						// mark fetching as complete
						// setFetched(true);
					})
					.catch(error => {
						console.error('Non-tied qty fetch error', error);
					})
				})
				.catch(error => {
					console.error('On-pack qty fetch error', error);
				})
				return parsed
				
			})
			setInventory(parsedData);

    } catch (error) {
      console.error("Error fetching inventory table data ", error);
    }

		// then fetch data for incoming items table
		try {
			const response = await fetch(`${constants.BASE_URL}/api/inventory/incoming?input=${paid}`, {method: 'GET'});
			const data = await response.json();

			// parsed the fetching incoming items data
			const parsedData = data.map(item => {
				const oiid = (item.OIID != null) ? item.OIID : '-';
				const seq = (item.SEQ != null) ? item.SEQ : '-';
				const vendor = (item.VENDOR != null) ? item.VENDOR : '-';
				const ponum = (item.PONUM != null) ? item.PONUM : '-';
				const qty = (item.QTY != null) ? item.QTY : '-';
				const pending = (item.PENDING != null) ? item.PENDING : '-';
				const ui = (item.UNITS != null) ? item.UNITS : '-';
				const unitprice = (item.UNITPRICE != null) ? Math.round((item.UNITPRICE+Number.EPSILON)*100)/100 : '-';
				const amount = (item.AMOUNT != null) ? Math.round(item.AMOUNT*100)/100 : '-';
				const cdel = (item.DELIVERY != null) ? item.DELIVERY : '-';
				const vdel = (item.VDEL != null) ? item.VDEL : '-';
				const tieavail = (item.TIEAVAIL != null) ? item.TIEAVAIL : '-';

				return [oiid, seq, vendor, ponum, qty, pending, ui, unitprice, amount, cdel, vdel, tieavail]
			})
			setIncoming(parsedData);

			// mark fetching as complete
			setFetched(true);
		} catch (error) {
			console.error('Error fetching incoming items data', error);
		}
  }
  
  // for inventory table cell
  const inventoryCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {inventory[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  }

  // column list for inventory table
  const inventoryNames = ["#","Rec.ID","Code","Date","VPO #","Customer","Vendor","Cost","Code","Qty","UI","PO Tied","RMA","Available","Check Date","Rejected","Type", "Warehouse", "Standby"];

	// assign column widths for the inventory table
	// can't use 'code' as key
	const inventoryWidths = {
		refno: 80,
		recid: 80,
		code: 60,
		date: 90,
		vpo: 100,
		customer: 200,
		vendor: 200,
		cost: 50,
		codee: 60,
		qty: 60,
		ui: 60,
		potied: 80,
		rma: 100,
		avail: 100,
		checkdate: 100,
		rejected: 80,
		type: 60,
		warehouse: 100,
		standby: 100
	}
	const inventoryWidthValues = Object.values(inventoryWidths);

	// assign column widths for the incoming table
	const incomingWidths = {
		refno: 80,
		seq: 50,
		vendor: 230,
		po: 150,
		qty: 50,
		pending: 80,
		ui: 50,
		price: 100,
		amount: 80,
		cd: 50,
		vd: 50,
		excess: 80 
	};
	const incomingWidthValues = Object.values(incomingWidths)

	// column header cell renderer
	const renderInventoryColumnHeader = (index) => {
		return <ColumnHeaderCell name={inventoryNames[index]} index={index} nameRenderer={constants.renderName} />
	}

  // build actual inventory tabel columns
  const inventoryColumns = inventoryNames.map((index) => {
    return <Column key={index} columnHeaderCellRenderer={renderInventoryColumnHeader} cellRenderer={inventoryCellRenderer}/>
  })

	// for incoming items table
  const incomingCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {incoming[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  }

  // incoming items table column names
  const incomingNames = ["#","Seq","Vendor","PO #","Qty","Pending","UI","Price","Amount","C.D","V.D","Excess"];

	// column header cell renderer
	const renderIncomingColumnHeader = (index) => {
		return <ColumnHeaderCell name={incomingNames[index]} index={index} nameRenderer={constants.renderName} />
	}

  // incoming table columns
  const incomingColumns = incomingNames.map((index) => {
    return <Column key={index} columnHeaderCellRenderer={renderIncomingColumnHeader} cellRenderer={incomingCellRenderer}/>
  })
	
	useEffect(() => {
		fetchData();  
	}, [])

	const renderCurrentStock = () => {
		var content;
		if (isFetched) {
			if (inventory.length > 0) {
				content = (
					<Table2 
						numRows={inventory.length} 
						enableFocusedCell={true} 
						columnWidths={inventoryWidthValues}
						renderMode={RenderMode.BATCH}
						className='current-stock-table'
					>
						{inventoryColumns}
					</Table2>
				)
			} else {
				content = (
					<NonIdealState
						icon="search"
						description={"No current stock found!"}
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

	const renderIncomingStock = () => {
		var content;
		if (isFetched) {
			if (incoming.length > 0) {
				content = (
					<Table2 
						numRows={incoming.length} 
						enableFocusedCell={true} 
						columnWidths={incomingWidthValues}
						renderMode={RenderMode.BATCH}
						className='incoming-stock-table'
					>
						{incomingColumns}
					</Table2>
				)
			} else {
				content = (
					<NonIdealState
						icon="search"
						description={"No incoming stock found!"}
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
			<Card>
				<h2>Stocks: Received & RMA</h2>
				{renderCurrentStock()}
			</Card>
			<Card>
				<h2>Incoming: Currently Orderd to Vendor & Yet Received</h2>
				{renderIncomingStock()}
			</Card>
		</div>
	);
};

export default Inventory;
