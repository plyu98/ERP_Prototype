import React, { 
	useState, 
	useEffect, 
	useRef, 
	useCallback 
} from 'react';
import { 
  InputGroup, 
  Button,
  MenuItem,
  Label,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
	Radio,
	RadioGroup,
	ControlGroup,
	HTMLSelect,
	Checkbox,
	FormGroup,
	NonIdealState,
	Card,
	Spinner
} from "@blueprintjs/core";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat,
	RenderMode
} from "@blueprintjs/table";

import {useImmer} from 'use-immer';
import { OverlayToaster, Position } from "@blueprintjs/core";
import {
	ItemRenderer,
	Suggest
} from "@blueprintjs/select"
import {DateInput3} from "@blueprintjs/datetime2";

import {format} from 'date-fns';

// for global variables
import constants from '../config';

// import css libraries
import '@blueprintjs/core/lib/css/blueprint.css'; 
import '@blueprintjs/table/lib/css/table.css'; 
import '../styles/eccnhist.scss';
import '@blueprintjs/datetime2/lib/css/blueprint-datetime2.css'
import '@blueprintjs/select/lib/css/blueprint-select.css'

const EccnHist = () => {

  // ECCN history state variable
  const [eccnHistory, setEccnHistory] = useState([]);

	// dialog open state variable
	const [isDialogOpen, setDialogOpen] = useState(false);

	/**
	 * source: type of source
	 * vendor: name of vendor 
	 * reason: reason of ECCN
	 * name: ?
	 * country: country name
	 * code: AES filing code
	 */
	const [selectForm, setForm] = useImmer({
		source: '',
		reason: '',
		country: '',
		code: '',
		vendor: '',
		eccn: '',
		nlr: false,
		dos: false,
		bis: false,
		sme: false
	});

	// state variable for date
	const [selectedDate, setDate] = useState(null);

	// eccn edit form's vendor list 
	const [vendors, setVendors] = useState([]);

	// fetch state variable
	const [isFetched, setFetched] = useState(false);

	// retrieve part id
	const params = constants.getParams(window);
  const paid = params['paid'];

  const fetchData = async() => {
    try{
			const response = await fetch(`${constants.BASE_URL}/api/eccnhist?input=${paid}`, {method: 'GET'});
			const data = await response.json();
			
			// parsed the fetched data
			const parsedHistory = data.map(item => {
				const date = (item.DATEOFENTRY != null) ? format(new Date(item.DATEOFENTRY), 'yyyy-MM-dd') : '';
				const worker = (item.WORKERNAME != null) ? item.WORKERNAME : '';
				const eccn = (item.ECCN != null) ? item.ECCN : '';
				const source = (item.SOURCENAME != null) ? item.SOURCENAME : '';
				const reason = (item.REASON != null) ? item.REASON : '';
				const dos = (item.DOS_EL_REQD != null) ? item.DOS_EL_REQD : '';
				const sme = (item.SME != null) ? item.SME : '';
				const bis = (item.BIS_EL_REQD != null) ? item.BIS_EL_REQD : '';
				const nlr = (item.ISNLR != null) ? item.ISNLR : '';
				const country = (item.NLR_COUNTRY != null) ? item.NLR_COUNTRY : '';

				// parse the aes code
				const isc32 = (item.ISC32 != null) ? item.ISC32 : '';
				var aes_code;
				if (isc32 === 'Y') {
						aes_code = 'C32';
					} 
				else {
					aes_code = 'C33';
				}

				// retrieve part no as well
				const partno = (item.PARTNO != null) ? item.PARTNO : '';

				return [partno, date, worker, eccn, source, reason, dos, sme, bis, nlr, country, aes_code];
				
			})
			setEccnHistory(parsedHistory);

    } catch (error) {
      console.error("Error fetching data ", error);
    }

		// set fetching as complete
		setFetched(true);
  };
  
  // for VPO History Dialog
  const eccnCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {eccnHistory[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  };

  // column list for vpo history
  const eccnNames = ["Part No.", "Date", "Entered by", "ECCN", "Source", "Reason", "DOS", "SME", "BIS", "NLR", "Country", "AES Code"];

	// assign column widths
	const widths = {
		partno: 100,
		date: 100,
		entered: 100,
		eccn: 70,
		source: 100,
		reason: 150,
		dos: 50,
		sme: 50,
		bis: 50, 
		nlr: 50,
		country: 100,
		aes: 150
	}
	const widthValues = Object.values(widths);

  // build actual vpo history columns
  const eccnColumns = eccnNames.map((item, index) => {
    return <Column key={index} name={item} cellRenderer={eccnCellRenderer}/>
  });

	// rendor vendor menu item in ECCN edit form's vendor suggestion
	const renderVendorItem = (item, {handleClick}) => {
		return (
			<MenuItem
				roleStructure='listoption'
				text={`${item.name}`}
				selected={item.name === selectForm.vendor}
				onClick={handleClick}
			/>
		)
	}

	// vendor list filtering for ECCN edit form's vendor suggestion
	const filterVendor = (query, vendor) => {
		const normalizedVendor = vendor.name.toLowerCase();
		const normalizedQuery = query.toLowerCase();

		return `${normalizedVendor}`.indexOf(normalizedQuery) >= 0;
	}

	// for the vendor list menu item
	const renderInputValue = (item) => item.name;

	// for create new menu item option on ECCN Edit form's vendor name option
	const createVendor = (vendor) => {
		return {
			name: vendor
		}
	}

	const renderCreateMenuItem = (query, handleClick) => {
		return (
			<MenuItem
				icon="add"
				text={`Create ${query}`}
				roleStructure='listoption'
				onClick={handleClick}
				shouldDismissPopover={false}
			/>
		)
	}

	// handle Edit ECCN button click
	const handleEditEccnClick = async () => {
		setDialogOpen(!isDialogOpen);
		const response = await fetch(`${constants.BASE_URL}/api/eccnhist/vendor?input=${paid}`, {method: 'GET'});
		const data = await response.json();

		const parsedData = data.map((item, index) => {
			const vendor = (item.VENDOR != null) ? item.VENDOR : '';
			return {name: vendor}
		})

		setVendors(parsedData);
	};


	// handle save ECCN on the dialog
	const handleSaveEccnClick = () => {
		const myToaster = OverlayToaster.create({position: "top"});
		// console.log('sending:', selectForm)

		// check whether input values are valid
		if (selectedDate === null) {
			myToaster.show({
				message: "Date of Entry must be provided!",
				intent: Intent.WARNING
			});
		} else if (selectForm.source === '') {
			myToaster.show({
				message: "Source of Classification must be provided!",
				intent: Intent.WARNING
			});
		} else if (selectForm.source !== '3' && selectForm.vendor === '') {
			myToaster.show({
				message: "If source of classification is manufacturer/distributor, vendor name must be provided!",
				intent: Intent.WARNING
			});
		} else if ((selectForm.dos === true || selectForm.bis === true || selectForm.sme === true) && selectForm.eccn === '') {
			myToaster.show({
				message: "If DOS/BIS E/L Required or SME, ECCN must be provided!",
				intent: Intent.WARNING
			});
		} else if (selectForm.nlr === true && selectForm.code === '') {
			myToaster.show({
				message: "If NLR, AES filing code must be provided!",
				intent: Intent.WARNING
			});
		} else {
			try {
				fetch(`${constants.BASE_URL}/api/eccnhist?input=${paid}`, {
					method: 'POST',
					headers: {
						'Content-type' : 'application/json'
					},
					body : JSON.stringify({
						date: selectedDate,
						source: selectForm.source,
						reason: selectForm.reason,
						dos: (selectForm.dos != false) ? 'Y' : 'N',
						sme: (selectForm.sme != false) ? 'Y' : 'N',
						bis: (selectForm.bis != false) ? 'Y' : 'N',
						nlr: (selectForm.nlr != false) ? 'Y' : 'N',
						country: selectForm.country,
						vendor: selectForm.vendor,
						eccn: selectForm.eccn,
						code: (selectForm.code != 'C33') ? 'Y' : 'N'
					})
				});
			} catch (error) {
				console.error('Error executing query', error);
			}
	
			myToaster.show({
				message: "New ECCN record has been created!",
				intent: Intent.PRIMARY
			});
		}		
	};

	// properties for the date picker in ECCN edit form
	const formatDate = useCallback((date) =>  date.toLocaleDateString(), []);
	const parseDate = useCallback((str) => new Date(str), []);

	// maximum date for date picker
	const newMaxDate = new Date(2025, 12, 31);

	// customer daypicker props
	const dayProps = {
		showOutsideDays: true
	};

	// properties for the date picker in ECCN edit form
	const {...spreadProps} = {
		highlightToday: true,
		showActionsBar: true,
		shortcuts: false,
	}

	// fetch data again when ECCN edit form dialog is closed
	useEffect(() => {
		fetchData();  
	}, [isDialogOpen])

	const renderEccnHistory = () => {
		var content;
		if (isFetched) {
			if (eccnHistory.length > 0) {
				content = (
					<Table2 
						numRows={eccnHistory.length} 
						columnWidths={widthValues}
						renderMode={RenderMode.BATCH}
						className='eccn-table'
					>
						{eccnColumns}
					</Table2>
				)
			} else {
				content = (
					<NonIdealState
						icon="search"
						description={"No ECCN record found!"}
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

	const editEccnDialog = (
		<Dialog
			title="ECCN Edit Form"
			isOpen={isDialogOpen}
			onClose={() => setDialogOpen(false)}
			className='edit-dialog'
		>
			<DialogBody className='edit-form-body'>
				<ControlGroup fill={true} vertical={true}>
					<RadioGroup
						label="Source of Classification"
						onChange={(e) => setForm((form) => {form.source = e.target.value})}
						selectedValue={selectForm.source}
						inline={true}
					>
						<Radio label="MFG" value="1" />
						<Radio label="Distributor" value="2" />
						<Radio label="Self" value="3" />
					</RadioGroup>

					<Label>
						Vendor Name of the Source
						<Suggest
							query={selectForm.vendor}
							onQueryChange={(e) => setForm((form) => {form.vendor = e})}
							items={vendors}
							noResults={<MenuItem disabled={true} text="No results." roleStructure='listoption'/>}
							inputValueRenderer={renderInputValue}
							itemRenderer={renderVendorItem}
							onItemSelect={(item) => setForm((form) => {
								form.vendor = item.name;
							})}
							itemPredicate={filterVendor}
						/>
					</Label>
					<Label>
						Reason
						<HTMLSelect
							value={selectForm.reason}
							onChange={(e) => setForm((form) => {form.reason = e.target.value;})}
							options={["Grandfathered","Manufacturer does not know","Vendor does not know","No response from manufacturer/vendor"]}
						/>
					</Label>
				</ControlGroup>
				<FormGroup>
					<Label>
						Export License
						<Checkbox 
							checked={selectForm.dos}
							onChange={() => setForm((form) => {
								const prevState = form.dos;
								form.dos = !prevState;
							})}
							label="DOS E/L Required" 
						/>
						<Checkbox 
							checked={selectForm.bis}
							onChange={() => setForm((form) => {
								const prevState = form.bis;
								form.bis = !prevState;
							})}
							label="BIS E/L Required" 
						/>
						<Checkbox 
							checked={selectForm.sme}
							onChange={() => setForm((form) => {
								const prevState = form.sme;
								form.sme = !prevState;
							})}
							label="SME" 
						/>
					</Label>
					<Label>
						ECCN
						<InputGroup
							fill={false}
							value={selectForm.eccn}
							onChange={(e) => setForm((form) => {form.eccn = e.target.value})}
						/>
					</Label>
					<FormGroup label="Non-License">
						
						<Checkbox 
							checked={selectForm.nlr}
							label="NLR" 
							onChange={() => setForm((form) => {
								const prevState = form.nlr;
								form.nlr = !prevState;
							})}
						/>
						<Label>
							Country
							<HTMLSelect
								value={selectForm.country}
								onChange={(e) => setForm((form) => {form.country = e.target.value})}
								options={["KR JP","JAPAN","INDONESIA","ISRAEL","TAIWAN","TURKEY"]}
							/>
						</Label>
						<RadioGroup
							label="AES Filing Code"
							inline={true}
							selectedValue={selectForm.code}
							onChange={(e) => setForm((form) => {form.code = e.target.value})}
						>
							<Radio label="C32" value="C32" />
							<Radio label="C33" value="C33" />
						</RadioGroup>
					</FormGroup>
					<Label>
						Date of Entry
						<DateInput3
							placeholder="M/D/YYYY"
							value={selectedDate}
							onChange={setDate}
							formatDate={formatDate}
							parseDate={parseDate}
							dayPickerProps={dayProps}
							maxDate={newMaxDate}
							{...spreadProps}
						/>
					</Label>
				</FormGroup>
			</DialogBody>
			<DialogFooter actions={<Button icon="tick" onClick={handleSaveEccnClick} text="Save"/>} />
		</Dialog>
	)
    
	return (
		<div className='page'>
			{editEccnDialog}
			<Card className='eccn-info-card'>
				<div className='eccn-header'>
					<h2>
						Changed History of ECCN 
					</h2>
					<Button 
						icon="edit"
						className='edit-button'
						text="Edit ECCN" 
						onClick={handleEditEccnClick}
					/>
				</div>		
			</Card>
			<Card className='edit-table-card '>
				{renderEccnHistory()}	
			</Card>
		</div>
	);
};

export default EccnHist;
