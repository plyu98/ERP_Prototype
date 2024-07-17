import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback
} from "react";

import classNames from "classnames";
import '@blueprintjs/core/lib/css/blueprint.css'
import '../styles/home.scss'
import '@blueprintjs/table/lib/css/table.css';
import '@blueprintjs/select/lib/css/blueprint-select.css'
import {
    Alignment,
    Button,
    Classes,
    Navbar,
    NavbarGroup,
		InputGroup,
		Popover,
		Menu,
		MenuItem,
		Divider,
		FormGroup,
		MenuDivider,
		Card,
		CardList,
		SegmentedControl,
		Section,
		SectionCard,
		Tabs,
		Tab,
		useHotkeys,
		Icon,
		IconSize,
		Dialog,
		DialogBody,
		DialogFooter,
		Elevation,
		Checkbox,
		DialogStep,
		MultistepDialog,
		RadioGroup,
		Radio,
		TextArea,
		OverlayToaster,
		Intent,
		HTMLSelect,
		Spinner,
		NumericInput,
		TabsExpander,
		CompoundTag,
		TagInput
} from "@blueprintjs/core";
import constants from '../config';
import {useImmer} from 'use-immer';
import {format} from 'date-fns';
import { enableMapSet } from "immer";
import {
  DateInput3,
	DateRangeInput3
} from "@blueprintjs/datetime2";
import {
  ItemPredicate,
  ItemRenderer,
  Suggest
} from "@blueprintjs/select";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat,
  ColumnHeaderCell,
  RenderMode,
} from "@blueprintjs/table";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

enableMapSet();

