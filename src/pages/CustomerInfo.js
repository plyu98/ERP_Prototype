import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback,
  useMemo
} from 'react';
import { 
  InputGroup, 
  Button,
  Menu,
  MenuItem,
  Tag,
  TextArea,
  Dialog,
  DialogBody,
  DialogFooter,
  Switch,
  Intent,
  FormGroup,
  Tabs,
  Tab,
  Card,
  HTMLSelect,
  Checkbox,
  NonIdealState,
  Spinner,
  CompoundTag
} from "@blueprintjs/core";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat,
  TableLoadingOption,
  ColumnHeaderCell,
  RenderMode,
  Utils
} from "@blueprintjs/table";
import '@blueprintjs/core/lib/css/blueprint.css'; 
import '@blueprintjs/table/lib/css/table.css'; 
import '../styles/custinfo.scss'
import {useImmer} from 'use-immer';
import { OverlayToaster, Position } from "@blueprintjs/core";
import {format} from 'date-fns';

import constants from '../config';

const CustomerInfo = () => {

  /**
   * states.info: customer information from fetch query
   * editable: editable state of the notes textarea
   * notes: customer notes textarea
   * infoDialogOpen: open state of info edit form
   * infoForm: info edit form
   * broker and payterm's default values are essentialy null values
   * invoiceHistory: invoice history data
   * selectedTab: currently selected tab
   * orderedParts: ordered parts data
   * sortedIndexMap: sorted index array for sorting rows
   */
  const [states, setStates] = useImmer({
    info: [''],
    editable: true,
    notes: '',
    infoDialogOpen: false,
    infoForm: {
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
    invoiceHistory: [],
    isPartsFetched: false,
    isInvoiceFetched: false,
    selectedTab: 'info',
    orderedParts: [],
    sortedIndexMap: {
      invoice: [],
      parts: []
    }
  })

  // tag properties that display customer info
  const tagProps = {
    intent: "primary",
    large: true,
    round: true,
    minimal: false,
    fill: false
  };

  // form properties for edit form
  const formProps = {
    inline: true
  }

  // retrieve the customer id
  const params = constants.getParams(window);
  const cuid = params['cuid'];

  const fetchData = async() => {
    try{
      // fetch customer info data
      const response = await fetch(`${constants.BASE_URL}/api/custinfo?input=${cuid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched customer info data
      const custMap = 
        data.map(item => {
          const title = (item.TITLE != null) ? item.TITLE : '';
          const billadd1 = (item.BILLADD1 != null) ? item.BILLADD1 : '';
          const billadd2 = (item.BILLADD2 != null) ? item.BILLADD2 : '';
          const billcity = (item.BILLCITY != null) ? item.BILLCITY : '';
          const billzip = (item.BILLZIP != null) ? item.BILLZIP : '';
          const billtell = (item.BILLTEL != null) ? item.BILLTEL : '';
          const billfax = (item.BILLFAX != null) ? item.BILLFAX : '';
          const billcontact = (item.BILLCONTACT != null) ? item.BILLCONTACT : '';
          const billemail = (item.BILLEMAIL != null) ? item.BILLEMAIL : '';

          // build full bill adress string
          const billaddr = billadd1 + billadd2 + billcity + ' ' + billzip

          const notes = (item.NOTES != null) ? item.NOTES : '';
          const shipvia = (item.SHIPVIA != null) ? item.SHIPVIA : '';
          const fob = (item.FOB != null) ? item.FOB : '';

          const shipadd1 = (item.SHIPADD1 != null) ? item.SHIPADD1 : '';
          const shipadd2 = (item.SHIPADD2 != null) ? item.SHIPADD2 : '';
          const shipcity = (item.SHIPCITY != null) ? item.SHIPCITY : '';
          const shipzip = (item.SHIPZIP != null) ? item.SHIPZIP : '';
          const shiptell = (item.SHIPTEL != null) ? item.SHIPTEL : '';
          const shipfax = (item.SHIPFAX != null) ? item.SHIPFAX : '';
          const shipcontact = (item.SHIPCONTACT != null) ? item.SHIPCONTACT : '';
          const shipemail = (item.SHIPEMAIL != null) ? item.SHIPEMAIL : '';

          // build full ship adress string
          const shipaddr = shipadd1 + shipadd2 + shipcity + ' ' + shipzip
          const acctno = (item.ACCTNO != null) ? item.ACCTNO : '';

          // ! broker id 1 is SKI; only broker so far?
          const brokerid = (item.CAT != null) ? item.CAT : 0;
          var broker;
          if (brokerid === 1) {
            broker = 'SKI';
          } else {
            broker = 'None';
          }

          // parse the payterm according to the payint
          var payterm;
          const payint = (item.PAYINT != null) ? item.PAYINT : -5;
          if (payint == 30) {
            payterm = 'Net 30 Days';
          } else if (payint == 0) {
            payterm = 'C.O.D';
          } else if (payint == -1) {
            payterm = 'LC/TD';
          } else if (payint == -2) {
            payterm = 'Credit Card';
          } else if (payint == -3) {
            payterm = 'Prepay'
          } else if (payint == 15) {
            payterm = 'Net 15 Days';
          } else if (payint == 45) {
            payterm = 'Net 45 Days';
          } else if (payint == 60) {
            payterm = 'Net 60 Days';
          } else if (payint == 70) {
            payterm = 'Net 70 Days';
          } else if (payint == 75) {
            payterm = 'Net 75 Days';
          } else if (payint == 90) {
            payterm = 'Net 90 Days';
          } else if (payint == 120) {
            payterm = 'Net 120 Days';
          } else if (payint == 360) {
            payterm = 'Net 360 Days';
          } else {
            payterm = 'None';
          }

          // store existing values into the info edit form
          setStates((state) => {
            state.infoForm.billaddr1 = billadd1;
            state.infoForm.billaddr2 = billadd2;
            state.infoForm.billcity = billcity;
            state.infoForm.billzip = billzip;
            state.infoForm.billtel = billtell;
            state.infoForm.billfax = billfax;
            state.infoForm.billcontact = billcontact;
            state.infoForm.billemail = billemail;
            state.infoForm.shipaddr1 = shipadd1;
            state.infoForm.shipaddr2 = shipadd2;
            state.infoForm.shipcity = shipcity;
            state.infoForm.shipzip = shipzip;
            state.infoForm.shiptel = shiptell;
            state.infoForm.shipfax = shipfax;
            state.infoForm.shipcontact = shipcontact;
            state.infoForm.shipemail = shipemail;
            state.infoForm.shipvia = shipvia;
            state.infoForm.fob = fob;
            state.infoForm.accountno = acctno;
            state.infoForm.broker = broker;
            state.infoForm.payterm = payterm;
          })
          
          return [title, billaddr, billtell, billfax, billcontact, billemail, shipaddr, shiptell, shipfax, shipcontact, shipemail, shipvia, fob, acctno, broker, payterm, notes];
      })[0];

      // update states based on the fetched and parsed data
      setStates(state => {
        state.info = custMap;
        state.notes = custMap[16];
      })

    } catch (error) {
      console.error("Error fetching data ", error);
    }
  };

  // handle fetching data for invoice history
  const fetchInvData = async() => {
    // fetch customer's invoice history
    const invResponse = await fetch(`${constants.BASE_URL}/api/custinfo/invoice?input=${cuid}`, {method: 'GET'});
    const invData = await invResponse.json();

    // parse the invoice history data
    const invMap = 
    invData.map(item => {
      const shipno = (item.SMID != null) ? item.SMID : '';
      const paid = (item.PAID != null) ? item.PAID : '';
      const invno = (item.INVNO != null) ? item.INVNO : '';
      const date = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
      const cpid = (item.CPID != null) ? item.CPID : '';
      const expense = (item.FREIGHT != null) ? item.FREIGHT : '';
      const paidDate = (item.PAIDDATE != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
      const billedamt = (item.BILLEDAMT != null) ? Math.round(item.BILLEDAMT*100)/100 : '';
      const numitems = (item.NUMITEMS != null) ? item.NUMITEMS : '';
      const amount = (item.AMOUNT != null) ? item.AMOUNT : '';
      const shipvia = (item.SHIPVIA != null) ? item.SHIPVIA : '';
      const refno = (item.REFNO != null) ? item.REFNO : '';

      return [shipno, paid, invno, date, cpid, expense, paidDate, billedamt, numitems, amount, shipvia, refno];
    });

    setStates((state) => {
      state.invoiceHistory = invMap;
      state.isInvoiceFetched = true;
    })
  }

  // handle fetching data for ordered parts 
  const fetchPartsData = async() => {
    // fetch customer's ordered parts data
    const response = await fetch(`${constants.BASE_URL}/api/custinfo/parts?input=${cuid}`, {method: 'GET'});
    const data = await response.json();

    // parse the ordered parts data
    const parsed = 
    data.map(item => {
      const partno = (item.PARTNO != null) ? item.PARTNO : '';
      const descr = (item.DESCRIPTION != null) ? item.DESCRIPTION : '';
      const total = (item.TOTAL != null) ? Math.round(item.TOTAL*100)/100 : '';
      const date = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
      const cpid = (item.CPID != null) ? item.CPID : '';
      const paid = (item.PAID != null) ? item.PAID : '';

      return [partno, descr, total, date, cpid, paid];
    });

    setStates((state) => {
      state.orderedParts = parsed;
      state.isPartsFetched = true;
    })
  }

  // handle the edit notes switch
  const handleEditSwitch = () => {
    setStates(state => {
      const prevState = state.editable;
      state.editable = !prevState;
    })
  };

  // handle the edit info button
  const handleEditInfoClick = () => {
    setStates(state => {
      state.infoDialogOpen = true
    });
  }

  // handle closing the edit dialog
  const handleCloseEditDialog = () => {
    setStates((state) => {
      state.infoDialogOpen = false;
    })
  }

  // handle 'save info' button in the info edit form dialog
  const handleSaveInfoClick = () => {
    const toaster = OverlayToaster.create({position: "top"});
    // parse the broker and payterm value
    var brokerid;
    const broker = states.infoForm.broker;
    if (broker === 'SKI') {
      brokerid = 1;
    } else {
      brokerid = 0;
    }

    var payint;
    const payterm = states.infoForm.payterm;
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
    try {
      fetch(`${constants.BASE_URL}/api/custinfo/info?input=${cuid}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          billaddr1: states.infoForm.billaddr1,
          billaddr2: states.infoForm.billaddr2,
          billcity: states.infoForm.billcity,
          billzip: states.infoForm.billzip,
          billtel: states.infoForm.billtel,
          billfax: states.infoForm.billfax,
          billcontact: states.infoForm.billcontact,
          billemail: states.infoForm.billemail,
          shipaddr1: states.infoForm.shipaddr1,
          shipaddr2: states.infoForm.shipaddr2,
          shipcity: states.infoForm.shipcity,
          shipzip: states.infoForm.shipzip,
          shiptel: states.infoForm.shiptel,
          shipfax: states.infoForm.shipfax,
          shipcontact: states.infoForm.shipcontact,
          shipemail: states.infoForm.shipemail,
          shipvia: states.infoForm.shipvia,
          fob: states.infoForm.fob,
          accountno: states.infoForm.accountno,
          broker: brokerid,
          payterm: payint
        })
      }) 

      toaster.show({
        message: "Customer info has been edited!",
        intent: Intent.SUCCESS
      })
    } catch (error) {
      console.error('Error posting customer info', error);
      toaster.show({
        message: "Error occurred in editing customer info",
        intent: Intent.WARNING
      })
    }
    handleCloseEditDialog();
  }

  // handle save notes button
  const handleSaveNotesClick = () => {

    // initialize the toaster
    const myToaster = OverlayToaster.create({position: "top"});
    
    // check if notes have been edited
    if (states.editable === true) {
      myToaster.show({
        message: "Notes have not been edited!",
        intent: Intent.WARNING
      });
      return;
    } else {
      try {
        fetch(`${constants.BASE_URL}/api/custinfo/notes?input=${cuid}`, {
          method: 'POST',
          headers: {
            'Content-type' : 'application/json'
          },
          body: JSON.stringify({
            notes: states.notes
          })
        })
      } catch (error) {
        console.error('Error posting customer notes', error);
      }
      myToaster.show({
        message: "Notes have been saved.",
        intent: Intent.PRIMARY
      });
    }
  };

  // column name list for invoice history table
  const invoiceColNames = ["Ship No.","Paid","Inv. No.","Ship Date","CPO ID","Expense","Paid Date","Billed Amount","Items","Amount","Ship Via","Ref No."]

  // column cell renderer of invoice history table
  const invoiceCellRenderer = (rowIndex, columnIndex) => {

    // check for sorted row index if it exists
    const sortedRowIndex = states.sortedIndexMap.invoice[rowIndex];
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex;
    }

    // render cell as checkbox for 'PAID' column
    if (columnIndex == 1) {
      var checked;
      const paid = states.invoiceHistory[rowIndex][columnIndex];
      if (paid == 'Y') {
        checked = true;
      } else {
        checked = false;
      }
      return (
        <Cell interactive={true}>
          <Checkbox
            className="paid-checkbox"
            checked={checked}
            disabled={false}
          />
        </Cell>
      )
    } else {
      // add $ sign to expense, billed amount, and amount columns
      if (columnIndex == 5 || columnIndex == 7 || columnIndex == 9){
        return (
          <Cell interactive={true}>
            <TruncatedFormat detectTruncation={true}>
              {`$${states.invoiceHistory[rowIndex][columnIndex]}`}
            </TruncatedFormat>
        </Cell>
        )
      } else {
        return (
          <Cell interactive={true}>
            <TruncatedFormat detectTruncation={true}>
              {states.invoiceHistory[rowIndex][columnIndex]}
            </TruncatedFormat>
          </Cell>
        )
      }
    }
  }

  // invoice history table header renderer
  const renderInvHeaderRenderer = (index) => {
    return (
      <ColumnHeaderCell 
        name={invoiceColNames[index]} 
        index={index} 
        nameRenderer={constants.renderName} 
        menuRenderer={() => menuRenderer(index)}
      />
    )
  }

  // invoice history table columns
  const invoiceColumns = invoiceColNames.map((index) => {
    return <Column key={index} cellRenderer={invoiceCellRenderer} columnHeaderCellRenderer={renderInvHeaderRenderer}/>
  });

  // handle double-click for 'partno' column in ordered parts table
  const handleDoubleClick = (rowIndex, columnIndex) => {
    // part id is at column index 5
    const paid = states.orderedParts[rowIndex][5];
    const baseUrl = window.location.href.split('#')[0];
    const url = baseUrl+`#/partinfo?paid=${paid}`;
    const title = 'Part Info';
    window.electronAPI.openWindow([url, title])
  }

  // ordered parts table column names
  const partsColNames = ["Part No.", "Description", "Order Amount", "Ordered Date", "CPO ID"];

  // cell renderer for ordered parts table
  const partsCellRenderer = (rowIndex, columnIndex) => {
    // check for sorted row index if it exists
    const sortedRowIndex = states.sortedIndexMap.parts[rowIndex];
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex;
    }


    // add dollar sign to 'cumulative amount' column
    if (columnIndex == 2) {
      return (
        <Cell interactive={true}>
          <TruncatedFormat detectTruncation={true}>
            {`$${states.orderedParts[rowIndex][columnIndex]}`}
          </TruncatedFormat>
        </Cell>
      )
    } 
    // add double-click feature to the 'partno' column
    else if (columnIndex == 0) {
      return (
        <Cell interactive={true}>
          <div onDoubleClick={() => handleDoubleClick(rowIndex, columnIndex)}>
            {states.orderedParts[rowIndex][columnIndex]}
          </div>
        </Cell>
      )
    } else {
      return (
        <Cell interactive={true}>
          <TruncatedFormat detectTruncation={true}>
            {states.orderedParts[rowIndex][columnIndex]}
          </TruncatedFormat>
        </Cell>
      )
    }
  };

  // compare function for sorting columns in the ordered parts history table
  const compareAmt = (a, b) => {
    return a - b;
  }

  // sort columns in ordered parts history table
  const sortColumn = (columnIndex, comparator) => {
    // determine appropriate data for the selected panel
    var data;
    if (states.selectedTab == 'invoice') {
      data = states.invoiceHistory;
    } else if (states.selectedTab == 'parts') {
      data = states.orderedParts;
    }

    // initializes array for sorted indices
    const sortedIndexMap = Utils.times(data.length, (i) => i);
    sortedIndexMap.sort((a,b) => {
      return comparator(data[a][columnIndex], data[b][columnIndex])
    });
    
    setStates((state) => {
      if (states.selectedTab == 'invoice') {
        state.sortedIndexMap.invoice = sortedIndexMap;
      } else if (states.selectedTab == 'parts') {
        state.sortedIndexMap.parts = sortedIndexMap;
      }
    });
  }

  // menu renderer for ordered parts history table
  const menuRenderer = (index) => {
    const sortAsc = (index) => {

      // convert values to date for 'most recent ordered date' column
      if (index == 3) {
        sortColumn(index, (a,b) => compareAmt(new Date(a), new Date(b)));
      } else {
        sortColumn(index, (a,b) => compareAmt(a,b));
      }
    }
    const sortDesc = (index) => {
      // convert values to date for 'most recent ordered date' column
      if (index == 3) {
        sortColumn(index, (a,b) => compareAmt(new Date(b), new Date(a)));
      } else {
        sortColumn(index, (a,b) => compareAmt(b,a));
      }
    }
    return (
      <Menu>
        <MenuItem icon="sort-asc" text="Sort Asc" onClick={() => sortAsc(index)}/>
        <MenuItem icon="sort-desc" text="Sort Desc" onClick={() => sortDesc(index)}/>
      </Menu>
    )
  }

  // column header renderer for ordered parts table
  const renderPartsHeader = (index) => {
    return (
      <ColumnHeaderCell 
        name={partsColNames[index]} 
        index={index} 
        nameRenderer={constants.renderName} 
        menuRenderer={() => menuRenderer(index)} 
      />
    );
  };

  // ordered parts table columns
  const partsColumns = partsColNames.map((index) => {
    return <Column key={index} cellRenderer={partsCellRenderer} columnHeaderCellRenderer={renderPartsHeader} />
  });

  // table loading state
  const getLoadingOptions = () => {
    const loadingOptions = [];
    if (states.selectedTab == 'invoice') {
      if (states.isInvoiceFetched !== true) {
        loadingOptions.push(TableLoadingOption.CELLS);
      }
    } else if (states.selectedTab == 'parts') {
      if (states.isPartsFetched !== true) {
        loadingOptions.push(TableLoadingOption.CELLS);
      }
    }
    return loadingOptions;
  };

  useEffect(() => {
    fetchData();  
  }, [states.infoDialogOpen]);

  const custTagNames = [
    "Bill Address",
    "Bill Tel",
    "Bill Fax",
    "Bill Contact",
    "Bill Email",
    "Ship Address",
    "Ship Tel",
    "Ship Fax",
    "Ship Contact",
    "Ship Email",
    "Ship Via",
    "FOB",
    "Account No.",
    "Broker",
    "Payterm"
  ]
  const custInfoTags = custTagNames.map((item, index) => {
    return (
      <CompoundTag
        key={index+1}
        leftContent={item}
        children={states.info[index+1]}
        round={tagProps.round}
        minimal={tagProps.minimal}
        intent={Intent.NONE}
        large={tagProps.large}
        className='cust-info-tag'
        fill={tagProps.fill}
      />
    )
  })

  const editCustInfoDialog = (
    <Dialog
      title="Customer Info Edit Form"
      isOpen={states.infoDialogOpen}
      onClose={handleCloseEditDialog}
      style={{width: '800px', height: '750px'}}
    >
      <DialogBody>
        <FormGroup 
          inline={formProps.inline}
          label="Bill Addr1"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billaddr1}
            onChange={(e) => setStates((state) => {
              state.infoForm.billaddr1 = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Bill Addr2"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billaddr2}
            onChange={(e) => setStates((state) => {
              state.infoForm.billaddr2 = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Bill City"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billcity}
            onChange={(e) => setStates((state) => {
              state.infoForm.billcity = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Bill Zip"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billzip}
            onChange={(e) => setStates((state) => {
              state.infoForm.billzip = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Bill Tel"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billtel}
            onChange={(e) => setStates((state) => {
              state.infoForm.billtel = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Bill Fax"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billfax}
            onChange={(e) => setStates((state) => {
              state.infoForm.billfax = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Bill Contact"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billcontact}
            onChange={(e) => setStates((state) => {
              state.infoForm.billcontact = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Bill Email"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.billemail}
            onChange={(e) => setStates((state) => {
              state.infoForm.billemail = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Addr1"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.shipaddr1}
            onChange={(e) => setStates((state) => {
              state.infoForm.shipaddr1 = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Addr2"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.shipaddr2}
            onChange={(e) => setStates((state) => {
              state.infoForm.shipaddr2 = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship City"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.shipcity}
            onChange={(e) => setStates((state) => {
              state.infoForm.shipcity = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Zip"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.shipzip}
            onChange={(e) => setStates((state) => {
              state.infoForm.shipzip = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Tel"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.shiptel}
            onChange={(e) => setStates((state) => {
              state.infoForm.shiptel = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Fax"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.shipfax}
            onChange={(e) => setStates((state) => {
              state.infoForm.shipfax = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Contact"
          className='form-label'
        >
          <InputGroup
            className='form-input' 
            value={states.infoForm.billcontact}
            onChange={(e) => setStates((state) => {
              state.infoForm.billcontact = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Email"
          className='form-label'
        >
          <InputGroup
            className='form-input' 
            value={states.infoForm.shipemail}
            onChange={(e) => setStates((state) => {
              state.infoForm.shipemail = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Ship Via"
          className='form-label'
        >
          <InputGroup
            className='form-input' 
            value={states.infoForm.shipvia}
            onChange={(e) => setStates((state) => {
              state.infoForm.shipvia = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="F.O.B"
          className='form-label'
        >
          <InputGroup
            className='form-input' 
            value={states.infoForm.fob}
            onChange={(e) => setStates((state) => {
              state.infoForm.fob = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Account No."
          className='form-label'
        >
          <InputGroup
            className='form-input' 
            value={states.infoForm.accountno}
            onChange={(e) => setStates((state) => {
              state.infoForm.accountno = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup
          inline={formProps.inline}
          label="Broker"
          className='form-label'
        >
          <HTMLSelect
            value={states.infoForm.broker}
            onChange={(e) => setStates((state) => {
              state.infoForm.broker = e.target.value;
            })}
            options={['SKI','None']}
          />
        </FormGroup>
        <FormGroup
          inline={formProps.inline}
          label="Pay Term"
          className='form-label'
        >
          <HTMLSelect
            value={states.infoForm.payterm}
            onChange={(e) => setStates((state) => {
              state.infoForm.payterm = e.target.value;
            })} 
            options={['None','Prepay','C.O.D','LC/TD','Credit Card','Net 15 Days','Net 30 Days','Net 45 Days','Net 60 Days','Net 70 Days','Net 75 Days','Net 90 Days','Net 120 Days','Net 360 Days']}
          />
        </FormGroup>
      </DialogBody>
      <DialogFooter actions={<Button icon="tick" text="Save" onClick={handleSaveInfoClick}/>} />
    </Dialog>
  )

  const infoPanel = (
    <>
      {editCustInfoDialog}
      <Card>
        <div className='name'>
          <h2>{states.info[0]}</h2>
          <Button icon="edit" className='edit-button' text="Edit Info" onClick={handleEditInfoClick}/>
        </div>
        {custInfoTags}
        {/* <dl>
          <dt>Bill Address</dt>
          <dd>
            {states.info[1] && <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[1]}</Tag>}
          </dd>
          <dt>Bill Tel/Fax</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[2]}</Tag>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[3]}</Tag>
          </dd>
          <dt>Bill Contact</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[4]}</Tag>
          </dd>
          <dt>Bill Email</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[5]}</Tag>
          </dd>
          <dt>Ship Address</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[6]}</Tag>
          </dd>
          <dt>Ship Tel/Fax</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[7]}</Tag>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[8]}</Tag>
          </dd>
          <dt>Ship Contact</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[9]}</Tag>
          </dd>
          <dt>Ship Email</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[10]}</Tag>
          </dd>
          <dt>Ship Via</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[11]}</Tag>
          </dd>
          <dt>F.O.B</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[12]}</Tag>
          </dd>
          <dt>Account No.</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[14]}</Tag>
          </dd>
          <dt>Broker</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[15]}</Tag>
          </dd>
          <dt>Payterm</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[16]}</Tag>
          </dd>
        </dl> */}
      </Card>
      <Card className='memo-card'>
        <div className='memo-header'>
          <div className='left-section'>
            <h2>Memo</h2>
            <Switch label="Edit Notes" onClick={handleEditSwitch}/>
          </div>
          <div className='right-section'>
            <Button icon="tick" className='save-button' text="Save Notes" onClick={handleSaveNotesClick} />
          </div>
        </div>
        <TextArea
          fill={true}
          value={states.notes}
          readOnly={states.editable}
          onChange={e => {
            setStates(state => {
              state.notes = e.target.value
            })
          }}
          large={true}
          className='custom-notes'
        />
      </Card>
    </>
  );

  // column width values for the invoice history table
  const widths = {
    shipno: 100,
    paid: 50,
    invno: 100,
    date: 100,
    cpoid: 100,
    expense: 100,
    paidDate: 100,
    billedamt: 120,
    items: 60,
    amount: 90,
    shipvia: 100,
    refno: 100
  }
  const widthValues = Object.values(widths)

  // column width values for the ordered parts table
  const partsWidths = {
    partno: 160,
    description: 180,
    totalamt: 180,
    date: 230,
    cpid: 180
  }
  const partsWidthValues = Object.values(partsWidths);

  // saves the ordered parts history table to csv file with the selected row range
  const handleExportClick = async(region) => {
    // initialize the toaster
    const myToaster = OverlayToaster.create({position: "top"});

    // retrieve selection region's row and column range
    const selectedRegion = region[0]
    const startRow = selectedRegion.rows[0];
    const endRow = selectedRegion.rows[1];
    const startCol = selectedRegion.cols[0];
    const endCol = selectedRegion.cols[1];

    // determine appropriate headers and data array for the selected panel
    var colNames;
    var data;
    var sortedIndexMap;
    if (states.selectedTab === 'invoice') {
      colNames = invoiceColNames;
      data = states.invoiceHistory;
      sortedIndexMap = states.sortedIndexMap.invoice;
    } else if (states.selectedTab === 'parts') {
      colNames = partsColNames;
      data = states.orderedParts;
      sortedIndexMap = states.sortedIndexMap.parts;
    }

    // put column names inside array to concatenate them with the values array
    const headers = [colNames.slice(startCol, endCol+1)];
    var values;

    // retrieved sorted indices if exist
    if (sortedIndexMap.length !== 0) {
      const sorted = sortedIndexMap.slice(startRow, endRow+1);
      values = sorted.map(row => {
        return data[row].slice(startCol, endCol+1);
      })
      
      
    } else {
      values = data.slice(startRow, endRow+1).map(row => {
          return row.slice(startCol, endCol+1)
      })
      
    }
    const selected = headers.concat(values);
    const result = await window.electronAPI.saveCsv(selected);
    if (!result) {
      myToaster.show({
        message: "Saving canceled.",
        intent: Intent.NONE
      })
    } else {
      myToaster.show({
        message: "CSV file has been saved.",
        intent: Intent.PRIMARY
      })
    }
  }

  // body context menu for the ordered parts history table
  const renderContextMenu = (event) => {
    return (
      <Menu>
        <MenuItem text="Export to CSV" onClick={() => handleExportClick(event.selectedRegions)}/>
      </Menu>
    )
  }

  const renderInvoicePanel = () => {
    var content;
    if (states.isInvoiceFetched) {
      if (states.invoiceHistory.length > 0) {
        content = (
          <Table2
            numRows={states.invoiceHistory.length}
            renderMode={RenderMode.BATCH}
            columnWidths={widthValues}
            cellRendererDependencies={states.sortedIndexMap.invoice}
            bodyContextMenuRenderer={renderContextMenu}
          >
            {invoiceColumns}
          </Table2>
        )
      } else {
        content = (
          <NonIdealState
            icon="search"
            description={"No invoice record found!"}
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

  const renderPartsPanel = () => {
    var content;
    if (states.isPartsFetched) {
      if (states.orderedParts.length > 0) {
        content = (
          <Table2
            numRows={states.orderedParts.length}
            renderMode={RenderMode.BATCH}
            columnWidths={partsWidthValues}
            cellRendererDependencies={states.sortedIndexMap.parts}
            bodyContextMenuRenderer={renderContextMenu}
          >
            {partsColumns}
          </Table2>
        )
      } else {
        content = (
          <NonIdealState
            icon="search"
            description={"No ordered parts record found!"}
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

  // customer's invoice history panel
  const invoicePanel = (
    <>
      <Card className='cust-invoice-card'>
        {renderInvoicePanel()}
      </Card>
    </>
  );

  // ordered parts panel
  const partsPanel = (
    <>
      <Card className='cust-parts-card'>
        {renderPartsPanel()}
      </Card>
    </>
  )

  // handle tab selection change
  const handleTabChange = (newTabId) => {
    setStates((state) => {
      state.selectedTab = newTabId;
    });

    // fetch data according to the selected id
    if (newTabId == 'info') {
      fetchData();
    } else if (newTabId == 'invoice') {
      fetchInvData();
    } else if (newTabId == 'parts') {
      fetchPartsData();
    }
  }

  return (
    <div className='page'>
      <Tabs
        vertical={false}
        className='tabs'
        large={true}
        renderActiveTabPanelOnly={true}
        selectedTabId={states.selectedTab}
        onChange={handleTabChange}
      >
        <Tab id="info" title="Info" panel={infoPanel} />
        <Tab id="invoice" title="Invoice" panel={invoicePanel} />
        <Tab id="parts" title="Ordered Parts" panel={partsPanel} />
      </Tabs>
    </div>
  );
};

export default CustomerInfo;