const Home = () => {

	// properties for the date picker in ECCN edit form
	const {...spreadProps} = {
		highlightToday: true,
		showActionsBar: true,
		shortcuts: false,
	}

	// properties for the date picker in edit details dialog
	const formatDate = useCallback((date) =>  date.toLocaleDateString(), []);
	const parseDate = useCallback((str) => {
    if (str == 'N/A') {
      return null;
    } else {
      return new Date(str);
    }
  }, []);

	// maximum date for date picker
	const newMaxDate = new Date(2030, 12, 31);

	// customer daypicker props
	const dayProps = {
		showOutsideDays: true
	};

	// column names for each search table
	const partColumns = [
		{
			label: "Part No.",
			value: "partno"
		},
		{
			label: "NSN",
			value: "nsn"
		},
		{
			label: "Description",
			value: "descr"
		},
		{
			label: "Notes",
			value: "notes"
		},
		{
			label: "Vendor Part No.",
			value: "vendorpartno"
		}
	]

	const custColumns = [
		{
			label: "Customer",
			value: "customer"
		},
		{
			label: "Acct No.",
			value: "account"
		},
		{
			label: "Contact",
			value: "contact"
		},
		{
			label: "Tel",
			value: "tel"
		},
		{
			label: "Fax",
			value: "fax"
		}
	]

	const vendColumns = [
		{
			label: "Vendor",
			value: "vendor"
		},
		{
			label: "Acct No.",
			value: "account"
		},
		{
			label: "Contact",
			value: "contact"
		},
		{
			label: "Tel",
			value: "tel"
		},
		{
			label: "Fax",
			value: "fax"
		}
	]

	const crfqColumns = [
		{
			label: "Customer",
			value: "customer"
		},
		{
			label: "Project",
			value: "project"
		},
		{
			label: "Buyer",
			value: "buyer"
		},
		{
			label: "Program",
			value: "program"
		}
	]

	const cpoColumns = [
		{
			label: "Customer",
			value: "customer"
		},
		{
			label: "Project Name",
			value: "project"
		},
		{
			label: "Buyer",
			value: "buyer"
		},
		{
			label: "Order No.",
			value: "order"
		}
	]

	const vpoColumns = [
		{
			label: "Vendor",
			value: "vendor"
		},
		{
			label: "PO No.",
			value: "ponum"
		},
		{
			label: "Buyer",
			value: "buyer"
		}
	]

	/**
	 * searchOpen: search bar popover open state
	 * searchValue: search key value
	 * searchResults: search results
	 * menuOpen: search table menuoption popover's open state
	 * searchTable: search table
	 * searchColumns: search column options
	 * searchColumn: search column (default is partno from parts table)
	 */
	const [states, setStates] = useImmer({
		searchOpen: false,
		searchValue: '',
		searchResults: [],
		custList: [],
		searchFetched: false,
		dailyReceive: {
			data: [],
			range: [new Date(), new Date()] 
		},
		searchTable: 'Parts',
		searchColumns: partColumns,
		searchColumn: 'partno',
		selectedTab: 'receive',
		selectedAddMenu: 'Part',
		partnoInput: '',
		selectedBuyers: new Set(),
		isOpen: {
			searchMenu: false,
			searchDialog: false,
			addDialog: false,
			addMenu: false
		},
		form: {
			selectOption: '',
			part: {
				partno: '',
				hscode: '',
				nsn: '',
				descr: '',
				rev: '',
				notes: '',
				internal: '',
				trouble: ''
			},
			customer: {
				title: '',
				billaddr1: '',
				billaddr2: '',
				billcity: '',
				billzip: '',
				billtel: '', 
				billfax: '',
				billcontact: '',
				billemail: '',
				shipaddr1: '',
				shipaddr2: '',
				shipcity: '',
				shipzip: '',
				shiptel: '',
				shipfax: '',
				shipcontact: '',
				shipemail: '',
				shipvia: '',
				fob: '',
				accountno: '',
				broker: '',
				payterm: ''
			},
			vendor: {
				title: '',
				addr1: '',
				addr2: '',
				city: '',
				zip: '',
				tel: '', 
				fax: '',
				contact: '',
				email: '',
				billaddr1: '',
				billaddr2: '',
				billcity: '',
				billzip: '',
				billtel: '',
				billfax: '',
				billcontact: '',
				billemail: '',
				accountno: '',
				payterm: '',
				status: ''
			},
			crfq: {
				customer: '',
				prjname: '',
				prgname: '',
				receivedate: '',
				duedate: '',
				category: '',
				receiveby: '',
				analyzeby: '',
				validity: 0,
				term: '',
				fob: '',
				warranty: 0,
				minpo: 0,
				origquote: '',
				ligcontact: '',
				mergeExcel: ''
			}
		}
	})

	const searchMenuRef = useRef(null);

	// retrieve the base id of the home page
	const baseUrl = window.location.href.split('#')[0];

	// fetch search query
	const fetchData = async() => {
		try {
			const searchQuery = encodeURIComponent(states.searchValue);
			const searchColumn = encodeURIComponent(states.searchColumn);
			const searchTable = encodeURIComponent(states.searchTable);
			const url = `${constants.BASE_URL}/api/search?input=${searchQuery}&column=${searchColumn}&table=${searchTable}`;
			const response = await fetch(url);
			const data = await response.json();

			// parse the fetched data
			const parsedData = data.map(item => {

				// initialize the data array to return
				const parsed = [];

				// parse columns according to the tables
				if (searchTable === 'Parts') {
					const partno = (item.PARTNO != null) ? item.PARTNO : '';
					const paid = (item.PAID != null) ? item.PAID : '';
					const discontinued = (item.DISCONTINUED != null) ? item.DISCONTINUED : '';
					const description = (item.DESCRIPTION != null) ? item.DESCRIPTION : '';
					const nsn = (item.INT_PID != null) ? item.INT_PID : '';
					parsed.push(paid, partno, description, discontinued, nsn);
				} 
				else if (searchTable === 'Customer') {
					const cuid = (item.CUID != null) ? item.CUID : '';
					const cust = (item.TITLE != null) ? item.TITLE : '';
					parsed.push(cuid, cust);
				} 
				else if (searchTable === 'Vendor') {
					const vdid = (item.VDID != null) ? item.VDID : '';
					const vendor = (item.NAME != null) ? item.NAME : '';
					parsed.push(vdid, vendor);
				} 
				else if (searchTable === 'CRFQ') {
					const rqid = (item.RQID != null) ? item.RQID : '';
					const prjname = (item.PRJNAME != null) ? item.PRJNAME : '';
					const customer = (item.CUSTOMER != null) ? item.CUSTOMER : '';
					const receivedate = (item.DTRECIEVE != null) ? format(new Date(item.DTRECIEVE), 'yyyy-MM-dd') : '';
					const duedate = (item.DUEDATE != null) ? format(new Date(item.DUEDATE), 'yyyy-MM-dd') : '';
					const buyer = (item.USERID != null) ? item.USERID : '';
					const program = (item.SAUPNAME != null) ? item.SAUPNAME : '';
					parsed.push(customer, prjname, receivedate, duedate, buyer, program, rqid);
				} 
				else if (searchTable === 'CPO') {
					const customer = (item.CUSTOMER != null) ? item.CUSTOMER : '';
					const orderno = (item.ORDERNO != null) ? item.ORDERNO : '';
					const prjname = (item.PRJNAME != null) ? item.PRJNAME : '';
					const orderdate = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
					const duedate = (item.DUEDATE != null) ? format(new Date(item.DUEDATE), 'yyyy-MM-dd') : '';
					const buyer = (item.REPID != null) ? item.REPID : '';
					const status = (item.STATUS != null) ? constants.status[item.STATUS] : '';
					const itemcnt = (item.ITEMCNT != null) ? item.ITEMCNT : '';
					const sales = (item.TOTALAMT != null) ? Math.round(item.TOTALAMT*100)/100 : '';
					const cpid = (item.CPID != null) ? item.CPID : '';

					parsed.push(customer, orderno, prjname, orderdate, duedate, buyer, status, itemcnt, sales, cpid);
				}
				else if (searchTable === 'VPO') {
					const vendor = (item.VENDOR != null) ? item.VENDOR : '';
					const ponum = (item.PONUM != null) ? item.PONUM : '';
					const date = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
					const buyer = (item.CONTACT != null) ? item.CONTACT : '';
					const totalamt = (item.TOTALAMT != null) ? Math.round(item.TOTALAMT*100)/100 : '';
					const rev = (item.REV != null) ? item.REV : '';
					const housepo = (item.HOUSEPO != null) ? item.HOUSEPO : '';
					const prepaid = (item.PREPAIDID != null) ? item.PREPAIDID : '';
					const vpid = (item.VPID != null) ? item.VPID : '';

					parsed.push(vendor, ponum, date, buyer, totalamt, rev, housepo, prepaid, vpid);
 				}
				
				return parsed;
			})
			setStates(state => {
				state.searchResults = parsedData;
				state.filteredResults = parsedData;
				state.searchFetched = true;
			});
		} catch (error) {
			console.error("error fetching data", error);
		}
 	}; 

	// fetch daily receving data
	const fetchReceive = async() => {
		try {

			// retrieve the start and end dates for daily receiving range
			const [date1, date2] = states.dailyReceive.range;
			const startDate = format(new Date(date1), 'yyyy-MM-dd');
			const endDate = format(new Date(date2), 'yyyy-MM-dd');

			const url = `${constants.BASE_URL}/api/receive/report?start=${startDate}&end=${endDate}`;
			const response = await fetch(url);
			const data = await response.json();
			
			// parse the fetched data
			const parsed = data.map(item => {
				const buyer = (item.CONTACT != null) ? item.CONTACT : '';
				const date = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
				const shipid = (item.SMID != null) ? item.SMID : '';
				const vpo = (item.PONUM != null) ? item.PONUM : '';
				const seq = (item.SEQ != null) ? item.SEQ : '';
				const partno = (item.PARTNO != null) ? item.PARTNO : '';
				const vpn = (item.VITEMNO != null) ? item.VITEMNO : '';
				const vendor = (item.VENDOR != null) ? item.VENDOR : '';
				const loc = (item.REMARK != null) ? item.REMARK : '';
				const unitprice = (item.UNITPRICE != null) ? Math.round(item.UNITPRICE*100)/100 : '';
				const qty = (item.QTY != null) ? item.QTY : '';
				const unit = (item.UNITS != null) ? item.UNITS : '';
				const amount = (item.AMOUNT != null) ? Math.round(item.AMOUNT*100)/100 : '';
				const shipnote = (item.SHIPNOTE != null) ? item.SHIPNOTE : '';

				const vdate = (item.VDATES != null) ? new Date(item.VDATES) : '';
				const vdel = (item.VDEL != null) ? item.VDEL : '';
				const reqdate = format(new Date(vdate + vdel), 'yyyy-MM-dd');

				return [buyer, date, shipid, vpo, seq, partno, vpn, vendor, loc, reqdate, unitprice, qty, unit, amount, shipnote];
			}) 
			setStates((state) => {
				state.dailyReceive.data = parsed;
			})
		} catch (error) {
			console.error("Error fetching daily receiving data", error);
		} 
	}

	// fetch customer list
	const fetchCustomerList = async() => {
		// fetch customer list
    try {
      const response = await fetch(`${constants.BASE_URL}/api/home/custlist`, {method: 'GET'});
      const data = await response.json();
      const parsed = data.map((item, index) => {
        const customer = (item.TITLE != null) ? item.TITLE : '';
        return {title: customer, index: index};
      })
      setStates((state) => {
        state.custList = parsed; 
      })
    } catch (error) {
      console.error("Error fetching customer list", error);
    }
	}

	// fetch data whenever input changes
	useEffect(() => {
		fetchData();
		// fetchReceive();
	}, [states.searchValue, states.searchTable]);

	// fetch receiving data when selected tab is changed
	useEffect(() => {
		fetchReceive();
	}, [states.dailyReceive.range])

	// fetch customer list once when home page is mounted
	useEffect(() => {
		fetchCustomerList();
		// console.log('customer list fetched')
	}, [])

	const handleSearchOpen = () => {
		setStates(state => {
			state.searchOpen = !state.searchOpen;
		});
	}

	// const handlePartClick = () => {
	// 	const url = window.location.origin+"/part";
	// 	const title = 'Part Search';
	// 	window.electronAPI.openWindow([url, title]);
	// };

	// const handleCustomerClick = () => {
	// 	const url = window.location.origin+"/customer";
	// 	const title = 'Customer Search';
	// 	window.electronAPI.openWindow([url, title]);
		
	// };

	// const handleVendorClick = () => {
	// 	const url = window.location.origin+"/vendor";
	// 	const title = 'Vendor Search';
	// 	window.electronAPI.openWindow([url, title]);
	// };

	const handleSearchValueChange = (e) => {
		setStates(state => {
			state.searchValue = e;
		});
	}

	// handle search when result (card) is double-clicked
	const handleResultClick = (index) => {

		var url;
		var title;

		// retrieve search id
		const id = states.searchResults[index][0];
		
		// determine url and title based on the chosen search table
		// Updated on 2/19/24: added hash since I switched from browserrouter to hashrouter
		if (states.searchTable === 'Parts') {
			url = baseUrl+`#/partinfo?paid=${id}`;
			title = 'Part Info';
		} else if (states.searchTable === 'Customer') {
			url = baseUrl+`#/custinfo?cuid=${id}`;
			title = 'Customer Info';
		} else if (states.searchTable === 'Vendor') {
			url = baseUrl+`#/vendinfo?vdid=${id}`;
			title = 'Vendor Info';
		} 
		window.electronAPI.openWindow([url, title]);
	}

	
	// card lists from part, customer, and vendor search results
	const renderCardResults = () => {
		const cards = states.searchResults.map((result, index) => {
			if (states.searchTable !== 'Parts') {
				return (
					<Card key={index} interactive={true} onClick={() => handleResultClick(index)}>
						<span>
							<b>{result[1]}</b>
						</span>
						{/* <Icon icon="double-chevron-right" className="chevron-icon" /> */}
					</Card>
				)
			} else {
				return (
					<Card key={index} interactive={true} onClick={() => handleResultClick(index)}>
						{(result[3] === 'Y') ? <Icon icon="disable" className="unavailable-icon"/> : <Icon icon="circle" className="available-icon"/>}
						<CompoundTag
							leftContent="P/N"
							children={result[1]}
							large={true}
							round={true}
						/>
						<Divider />
						<CompoundTag
							leftContent="NSN"
							children={result[4]}
							large={true}
							round={true}
						/>
						<Divider />
						<CompoundTag
							leftContent="Descr"
							children={result[2]}
							large={true}
							round={true}
						/>
						{/* <Icon icon="double-chevron-right" className="chevron-icon" /> */}
					</Card>
				)
			}
		});
		return (
			<CardList
				bordered={true}
				compact={true}
				className='search-cards-list'
			>
				{cards}
			</CardList>
		)
	}

	// menu renderer for daily receiving table's buyer column
	const receiveMenuRenderer = (index) => {

		// buyer column is at index 4 for CRFQ; 5 for CPO
		var colIndex = 0;
		

		// buyers are from either search results or daily receiving results
		const buyers = states.dailyReceive.data.map(function(value, index) { return value[colIndex]; });
		const unique = [...new Set(buyers)];

		const filterBuyer = (event, index) => {
			const checked = event.target.checked;
			const buyer = unique[index]
			if (checked == true) {
				setStates((state) => {
					state.selectedBuyers.add(buyer)
				})
			}
			else {
				setStates((state) => {
					state.selectedBuyers.delete(buyer)
				})
			}
		}

		const subMenuItems = unique.map((item, index) => {
			return (
				<Checkbox
					onChange={(event) => filterBuyer(event, index)}
					key={index}
					label={item}
					checked={states.selectedBuyers.has(item)}
				/>
			)
		})

		return (
			<Menu>
				<MenuItem 
					icon="filter" 
					text="Filter" 
					children={subMenuItems} 
				/>
			</Menu>
		)
	}
 
	// menu renderer for search table's buyer column=
	const menuRenderer = (index) => {

		// buyer column is at index 4 for CRFQ; 5 for CPO
		var colIndex = 4;
		if (states.searchTable == 'CPO') {
			colIndex = 5;
		} else if (states.searchTable == 'VPO') {
			colIndex = 3;
		}

		// buyers are from either search results or daily receiving results
		const buyers = states.searchResults.map(function(value, index) { return value[colIndex]; });
		const unique = [...new Set(buyers)];

		const filterBuyer = (event, index) => {
			const checked = event.target.checked;
			const buyer = unique[index]
			if (checked == true) {
				setStates((state) => {
					state.selectedBuyers.add(buyer)
				})
			}
			else {
				setStates((state) => {
					state.selectedBuyers.delete(buyer)
				})
			}
		}

		const subMenuItems = unique.map((item, index) => {
			return (
				<Checkbox
					onChange={(event) => filterBuyer(event, index)}
					key={index}
					label={item}
					checked={states.selectedBuyers.has(item)}
				/>
			)
		})

		return (
			<Menu>
				<MenuItem 
					icon="filter" 
					text="Filter" 
					children={subMenuItems} 
				/>
			</Menu>
		)
	}

	// handle double-click on cells in the table search results
	const handleDoubleClick = (rowIndex, columnIndex) => {
		// id is at the last column
		const lastColIndex = states.searchResults[0].length-1
		const id = states.searchResults[rowIndex][lastColIndex];
		const url = baseUrl+`#/crfqinfo?rqid=${id}`;
		const title = 'CRFQ Info';
		window.electronAPI.openWindow([url, title]);
	}

	// table from crfq, cpo, vpo search results
	const tableResults = () => {

		// column width values for the table
		var widthValues;
		
		// deep copy
		var filteredResults = structuredClone(states.searchResults);

		// column names for crfq search result table
		const crfqNames = ["Customer", "Project Name", "Receive Date", "Due Date", "Buyer", "Program Name"];

		// column width values for CRFQ Search result table
		const crfqWidths = {
			customer: 170,
			prjname: 200,
			receivedate: 130,
			duedate: 100,
			buyer: 80,
			program: 200
		}
		const crfqWidthValues = Object.values(crfqWidths)

		// crfq search result table cell renderer
		const crfqCellRenderer = (rowIndex, columnIndex) => {
			
			try {
				if (states.selectedBuyers.size > 0) {
					filteredResults = states.searchResults.filter((row) => states.selectedBuyers.has(row[4]));
					
				}
				return (
					<Cell interactive={true}>
						<div onDoubleClick={() => handleDoubleClick(rowIndex, columnIndex)}>
							<TruncatedFormat detectTruncation={true}>
								{filteredResults[rowIndex][columnIndex]}
							</TruncatedFormat>
						</div>
					</Cell>
				)	
			} catch (error) {
				console.log('error rendering cells', error);
				return (
					<Cell>N/A</Cell>
				)
			} 
		}; 

		// crfq result table headers
		const renderCrfqHeader = (index) => {

			// apply menu renderer for just column index 4: buyer
			var colMenu = null;
			if (index == 4) {
				colMenu = menuRenderer(index)
			}
			return (
				<ColumnHeaderCell
					name={crfqNames[index]}
					index={index}
					nameRenderer={constants.renderName}
					menuRenderer={() => colMenu}
				/>
			)
		}

		// crfq columns
		const crfqTableColumns = crfqNames.map((index) => {
			return <Column key={index} cellRenderer={crfqCellRenderer} columnHeaderCellRenderer={renderCrfqHeader} />
		})

		// cpo column names 
		const cpoNames = ["Customer", "Order No.", "Project Name", "Order Date", "Due Date", "Buyer", "Status", "# Items", "Total Sales"];

		// cpo column width values
		const cpoWidths = {
			customer: 150,
			orderno: 150,
			project: 150,
			orderdate: 100,
			duedate: 100,
			buyer: 100,
			status: 80,
			items: 80,
			total: 150
		};
		const cpoWidthValues = Object.values(cpoWidths);

		// cpo search result table cell renderer
		const cpoCellRenderer = (rowIndex, columnIndex) => {
			
			try {
				if (states.selectedBuyers.size > 0) {
					filteredResults = states.searchResults.filter((row) => states.selectedBuyers.has(row[5]));
					
				}
				return (
					<Cell interactive={true}>
						<TruncatedFormat detectTruncation={true}>
							{filteredResults[rowIndex][columnIndex]}
						</TruncatedFormat>
					</Cell>
				)	
			} catch (error) {
				console.log('error rendering cells', error);
				return (
					<Cell>N/A</Cell>
				)
			} 
		}; 

		// cpo result table headers
		const renderCpoHeader = (index) => {

			// apply menu renderer for just column index 4: buyer
			var colMenu = null;
			if (index == 5) {
				colMenu = menuRenderer(index)
			}
			return (
				<ColumnHeaderCell
					name={cpoNames[index]}
					index={index}
					nameRenderer={constants.renderName}
					menuRenderer={() => colMenu}
				/>
			)
		}

		// cpo columns
		const cpoTableColumns = cpoNames.map((index) => {
			return <Column key={index} cellRenderer={cpoCellRenderer} columnHeaderCellRenderer={renderCpoHeader} />
		})

		// vpo column names
		const vpoNames = ["Vendor", "Po No.", "Order Date", "Buyer", "Total Amount", "Rev", "House PO", "Prepaid"];

		// vpo column width values
		const vpoWidths = {
			vendor: 150,
			ponum: 150,
			date: 100,
			buyer: 100,
			totalamt: 130,
			rev: 50,
			housepo: 100,
			prepaid: 100
		}
		const vpoWidthValues = Object.values(vpoWidths);

		// vpo search result tabel cell renderer
		const vpoCellRenderer = (rowIndex, columnIndex) => {
			
			try {
				if (states.selectedBuyers.size > 0) {
					filteredResults = states.searchResults.filter((row) => states.selectedBuyers.has(row[3]));
					
				}
				return (
					<Cell interactive={true}>
						<TruncatedFormat detectTruncation={true}>
							{filteredResults[rowIndex][columnIndex]}
						</TruncatedFormat>
					</Cell>
				)	
			} catch (error) {
				console.log('error rendering cells', error);
				return (
					<Cell>N/A</Cell>
				)
			} 
		};

		// vpo result table headers
		const renderVpoHeader = (index) => {

			// apply menu renderer for just column index 4: buyer
			var colMenu = null;
			if (index == 3) {
				colMenu = menuRenderer(index)
			}
			return (
				<ColumnHeaderCell
					name={vpoNames[index]}
					index={index}
					nameRenderer={constants.renderName}
					menuRenderer={() => colMenu}
				/>
			)
		}

		// vpo columns
		const vpoTableColumns = vpoNames.map((index) => {
			return <Column key={index} cellRenderer={vpoCellRenderer} columnHeaderCellRenderer={renderVpoHeader} />
		})

		var results;
		if (states.searchTable == 'CRFQ') {
			results = crfqTableColumns;
			widthValues = crfqWidthValues;
		} else if (states.searchTable == 'CPO') {
			results = cpoTableColumns;
			widthValues = cpoWidthValues;
		} else if (states.searchTable == 'VPO') {
			results = vpoTableColumns;
			widthValues = vpoWidthValues;
		}

		var content;
		if (states.searchFetched) {
			content = (
				<Table2
					numRows={filteredResults.length}
					renderMode={RenderMode.BATCH}
					cellRendererDependencies={[states.selectedBuyers, states.searchValue, states.searchResults]}
					columnWidths={widthValues}
					numFrozenRows={0}
					enableFocusedCell={true}
				>
					{results}
				</Table2>
			)
		} else {
			content = (
				<Spinner />
			)
		}

		return (
			<div className="result-table">
				{content}
			</div>
		)
	};
	
	

	// render search results using card list
	const renderedResults = () => {
		if (states.searchTable == 'Parts' || states.searchTable == 'Customer' ||states.searchTable == 'Vendor') {
			return renderCardResults();
		} else {
			return tableResults()
		}
	};

	// handle when search searchTable menuitem is clicked
	const handleMenuClick = (value) => {
		setStates(state => {
			// update the search table
			state.searchTable = value;
			state.selectedBuyers.clear();

			// update the search column
			if (value === 'Parts') {
				state.searchColumns = partColumns;
				state.searchColumn = 'partno';
			} else if (value === 'Customer') {
				state.searchColumns = custColumns;
				state.searchColumn = 'customer';
			} else if (value === 'Vendor') {
				state.searchColumns = vendColumns;
				state.searchColumn = 'vendor'
			} else if (value === 'CRFQ') {
				state.searchColumns = crfqColumns;
				state.searchColumn = 'customer';
			} else if (value === 'CPO') {
				state.searchColumns = cpoColumns;
				state.searchColumn = 'customer';
			} else if (value === 'VPO') {
				state.searchColumns = vpoColumns;
				state.searchColumn = 'vendor';
			}

			// close the search menu option
			state.isOpen.searchMenu = false;
			

			// clear the previous search results and search keyword
			state.searchResults.length = 0;
			state.searchValue = ''
		})
	}

	// search searchTable popover
	const searchCategory = (
		<Popover
			content={
				<Menu>
					<MenuItem text="Parts" onClick={() => handleMenuClick("Parts")}/>
					<MenuItem text="Customer" onClick={() => handleMenuClick("Customer")}/>
					<MenuItem text="Vendor" onClick={() => handleMenuClick("Vendor")}/>
					<MenuItem text="CRFQ" onClick={() => handleMenuClick("CRFQ")} />
					<MenuItem text="CPO" onClick={() => handleMenuClick("CPO")} />
					<MenuItem text="VPO" onClick={() => handleMenuClick("VPO")} />
				</Menu>
			}
			placement="bottom-end"
			isOpen={states.isOpen.searchMenu}
			onInteraction={(nextOpenState) => setStates(state => {
				state.isOpen.searchMenu = nextOpenState;

			})}
			minimal={true}
		>
			<Button minimal={true} rightIcon="caret-down">
				{states.searchTable}
			</Button>
		</Popover>
	)

	// date range inputs for crfq search options
	const dateRanges = (
		<div>
			<FormGroup
				label="Receive Date Range"
				inline={true}
				fill={true}
				className="receive-date"
			>
			<DateRangeInput3 
				fill={false}
			/>
			</FormGroup>
			<FormGroup
				label="Due Date Range"
				inline={true}
				fill={true}
				className="due-date"
			>
				<DateRangeInput3 
					fill={false}
				/>
			</FormGroup>
		</div>
	)

	const searchBar = (
		<div>
			<Popover
				content={
					<Menu>
						<InputGroup
							placeholder="Search"
							value={states.searchValue}
							onValueChange={handleSearchValueChange}
							inputClassName="search-input"
							autoFocus={true}
						/>
						<MenuDivider />
						{states.searchTable == 'CRFQ' && dateRanges}
						<MenuDivider />
						<SegmentedControl 
							options={states.searchColumns} 
							small={true} 
							inline={true}
							fill={true}
							intent="primary"
							onValueChange={(value) => setStates(state => {
								state.searchColumn = value
							})}
							defaultValue={states.searchColumns[0].value}
						/>
						<MenuDivider />
						<Section>
							<SectionCard padded={false}>
								{renderedResults()}	
							</SectionCard>	
						</Section>					
					</Menu>
				}
				isOpen={states.searchOpen}
				onClose={() => setStates(state => {
					state.searchOpen = false;
				})}
				placement="bottom"
				matchTargetWidth={true}
				minimal={true}
			>
				<Button 
					text="Search..."
					icon="search"
					onClick={handleSearchOpen}
					className="searchbar"
				/>
			</Popover>
			{searchCategory}
		</div>	
	)

	// navigation bar in home page
	// commented out the buttongroup since I don't really need them anymore
	const navBar = (
		
		<Navbar fixedToTop={false} className="home-navbar">
			<NavbarGroup align={Alignment.LEFT}>
				{/* <ButtonGroup>
					<Button text="Home" />
					<Button text="Parts" onClick={handlePartClick} />
					<Button text="Customer" onClick={handleCustomerClick} />
					<Button text="Vendor" onClick={handleVendorClick} />
				</ButtonGroup>
				<NavbarDivider /> */}
				<Popover
					content={
						<Menu>
							<InputGroup
								placeholder="Search"
								value={states.searchValue}
								onValueChange={handleSearchValueChange}
								inputClassName="search-input"
								autoFocus={true}
							/>
							<MenuDivider />
							{states.searchTable == 'CRFQ' && dateRanges}
							<MenuDivider />
							<SegmentedControl 
								options={states.searchColumns} 
								small={true} 
								inline={true}
								fill={true}
								intent="primary"
								onValueChange={(value) => setStates(state => {
									state.searchColumn = value
								})}
								defaultValue={states.searchColumns[0].value}
							/>
							<MenuDivider />
							<Section>
								<SectionCard padded={false}>
									{renderedResults()}	
								</SectionCard>	
							</Section>					
						</Menu>
					}
					isOpen={states.searchOpen}
					onClose={() => setStates(state => {
						state.searchOpen = false;
					})}
					placement="bottom"
					matchTargetWidth={true}
					minimal={true}
				>
					<Button 
						text="Search..."
						icon="search"
						onClick={handleSearchOpen}
						className="searchbar"
					/>
				</Popover>
				{searchCategory}
				{/* <SegmentedControl 
					options={searchTables} 
					small={true} 
					inline={true}
					fill={true}
					intent="primary"
					onValueChange={(value) => setStates(state => {
						state.searchTable = value
					})}
					defaultValue={searchTables[0].value}
				/> */}
			</NavbarGroup>
		</Navbar>
		
	)

	// handle tab selection change
	const handleTabChange = (newTabId) => {
		setStates((state) => {
			state.selectedTab = newTabId;
		})

		// fetch data according to the selected tab
		if (newTabId == 'receive') {
			fetchReceive();
		}
	}

	// P/R Log Search Panel
	const prlogPanel = (
		<span>test</span>
		// <Card className="card-panel">
		// 	P/R Log
		// </Card>
		
	)

	// Receiving Panel
	const receivePanel = () => {
		// deep copy
		var filteredResults = structuredClone(states.dailyReceive.data);

		// column names for the daily receiving table
		const receiveNames = ["Buyer", "Date", "SMID", "VPO", "SEQ", "Part No.", "VPN", "Vendor", "Location", "Req.Date", "Unit Price", "Qty", "Unit", "Amount", "Ship Note"]

		// column width values for daily receiving table
		const receiveWidths = {
			buyer: 120,
			date: 100,
			smid: 80,
			vpo: 150,
			seq: 50,
			partno: 120,
			vpn: 120,
			vendor: 150,
			location: 100,
			reqdate: 100,
			unitprice: 100,
			qty: 50,
			unit: 50,
			amount: 100,
			shipnote: 100
		}
		const receiveWidthValues = Object.values(receiveWidths);

		// daily receive table cell renderer
		const receiveCellRenderer = (rowIndex, columnIndex) => {
				
			try {
				if (states.selectedBuyers.size > 0) {
					filteredResults = states.dailyReceive.data.filter((row) => states.selectedBuyers.has(row[0]));
					
				}
				return (
					<Cell interactive={true}>
						<TruncatedFormat detectTruncation={true}>
							{filteredResults[rowIndex][columnIndex]}
						</TruncatedFormat>
					</Cell>
				)	
			} catch (error) {
				console.log('error rendering cells', error);
				return (
					<Cell>N/A</Cell>
				)
			} 
		};

		// crfq result table headers
		const renderReceiveHeader = (index) => {

			// apply menu renderer for just column index 4: buyer
			var colMenu = null;
			if (index == 0) {
				colMenu = receiveMenuRenderer(index)
			}
			return (
				<ColumnHeaderCell
					name={receiveNames[index]}
					index={index}
					nameRenderer={constants.renderName}
					menuRenderer={() => colMenu}
				/>
			)
		}

		// crfq columns
		const receiveTableColumns = receiveNames.map((index) => {
			return <Column key={index} cellRenderer={receiveCellRenderer} columnHeaderCellRenderer={renderReceiveHeader} />
		})

		return (
			<Card
				className="receiving-card"
			>
				<Table2
					numRows={filteredResults.length}
					renderMode={RenderMode.BATCH_ON_UPDATE}
					cellRendererDependencies={[states.selectedBuyers, states.dailyReceive.data]}
					columnWidths={receiveWidthValues}
					numFrozenRows={0}
					enableFocusedCell={true}
					className="receiving-table"
				>
					{receiveTableColumns}
				</Table2>
			</Card>
		)
	}
		

	// handle search button click
	const handleSearchDialogOpen = () => {
		setStates(state => {
			state.isOpen.searchDialog = true;
		})
	}

	// handle overlay close
	const handleSearchDialogClose = () => {
		setStates(state => {
			state.isOpen.searchDialog = false;
		})
	};

	// search keyboard shortcut icon
	const searchIcon = (
		<div>
			<Icon icon="key-control"/>
			<span className="search-text">F</span>
		</div>
	)

	// search overlay
	const searchDialog = (
		<Dialog
			isOpen={states.isOpen.searchDialog}
			className="search-dialog"
			onClose={handleSearchDialogClose}
			title="Search Dialog"
			lazy={true}
			usePortal={true}
		>
			<DialogBody useOverflowScrollContainer={false}>
				
				<InputGroup
					placeholder="Search"
					value={states.searchValue}
					onValueChange={handleSearchValueChange}
					inputClassName="search-input"
					rightElement={searchCategory}
					autoFocus={true}
				/>
				
				<Divider />
				<SegmentedControl 
					options={states.searchColumns} 
					small={true} 
					inline={true}
					fill={true}
					intent="primary"
					onValueChange={(value) => setStates(state => {
						state.searchColumn = value
					})}
					value={states.searchColumn}
					// defaultValue={states.defaultColumn}
					ref={searchMenuRef}
					
				/>
				<Divider />
				
				<Section elevation={Elevation.ONE}>
					<SectionCard padded={true}>
						{renderedResults()}	
					</SectionCard>	
				</Section>					
					
			</DialogBody>
			{/* <DialogFooter>
				{states.searchTable == 'CRFQ' && dateRanges}
			</DialogFooter> */}
		</Dialog>
	)

	// button for the search dialog
	const searchButton = (
		<Button 
			minimal={true}
			fill={true}
			alignText={Alignment.LEFT}
			icon="search"
			rightIcon={searchIcon}
			text="Search..."
			textClassName="search-text"
			onClick={handleSearchDialogOpen}
			className="side-menu-button"
		/>
	)

	// handlers the add dialog
	const handleAddDialogOpen = async() => {
		// // fetch customer list
    // try {
    //   const response = await fetch(`${constants.BASE_URL}/api/custlist`, {method: 'GET'});
    //   const data = await response.json();
    //   const parsed = data.map((item, index) => {
    //     const customer = (item.TITLE != null) ? item.TITLE : '';
    //     return {title: customer, index: index};
    //   })
    //   setStates((state) => {
    //     state.custList = parsed; 
    //   })
    // } catch (error) {
    //   console.error("Error fetching customer list", error);
    // }
		setStates((state) => {
			state.isOpen.addDialog = true;
		})
	}

	const handleAddDialogClose = () => {
		setStates((state) => {
			state.isOpen.addDialog = false;
		})
	}

	// right icon for the add button
	const addIcon = (
		<div>
			<Icon icon="key-control" />
			<span className="search-text">N</span>
		</div>
	)

	// handle add button popover's menu item click
	const handleAddMenuClick = (value) => {
		setStates((state) => {
			state.selectedAddMenu = value;
		})
		handleAddDialogOpen();
	}

	// add button that opens the add dialog
	const addButton = (
		<Popover
			content={
				<Menu 
					className="add-menu"
					large={false}
				>
					<h3>Create</h3>
					<MenuDivider/>
					<MenuItem text="Parts" onClick={() => handleAddMenuClick("part")}/>
					<MenuDivider />
					<MenuItem text="Customer" onClick={() => handleAddMenuClick("customer")}/>
					<MenuDivider />
					<MenuItem text="Vendor" onClick={() => handleAddMenuClick("vendor")}/>
					<MenuDivider />
					<MenuItem text="CRFQ" onClick={() => handleAddMenuClick("crfq")}/>
				</Menu>
			}
			placement="auto"
			isOpen={states.isOpen.addMenu}
			onInteraction={(nextOpenState) => setStates(state => {
				state.isOpen.addMenu = nextOpenState;
			})}
			fill={true}
			minimal={true}
			popoverClassName="add-menu-popover"
		>
			<AddCircleOutlineIcon className="add-button"  fontSize="large"/>
			{/* <Button
				minimal={true}
				fill={true}
				icon="add"
				alignText={Alignment.LEFT}
				text="New..."
				textClassName="search-text"
				rightIcon={addIcon}
				className="side-menu-button"
				// onClick={handleAddDialogOpen}
			/> */}
		</Popover>
	)

	// select panel for the add dialog
	const selectPanel = (
		<DialogBody>
			<p>Create new record in</p>
			<RadioGroup
				onChange={(e) => {
					setStates((state) => {
						state.form.selectOption = e.target.value;
					})
				}}
				selectedValue={states.form.selectOption}
			>
				<Radio label="Part" value="part" />
				<Radio label="Customer" value="customer" />
				<Radio label="Vendor" value="vendor" />
				<Radio label="CRFQ" value="crfq" />
			</RadioGroup>
		</DialogBody>
	)

	// handle file open dilaog in the crfq edit details form
  const handleFileOpenClick = async(option) => {
    // store the select filepath and save it
    const filepath = await window.electronAPI.selectFile();
    setStates((state) => {
			if (option === 'origquote') {
				state.form.crfq.origquote = filepath;
			} else if (option === 'mergeExcel') {
				state.form.crfq.mergeExcel = filepath;
			}
    })
  }

	// form props
	const formProps = {
		inline: true
	}

	// // info panel for the add dialog
	// const infoPanel = () => {
	// 	// display contents of the info panel differently based on the previous selection
	// 	var contents;

	// 	// part form components
	// 	const partForm = (
	// 		<>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Part No."
	// 				className="part-form-label"
	// 			>
	// 				<InputGroup
	// 					className="part-form-input"
	// 					value={states.form.part.partno}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.partno = e.target.value
	// 						})
	// 					}}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="HSCODE"
	// 				className="part-form-label"
	// 			>
	// 				<InputGroup
	// 					className="part-form-input"
	// 					value={states.form.part.hscode}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.hscode = e.target.value
	// 						})
	// 					}}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="NSN"
	// 				className="part-form-label"
	// 			>
	// 				<InputGroup
	// 					className="part-form-input"
	// 					value={states.form.part.nsn}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.nsn = e.target.value
	// 						})
	// 					}}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Description"
	// 				className="part-form-label"
	// 			>
	// 				<InputGroup
	// 					className="part-form-input"
	// 					value={states.form.part.descr}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.descr = e.target.value
	// 						})
	// 					}}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="REV"
	// 				className="part-form-label"
	// 			>
	// 				<InputGroup
	// 					className="part-form-input"
	// 					value={states.form.part.rev}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.rev = e.target.value
	// 						})
	// 					}}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Notes"
	// 				className="part-form-label"
	// 			>
	// 				<TextArea
	// 					value={states.form.part.notes}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.notes = e.target.value;
	// 						})
	// 					}}
	// 					className="part-form-textarea"
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Internal Notes"
	// 				className="part-form-label"
	// 			>
	// 				<TextArea
	// 					value={states.form.part.internal}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.internal = e.target.value;
	// 						})
	// 					}}
	// 					className="part-form-textarea"
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Trouble Notes"
	// 				className="part-form-label"
	// 			>
	// 				<TextArea
	// 					value={states.form.part.trouble}
	// 					onChange={(e) => {
	// 						setStates((state) => {
	// 							state.form.part.trouble = e.target.value;
	// 						})
	// 					}}
	// 					className="part-form-textarea"
	// 				/>
	// 			</FormGroup>
	// 		</>
	// 	)

	// 	const customerForm = (
	// 		<>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Customer"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.title}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.title = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Addr1"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billaddr1}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billaddr1 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Addr2"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billaddr2}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billaddr2 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill City"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billcity}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billcity = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Zip"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billzip}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billzip = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Tel"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billtel}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billtel = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Fax"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billfax}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billfax = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Contact"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billcontact}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billcontact = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Email"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.billemail}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billemail = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Addr1"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.shipaddr1}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shipaddr1 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Addr2"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.shipaddr2}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shipaddr2 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship City"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.shipcity}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shipcity = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Zip"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.shipzip}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shipzip = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Tel"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.shiptel}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shiptel = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Fax"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='customer-form-input'
	// 					value={states.form.customer.shipfax}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shipfax = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Contact"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup
	// 					className='customer-form-input' 
	// 					value={states.form.customer.billcontact}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.billcontact = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Email"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup
	// 					className='customer-form-input' 
	// 					value={states.form.customer.shipemail}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shipemail = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Ship Via"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup
	// 					className='customer-form-input' 
	// 					value={states.form.customer.shipvia}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.shipvia = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="F.O.B"
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup
	// 					className='customer-form-input' 
	// 					value={states.form.customer.fob}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.fob = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Account No."
	// 				className='customer-form-label'
	// 			>
	// 				<InputGroup
	// 					className='customer-form-input' 
	// 					value={states.form.customer.accountno}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.accountno = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Broker"
	// 				className='customer-form-label'
	// 			>
	// 				<HTMLSelect
	// 					value={states.form.customer.broker}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.broker = e.target.value;
	// 					})}
	// 					options={['SKI','None']}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Pay Term"
	// 				className='customer-form-label'
	// 			>
	// 				<HTMLSelect
	// 					value={states.form.customer.payterm}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.customer.payterm = e.target.value;
	// 					})} 
	// 					options={['None','Prepay','C.O.D','LC/TD','Credit Card','Net 15 Days','Net 30 Days','Net 45 Days','Net 60 Days','Net 70 Days','Net 75 Days','Net 90 Days','Net 120 Days','Net 360 Days']}
	// 				/>
	// 			</FormGroup>
	// 		</>
	// 	)

	// 	const vendorForm = (
	// 		<>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Vendor"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.title}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.title = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Addr1"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.addr1}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.addr1 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Addr2"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.addr2}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.addr2 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="City"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.city}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.city = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Zip"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.zip}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.zip = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Tel"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.tel}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.tel = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Fax"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.fax}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.fax = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Contact"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.contact}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.contact = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Email"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.email}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.email = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Addr1"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.billaddr1}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billaddr1 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Addr2"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.billaddr2}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billaddr2 = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill City"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.billcity}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billcity = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Zip"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.billzip}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billzip = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Tel"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.billtel}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billtel = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Fax"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup 
	// 					className='vendor-form-input'
	// 					value={states.form.vendor.billfax}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billfax = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Contact"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup
	// 					className='vendor-form-input' 
	// 					value={states.form.vendor.billcontact}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billcontact = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Bill Email"
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup
	// 					className='vendor-form-input' 
	// 					value={states.form.vendor.billemail}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.billemail = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup 
	// 				inline={formProps.inline}
	// 				label="Account No."
	// 				className='vendor-form-label'
	// 			>
	// 				<InputGroup
	// 					className='vendor-form-input' 
	// 					value={states.form.vendor.accountno}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.accountno = e.target.value
	// 					})}
	// 				/>
	// 			</FormGroup>
	// 			<FormGroup
	// 				inline={formProps.inline}
	// 				label="Pay Term"
	// 				className='vendor-form-label'
	// 			>
	// 				<HTMLSelect
	// 					value={states.form.vendor.payterm}
	// 					onChange={(e) => setStates((state) => {
	// 						state.form.vendor.payterm = e.target.value;
	// 					})} 
	// 					options={['None','Prepay','C.O.D','LC/TD','Credit Card','Net 15 Days','Net 30 Days','Net 45 Days','Net 60 Days','Net 70 Days','Net 75 Days','Net 90 Days','Net 120 Days','Net 360 Days']}
	// 				/>
	// 			</FormGroup>
	// 		</>
	// 	)

	// 	// render customer list item for suggest component inside add new record dialog
	// 	const renderCustomerItem = (item, {handleClick}) => {
	// 		return (
	// 			<MenuItem
	// 				text={`${item.title}`}
	// 				roleStructure="listoption"
	// 				selected={item.title === states.form.crfq.customer}
	// 				onClick={handleClick}
	// 				key={item.index}
	// 			/>
	// 		)
	// 	}

	// 	// render customer suggest input value in the edit details dialog
	// 	const renderInputValue = (item) => item.title;

	// 	// customer list filtering for edit details dialog
	// 	const filterCustomer = (query, customer) => {
	// 		const normalizedCustomer = customer.title.toLowerCase();
	// 		const normalizedQuery = query.toLowerCase();
	
	// 		return `${normalizedCustomer}`.indexOf(normalizedQuery) >= 0;
	// 	}

	// 	const crfqForm = (
	// 		<div>
	// 			<FormGroup
  //         inline={formProps.inline}
  //         label="Customer"
  //         className='form-label'
  //       >
  //         <Suggest
  //           query={states.form.crfq.customer}
  //           onQueryChange={(e) => setStates((state) => {
  //             state.form.crfq.customer = e;
  //           })}
  //           // className="form-input"
  //           items={states.custList}
  //           itemRenderer={renderCustomerItem}
  //           onItemSelect={(item) => setStates((state) => {
  //             state.form.crfq.customer = item.title;
  //           })}
  //           inputValueRenderer={renderInputValue}
  //           itemPredicate={filterCustomer}
	// 					className="form-input"
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Project Name"
  //         className='form-label'
  //       >
  //         <InputGroup 
  //           className='form-input'
  //           value={states.form.crfq.prjname}
  //           onChange={(e) => setStates((state) => {
  //             state.form.crfq.prjname = e.target.value
  //           })}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Program Name"
  //         className='form-label'
  //       >
  //         <InputGroup 
  //           className='form-input'
  //           value={states.form.crfq.prgname}
  //           onChange={(e) => setStates((state) => {
  //             state.form.crfq.prgname = e.target.value
  //           })}
  //         />
  //       </FormGroup>
  //       <RadioGroup
  //         label="Category"
  //         onChange={(e) => setStates((state) => {
  //           state.form.crfq.quotecat = e.target.value
  //         })}
  //         selectedValue={states.form.crfq.quotecat}
  //         inline={true}
  //         className='category-radio'
  //       >
  //         <Radio label="Mass" value="0" />
  //         <Radio label="R&D" value="1" />
  //         <Radio label="Budget" value="2" />
  //         <Radio label="Feasibility" value="3" />
  //         <Radio label="Mass(Pre)" value="4" />
  //         <Radio label="R&D(Pre)" value="5" />
  //       </RadioGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Received Date"
  //         className='form-label'
  //       >
  //         <DateInput3
  //           placeholder="M/D/YYYY"
  //           value={states.form.crfq.receivedate}
  //           onChange={(date) => setStates((state) => {
  //             state.form.crfq.receivedate = date;
  //           })}
  //           formatDate={formatDate}
  //           parseDate={parseDate}
  //           dayPickerProps={dayProps}
  //           maxDate={newMaxDate}
  //           {...spreadProps}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Due Date"
  //         className='form-label'
  //       >
  //         <DateInput3
  //           placeholder="M/D/YYYY"
  //           value={states.form.crfq.duedate}
  //           onChange={(date) => setStates((state) => {
  //             state.form.crfq.duedate = date;
  //           })}
  //           formatDate={formatDate}
  //           parseDate={parseDate}
  //           dayPickerProps={dayProps}
  //           maxDate={newMaxDate}
  //           {...spreadProps}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Received By"
  //         className='form-label'
  //       >
  //         <HTMLSelect
  //           className='form-input'
  //           value={states.form.crfq.receiveby}
  //           onChange={(e) => setStates((state) => {
  //             state.form.crfq.receiveby = e.target.value
  //           })}
  //           options={Object.values(constants.idToWorker)}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Analyzed By"
  //         className='form-label'
  //       >
  //         <HTMLSelect 
  //           className='form-input'
  //           value={states.form.crfq.analyzeby}
  //           onChange={(e) => setStates((state) => {
  //             state.form.crfq.analyzeby = e.target.value
  //           })}
  //           options={Object.values(constants.idToWorker)}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Validity (days)"
  //         className='form-label'
  //       >
  //         <NumericInput 
  //           className='form-input'
  //           value={states.form.crfq.validity}
  //           onValueChange={(value) => setStates((state) => {
  //             state.form.crfq.validity = value
  //           })}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Term"
  //         className='form-label'
  //       >
  //         <HTMLSelect 
  //           className='form-input'
  //           value={states.form.crfq.term}
  //           onChange={(e) => setStates((state) => {
  //             state.form.crfq.term = e.target.value
  //           })}
  //           options={["None", "COD-N30", "Prepayment", "NET 30", "NET 60"]}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Warranty (months)"
  //         className='form-label'
  //       >
  //         <NumericInput 
  //           className='form-input'
  //           value={states.form.crfq.warranty}
  //           onValueChange={(value) => setStates((state) => {
  //             state.form.crfq.warranty = value
  //           })}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Min P.O"
  //         className='form-label'
  //       >
  //         <NumericInput 
  //           className='form-input'
  //           value={states.form.crfq.minpo}
  //           onValueChange={(value) => setStates((state) => {
  //             state.form.crfq.minpo = value
  //           })}
  //         />
  //       </FormGroup>
  //       <FormGroup 
  //         inline={formProps.inline}
  //         label="Original Quotation"
  //         className='form-label'
  //       >
  //         <InputGroup 
  //           className='form-input'
  //           value={states.form.crfq.origquote}
  //           rightElement={<Button text="browse" minimal={false} onClick={handleFileOpenClick}/>}
  //         />
  //       </FormGroup>
	// 		</div>
	// 	)

	// 	if (states.selectedAddMenu == 'part') {
	// 		contents = partForm;
	// 	} else if (states.selectedAddMenu == 'customer') {
	// 		contents = customerForm;
	// 	} else if (states.selectedAddMenu == 'vendor') {
	// 		contents = vendorForm;
	// 	} else if (states.selectedAddMenu == 'crfq') {
	// 		contents = crfqForm;
	// 	}

	// 	return (
	// 		<DialogBody>
	// 			{contents}
	// 		</DialogBody>
	// 	)
	// }

	// handle reading excel file for merge to creating new crfq & crfqitem records


	// save new records in the database appropriately
	const handleCreateClick = async() => {
		const toaster = OverlayToaster.create({position: "top"});
		var data;
		if (states.selectedAddMenu == 'part') {
			data = JSON.stringify({
				partno: states.form.part.partno,
				hscode: states.form.part.hscode,
				nsn: states.form.part.nsn,
				descr: states.form.part.descr,
				rev: states.form.part.rev,
				notes: states.form.part.notes,
				internal: states.form.part.internal,
				trouble: states.form.part.trouble
			});
		} else if (states.selectedAddMenu == 'customer') {
			// parse the broker and payterm value
			var brokerid;
			const broker = states.form.customer.broker;
			if (broker === 'SKI') {
				brokerid = 1;
			} else {
				brokerid = 0;
			}
	
			var payint;
			const payterm = states.form.customer.payterm;
			if (payterm === 'C.O.D') {
				payint = 0;
			} else if (payterm === 'LC/TD') {
				payint = -1;
			} else if (payterm === 'Credit Card') {
				payint = -2;
			} else if (payterm === 'Prepay') {
				payint = -3;
			} else if (payterm === 'Net 15 Days') {
				payint = 15;
			} else if (payterm === 'Net 30 Days') {
				payint = 30;
			} else if (payterm === 'Net 45 Days') {
				payint = 45;
			} else if (payterm === 'Net 60 Days') {
				payint = 60;
			} else if (payterm === 'Net 75 Days') {
				payint = 75;
			} else if (payterm === 'Net 90 Days') {
				payint = 90;
			} else if (payterm === 'Net 120 Days') {
				payint = 120;
			} else if (payterm === 'Net 360 Days') {
				payint = 360;
			} else {
				payint = -4;
			}

			data = JSON.stringify({
				title: states.form.customer.title,
				billaddr1: states.form.customer.billaddr1,
				billaddr2: states.form.customer.billaddr2,
				billcity: states.form.customer.billcity,
				billzip: states.form.customer.billzip,
				billtel: states.form.customer.billtel,
				billfax: states.form.customer.billfax,
				billcontact: states.form.customer.billcontact,
				billemail: states.form.customer.billemail,
				shipaddr1: states.form.customer.shipaddr1,
				shipaddr2: states.form.customer.shipaddr2,
				shipcity: states.form.customer.shipcity,
				shipzip: states.form.customer.shipzip,
				shiptel: states.form.customer.shiptel,
				shipfax: states.form.customer.shipfax,
				shipcontact: states.form.customer.shipcontact,
				shipemail: states.form.customer.shipemail,
				shipvia: states.form.customer.shipvia,
				fob: states.form.customer.fob,
				accountno: states.form.customer.accountno,
				broker: brokerid,
				payterm: payint
			})
		} else if (states.selectedAddMenu == 'vendor') {
			// parse the vendor's payterm
			var payint;
			const payterm = states.form.vendor.payterm;
			if (payterm === 'C.O.D') {
				payint = 0;
			} else if (payterm === 'LC/TD') {
				payint = -1;
			} else if (payterm === 'Credit Card') {
				payint = -2;
			} else if (payterm === 'Prepay') {
				payint = -3;
			} else if (payterm === 'Net 15 Days') {
				payint = 15;
			} else if (payterm === 'Net 30 Days') {
				payint = 30;
			} else if (payterm === 'Net 45 Days') {
				payint = 45;
			} else if (payterm === 'Net 60 Days') {
				payint = 60;
			} else if (payterm === 'Net 70 Days') {
				payint = 70;
			} else if (payterm === 'Net 75 Days') {
				payint = 75;
			} else if (payterm === 'Net 90 Days') {
				payint = 90;
			} else if (payterm === 'Net 120 Days') {
				payint = 120;
			} else if (payterm === 'Net 360 Days') {
				payint = 360;
			} else {
				payint = -4;
			}
			data = JSON.stringify({
				title: states.form.vendor.title,
				addr1: states.form.vendor.addr1,
				addr2: states.form.vendor.addr2,
				city: states.form.vendor.city,
				zip: states.form.vendor.zip,
				tel: states.form.vendor.tel,
				fax: states.form.vendor.fax,
				contact: states.form.vendor.contact,
				email: states.form.vendor.email,
				billaddr1: states.form.vendor.billaddr1,
				billaddr2: states.form.vendor.billaddr2,
				billcity: states.form.vendor.billcity,
				billzip: states.form.vendor.billzip,
				billtel: states.form.vendor.billtel,
				billfax: states.form.vendor.billfax,
				billcontact: states.form.vendor.billcontact,
				billemail: states.form.vendor.billemail,
				accountno: states.form.vendor.accountno,
				payterm: payint
			})
		} else if (states.selectedAddMenu == 'crfq') {
			// map worker's name to id
			const receiveid = Object.keys(constants.idToWorker).find(key => constants.idToWorker[key] === states.form.crfq.receiveby);
			const analyzeid = Object.keys(constants.idToWorker).find(key => constants.idToWorker[key] === states.form.crfq.analyzeby);

			data = JSON.stringify({
				customer: states.form.crfq.customer,
				prjname: states.form.crfq.prjname,
				prgname: states.form.crfq.prgname,
				quotecat: states.form.crfq.quotecat,
				receivedate: states.form.crfq.receivedate,
				duedate: states.form.crfq.duedate,
				receiveby: receiveid,
				analyzeby: analyzeid,
				validity: states.form.crfq.validity,
				term: states.form.crfq.term,
				warranty: states.form.crfq.warranty,
				minpo: states.form.crfq.minpo,
				origquote: states.form.crfq.origquote
			})
		}
		
		// create new record
		try {
			const response = await fetch(`${constants.BASE_URL}/api/add/${states.selectedAddMenu}`, {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: data
			})
			const newRecord = await response.json();

			if (states.selectedAddMenu === 'crfq') {
				// const newRecord = await response.json();
				const rqid = newRecord.RQID;
				const filepath = states.form.crfq.mergeExcel;

				// read excel rows from the merge excel file
				const rows = await window.electronAPI.readExcel(filepath);

				// assign rqid to each row
				const rowsWithId = rows.map(row => {
					return [...row, rqid]
				});

				// insert all rows to the crfqitems table
				const response = await fetch(`${constants.BASE_URL}/api/add/crfqitems`, {
					method: 'POST',
					headers: {
						'Content-type': 'application/json'
					},
					body: JSON.stringify(rowsWithId)
				})
			}
			
		} catch (error) {
			console.error('Error creating a new record', error);
		}

		// if creating new crfq, create crfqitem records based on the selected merge excel file


		toaster.show({
			message: "New record has been created!",
			intent: Intent.SUCCESS
		})

		// close the add dialog
		setStates((state) => {
			state.isOpen.addDialog = false;
		})
	}

	const finalButtonProps = {
		intent: "primary",
		text: "Create",
		onClick: () => handleCreateClick()
	}

	// handle closing create dialog
	const handleCloseCreateDialog = () => {
		setStates((state) => {
			state.isOpen.addDialog = false;
		})
	}

	// create dialog
	const renderCreateDialog = () => {
		var contents;

		// part form components
		const partForm = (
			<>
				<FormGroup
					inline={formProps.inline}
					label="Part No."
					className="part-form-label"
				>
					<InputGroup
						className="part-form-input"
						value={states.form.part.partno}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.partno = e.target.value
							})
						}}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="HSCODE"
					className="part-form-label"
				>
					<InputGroup
						className="part-form-input"
						value={states.form.part.hscode}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.hscode = e.target.value
							})
						}}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="NSN"
					className="part-form-label"
				>
					<InputGroup
						className="part-form-input"
						value={states.form.part.nsn}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.nsn = e.target.value
							})
						}}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="Description"
					className="part-form-label"
				>
					<InputGroup
						className="part-form-input"
						value={states.form.part.descr}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.descr = e.target.value
							})
						}}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="REV"
					className="part-form-label"
				>
					<InputGroup
						className="part-form-input"
						value={states.form.part.rev}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.rev = e.target.value
							})
						}}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="Notes"
					className="part-form-label"
				>
					<TextArea
						value={states.form.part.notes}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.notes = e.target.value;
							})
						}}
						className="part-form-textarea"
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="Internal Notes"
					className="part-form-label"
				>
					<TextArea
						value={states.form.part.internal}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.internal = e.target.value;
							})
						}}
						className="part-form-textarea"
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="Trouble Notes"
					className="part-form-label"
				>
					<TextArea
						value={states.form.part.trouble}
						onChange={(e) => {
							setStates((state) => {
								state.form.part.trouble = e.target.value;
							})
						}}
						className="part-form-textarea"
					/>
				</FormGroup>
			</>
		)

		const customerForm = (
			<>
				<FormGroup 
					inline={formProps.inline}
					label="Customer"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.title}
						onChange={(e) => setStates((state) => {
							state.form.customer.title = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Addr1"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billaddr1}
						onChange={(e) => setStates((state) => {
							state.form.customer.billaddr1 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Addr2"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billaddr2}
						onChange={(e) => setStates((state) => {
							state.form.customer.billaddr2 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill City"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billcity}
						onChange={(e) => setStates((state) => {
							state.form.customer.billcity = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Zip"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billzip}
						onChange={(e) => setStates((state) => {
							state.form.customer.billzip = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Tel"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billtel}
						onChange={(e) => setStates((state) => {
							state.form.customer.billtel = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Fax"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billfax}
						onChange={(e) => setStates((state) => {
							state.form.customer.billfax = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Contact"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billcontact}
						onChange={(e) => setStates((state) => {
							state.form.customer.billcontact = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Email"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.billemail}
						onChange={(e) => setStates((state) => {
							state.form.customer.billemail = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Addr1"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.shipaddr1}
						onChange={(e) => setStates((state) => {
							state.form.customer.shipaddr1 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Addr2"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.shipaddr2}
						onChange={(e) => setStates((state) => {
							state.form.customer.shipaddr2 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship City"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.shipcity}
						onChange={(e) => setStates((state) => {
							state.form.customer.shipcity = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Zip"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.shipzip}
						onChange={(e) => setStates((state) => {
							state.form.customer.shipzip = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Tel"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.shiptel}
						onChange={(e) => setStates((state) => {
							state.form.customer.shiptel = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Fax"
					className='customer-form-label'
				>
					<InputGroup 
						className='customer-form-input'
						value={states.form.customer.shipfax}
						onChange={(e) => setStates((state) => {
							state.form.customer.shipfax = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Contact"
					className='customer-form-label'
				>
					<InputGroup
						className='customer-form-input' 
						value={states.form.customer.billcontact}
						onChange={(e) => setStates((state) => {
							state.form.customer.billcontact = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Email"
					className='customer-form-label'
				>
					<InputGroup
						className='customer-form-input' 
						value={states.form.customer.shipemail}
						onChange={(e) => setStates((state) => {
							state.form.customer.shipemail = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Ship Via"
					className='customer-form-label'
				>
					<InputGroup
						className='customer-form-input' 
						value={states.form.customer.shipvia}
						onChange={(e) => setStates((state) => {
							state.form.customer.shipvia = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="F.O.B"
					className='customer-form-label'
				>
					<InputGroup
						className='customer-form-input' 
						value={states.form.customer.fob}
						onChange={(e) => setStates((state) => {
							state.form.customer.fob = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Account No."
					className='customer-form-label'
				>
					<InputGroup
						className='customer-form-input' 
						value={states.form.customer.accountno}
						onChange={(e) => setStates((state) => {
							state.form.customer.accountno = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="Broker"
					className='customer-form-label'
				>
					<HTMLSelect
						value={states.form.customer.broker}
						onChange={(e) => setStates((state) => {
							state.form.customer.broker = e.target.value;
						})}
						options={['SKI','None']}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="Pay Term"
					className='customer-form-label'
				>
					<HTMLSelect
						value={states.form.customer.payterm}
						onChange={(e) => setStates((state) => {
							state.form.customer.payterm = e.target.value;
						})} 
						options={['None','Prepay','C.O.D','LC/TD','Credit Card','Net 15 Days','Net 30 Days','Net 45 Days','Net 60 Days','Net 70 Days','Net 75 Days','Net 90 Days','Net 120 Days','Net 360 Days']}
					/>
				</FormGroup>
			</>
		)

		const vendorForm = (
			<>
				<FormGroup 
					inline={formProps.inline}
					label="Vendor"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.title}
						onChange={(e) => setStates((state) => {
							state.form.vendor.title = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Addr1"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.addr1}
						onChange={(e) => setStates((state) => {
							state.form.vendor.addr1 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Addr2"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.addr2}
						onChange={(e) => setStates((state) => {
							state.form.vendor.addr2 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="City"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.city}
						onChange={(e) => setStates((state) => {
							state.form.vendor.city = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Zip"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.zip}
						onChange={(e) => setStates((state) => {
							state.form.vendor.zip = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Tel"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.tel}
						onChange={(e) => setStates((state) => {
							state.form.vendor.tel = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Fax"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.fax}
						onChange={(e) => setStates((state) => {
							state.form.vendor.fax = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Contact"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.contact}
						onChange={(e) => setStates((state) => {
							state.form.vendor.contact = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Email"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.email}
						onChange={(e) => setStates((state) => {
							state.form.vendor.email = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Addr1"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.billaddr1}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billaddr1 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Addr2"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.billaddr2}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billaddr2 = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill City"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.billcity}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billcity = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Zip"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.billzip}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billzip = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Tel"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.billtel}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billtel = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Fax"
					className='vendor-form-label'
				>
					<InputGroup 
						className='vendor-form-input'
						value={states.form.vendor.billfax}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billfax = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Contact"
					className='vendor-form-label'
				>
					<InputGroup
						className='vendor-form-input' 
						value={states.form.vendor.billcontact}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billcontact = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Bill Email"
					className='vendor-form-label'
				>
					<InputGroup
						className='vendor-form-input' 
						value={states.form.vendor.billemail}
						onChange={(e) => setStates((state) => {
							state.form.vendor.billemail = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup 
					inline={formProps.inline}
					label="Account No."
					className='vendor-form-label'
				>
					<InputGroup
						className='vendor-form-input' 
						value={states.form.vendor.accountno}
						onChange={(e) => setStates((state) => {
							state.form.vendor.accountno = e.target.value
						})}
					/>
				</FormGroup>
				<FormGroup
					inline={formProps.inline}
					label="Pay Term"
					className='vendor-form-label'
				>
					<HTMLSelect
						value={states.form.vendor.payterm}
						onChange={(e) => setStates((state) => {
							state.form.vendor.payterm = e.target.value;
						})} 
						options={['None','Prepay','C.O.D','LC/TD','Credit Card','Net 15 Days','Net 30 Days','Net 45 Days','Net 60 Days','Net 70 Days','Net 75 Days','Net 90 Days','Net 120 Days','Net 360 Days']}
					/>
				</FormGroup>
			</>
		)

		// render customer list item for suggest component inside add new record dialog
		const renderCustomerItem = (item, {handleClick}) => {
			return (
				<MenuItem
					text={`${item.title}`}
					roleStructure="listoption"
					selected={item.title === states.form.crfq.customer}
					onClick={handleClick}
					key={item.index}
				/>
			)
		}

		// render customer suggest input value in the edit details dialog
		const renderInputValue = (item) => item.title;

		// customer list filtering for edit details dialog
		const filterCustomer = (query, customer) => {
			const normalizedCustomer = customer.title.toLowerCase();
			const normalizedQuery = query.toLowerCase();
	
			return `${normalizedCustomer}`.indexOf(normalizedQuery) >= 0;
		}

		const crfqForm = (
			<>
				<FormGroup
          inline={formProps.inline}
          label="Customer"
          className='crfq-form-label'
        >
          <Suggest
            query={states.form.crfq.customer}
            onQueryChange={(e) => setStates((state) => {
              state.form.crfq.customer = e;
            })}
            items={states.custList}
            itemRenderer={renderCustomerItem}
            onItemSelect={(item) => setStates((state) => {
              state.form.crfq.customer = item.title;
            })}
            inputValueRenderer={renderInputValue}
            itemPredicate={filterCustomer}
						className="crfq-customer-suggest"
						popoverContentProps={{'overflow-y': 'auto', 'max-height': '300px'}}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Project Name"
          className='crfq-form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.form.crfq.prjname}
            onChange={(e) => setStates((state) => {
              state.form.crfq.prjname = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Program Name"
          className='crfq-form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.form.crfq.prgname}
            onChange={(e) => setStates((state) => {
              state.form.crfq.prgname = e.target.value
            })}
          />
        </FormGroup>
        <RadioGroup
          label="Category"
          onChange={(e) => setStates((state) => {
            state.form.crfq.quotecat = e.target.value
          })}
          selectedValue={states.form.crfq.quotecat}
          inline={true}
          className='category-radio'
        >
          <Radio label="Mass" value="0" />
          <Radio label="R&D" value="1" />
          <Radio label="Budget" value="2" />
          <Radio label="Feasibility" value="3" />
          <Radio label="Mass(Pre)" value="4" />
          <Radio label="R&D(Pre)" value="5" />
        </RadioGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Received Date"
          className='crfq-form-label'
        >
          <DateInput3
            placeholder="M/D/YYYY"
            value={states.form.crfq.receivedate}
            onChange={(date) => setStates((state) => {
              state.form.crfq.receivedate = date;
            })}
            formatDate={formatDate}
            parseDate={parseDate}
            dayPickerProps={dayProps}
            maxDate={newMaxDate}
            {...spreadProps}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Due Date"
          className='crfq-form-label'
        >
          <DateInput3
            placeholder="M/D/YYYY"
            value={states.form.crfq.duedate}
            onChange={(date) => setStates((state) => {
              state.form.crfq.duedate = date;
            })}
            formatDate={formatDate}
            parseDate={parseDate}
            dayPickerProps={dayProps}
            maxDate={newMaxDate}
            {...spreadProps}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Received By"
          className='crfq-form-label'
        >
          <HTMLSelect
            className='form-input'
            value={states.form.crfq.receiveby}
            onChange={(e) => setStates((state) => {
              state.form.crfq.receiveby = e.target.value
            })}
            options={Object.values(constants.idToWorker)}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Analyzed By"
          className='crfq-form-label'
        >
          <HTMLSelect 
            className='form-input'
            value={states.form.crfq.analyzeby}
            onChange={(e) => setStates((state) => {
              state.form.crfq.analyzeby = e.target.value
            })}
            options={Object.values(constants.idToWorker)}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Validity (days)"
          className='crfq-form-label'
        >
          <NumericInput 
            className='form-input'
            value={states.form.crfq.validity}
            onValueChange={(value) => setStates((state) => {
              state.form.crfq.validity = value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Term"
          className='crfq-form-label'
        >
          <HTMLSelect 
            className='form-input'
            value={states.form.crfq.term}
            onChange={(e) => setStates((state) => {
              state.form.crfq.term = e.target.value
            })}
            options={["None", "COD-N30", "Prepayment", "NET 30", "NET 60"]}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Warranty (months)"
          className='crfq-form-label'
        >
          <NumericInput 
            className='form-input'
            value={states.form.crfq.warranty}
            onValueChange={(value) => setStates((state) => {
              state.form.crfq.warranty = value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Min P.O"
          className='crfq-form-label'
        >
          <NumericInput 
            className='form-input'
            value={states.form.crfq.minpo}
            onValueChange={(value) => setStates((state) => {
              state.form.crfq.minpo = value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Original Quotation"
          className='crfq-form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.form.crfq.origquote}
            rightElement={<Button text="browse" minimal={false} onClick={() => handleFileOpenClick('origquote')}/>}
          />
        </FormGroup>
				<FormGroup 
          inline={formProps.inline}
          label="Merge Excel"
          className='crfq-form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.form.crfq.mergeExcel}
            rightElement={<Button text="browse" minimal={false} onClick={() => handleFileOpenClick('mergeExcel')}/>}
          />
        </FormGroup>
			</>
		)

		if (states.selectedAddMenu == 'part') {
			contents = partForm;
		} else if (states.selectedAddMenu == 'customer') {
			contents = customerForm;
		} else if (states.selectedAddMenu == 'vendor') {
			contents = vendorForm;
		} else if (states.selectedAddMenu == 'crfq') {
			contents = crfqForm;
		}
		return (
			<Dialog
				title="Create Dialog"
				isOpen={states.isOpen.addDialog}
				onClose={handleCloseCreateDialog}
				className="create-dialog"
				usePortal={false}
				
			>
				<DialogBody
					useOverflowScrollContainer={true}
				>
					{contents}
				</DialogBody>
				<DialogFooter actions={<Button icon="tick" text="save" onClick={handleCreateClick}/>}/>
			</Dialog>
		)
	}
		// <MultistepDialog
		// 	isOpen={states.isOpen.addDialog}
		// 	title="Add Dialog"
		// 	onClose={handleAddDialogClose}
		// 	finalButtonProps={finalButtonProps}
		// 	canOutsideClickClose={false}
		// 	className="multistep-add-dialog"
		// >
		// 	<DialogStep
		// 		id="select"
		// 		panel={selectPanel}
		// 		title="Select"
		// 	/>
		// 	<DialogStep
		// 		id="Info"
		// 		panel={infoPanel()}
		// 		title="info"
		// 	/>
		// </MultistepDialog>

	// handle data range selection for the daily receiving
	const handleRangeChange = (range) => {
		setStates((state) => {
			state.dailyReceive.range = range;
		})
	}

	// define keyboard shortcuts
	const hotkeys = useMemo(() => [
		{
			combo: "ctrl+f",
			onKeyDown: handleSearchDialogOpen,
			global:true,
			label: "Open Search Dialog"
		},
		{
			combo: "ctrl+n",
			onKeyDown: handleAddDialogOpen,
			global: true,
			label: "Open Add Dialog"
		}
	])

	const {handleKeyDown, handleKeyUp} = useHotkeys(hotkeys);

	
	return (
		<div className="main-card">
			{searchDialog}
			{renderCreateDialog()}
			<div className="side-menu">
				<div className="side-menu-top">
					{searchButton}
				</div>
				<div className="side-menu-bottom">
						{addButton}
				</div>
			</div>
			<div 
				className="home-page"
				onKeyUp={handleKeyUp}
				onKeyDown={handleKeyDown}
			>
				{/* {navBar} */}
				<Card 
					className="home-card"
					elevation={Elevation.TWO}
				>
					<Tabs
						vertical={true}
						renderActiveTabPanelOnly={true}
						// selectedTabId={states.selectedTab}
						onChange={handleTabChange}
						className="home-tabs"
						defaultSelectedTabId="receive"
						selectedTabId={states.selectedTab}
					>	
						<Divider />
						<Tab 
							id="prlog" 
							title="P/R Log" 
							panel={prlogPanel} 
							className="tab-panel"
						/>
						<Tab 
							id="receive" 
							title="Daily Receiving" 
							panel={receivePanel()} 
							className="tab-panel"
						/>
						<DateRangeInput3 
							fill={true}
							allowSingleDayRange={true}
							value={states.dailyReceive.range}
							onChange={handleRangeChange}
						/>
						<TabsExpander />
					</Tabs>
				</Card>
			</div>
		</div>
	);
}

export default Home; 