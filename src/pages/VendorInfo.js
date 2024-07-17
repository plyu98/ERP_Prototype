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
import '../styles/vendinfo.scss'
import {useImmer} from 'use-immer';
import { OverlayToaster, Position } from "@blueprintjs/core";
import {format} from 'date-fns';

import constants from '../config';

const VendorInfo = () => {

  const partsTableRef = useRef(null);
  /**
   * states.info: customer information from fetch query
   * editable: editable state of the notes textarea
   * notes: customer notes textarea
   * infoDialogOpen: open state of info edit form
   * infoForm: info edit form
   * broker and payterm's default values are essentialy null values
   * invoiceHistory: invoice history data
   * isInfoFetched: whether info fetch is complete
   * selectedTab: currently selected tab
   * orderedParts: ordered parts data
   * sortedIndexMap: sorted index array for sorting rows
   */
  const [states, setStates] = useImmer({
    editable: true,
    notes: '',
    infoDialogOpen: false,
    infoForm: {
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
    info: [],
    vpoHistory: [],
    vpoParts: [],
    payableHistory: [],
    carryingParts: [],
    partsQuotHist: [],
    isFetched: {
      info: false,
      vpo: false,
      history: false,
      parts: false
    },
    selectedTab: 'info',
    sortedIndexMap: {
      vpo: [],
      history: [],
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

  // retrieve the vendor id
  const params = constants.getParams(window);
  const vdid = params['vdid'];

  // retrieve the base url
  const baseUrl = window.location.href.split('#')[0];

  const fetchInfoData = async() => {
    try{
      // fetch customer info data
      const response = await fetch(`${constants.BASE_URL}/api/vendinfo?input=${vdid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched customer info data
      const vendMap = 
        data.map(item => {
          const title = (item.NAME != null) ? item.NAME : '';
          const add1 = (item.ADD1 != null) ? item.ADD1 : '';
          const add2 = (item.ADD2 != null) ? item.ADD2 : '';
          const city = (item.CITY != null) ? item.CITY : '';
          const zip = (item.ZIP != null) ? item.ZIP : '';
          const tell = (item.TEL != null) ? item.TEL : '';
          const fax = (item.FAX != null) ? item.FAX : '';
          const contact = (item.CONTACT != null) ? item.CONTACT : '';
          const email = (item.EMAIL != null) ? item.EMAIL : '';

          // build full address
          const addr = add1 + add2 + city + ' ' + zip

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
          const acctno = (item.ACCTNO != null) ? item.ACCTNO : '';

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
            state.infoForm.addr1 = add1;
            state.infoForm.addr2 = add2;
            state.infoForm.city = city;
            state.infoForm.zip = zip;
            state.infoForm.tel = tell;
            state.infoForm.fax = fax;
            state.infoForm.contact = contact;
            state.infoForm.email = email;
            state.infoForm.billaddr1 = billadd1;
            state.infoForm.billaddr2 = billadd2;
            state.infoForm.billcity = billcity;
            state.infoForm.billzip = billzip;
            state.infoForm.billtel = billtell;
            state.infoForm.billfax = billfax;
            state.infoForm.billcontact = billcontact;
            state.infoForm.billemail = billemail;
            state.infoForm.accountno = acctno;
            state.infoForm.payterm = payterm;
          })
          
          return [title, addr, tell, fax, contact, email, billaddr, billtell, billfax, billcontact, billemail, acctno, payterm, notes];
      })[0];

      // // mark info fetch as complete
      // setStates((state) => {
      //   state.isInfoFetched = true;
      // })

      // update states based on the fetched and parsed data
      setStates(state => {
        state.info = vendMap;
        state.notes = vendMap[13];
        state.isFetched.info = true;
      })

    } catch (error) {
      console.error("Error fetching data ", error);
    }
  };

  // fetch vpo history data
  const fetchVpo = async() => {
    try {
      // fetch vpo history data
      const response = await fetch(`${constants.BASE_URL}/api/vendinfo/vpohist?input=${vdid}`, {method: 'GET'});
      const data = await response.json();

      // parse the data
      const parsed = data.map(item => {
        const poid = (item.VPID != null) ? item.VPID : '';
        const ponum = (item.PONUM != null) ? item.PONUM : '';
        const date = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
        const orderby = (item.USERID != null) ? item.USERID : '';
        const ack = (item.ASKNOW != null) ? item.ASKNOW : ''; 
        const vrn = (item.YOURREFNO != null) ? item.YOURREFNO : '';
        const shipvia = (item.SHIPVIA != null) ? item.SHIPVIA : '';
        const vptype = (item.VPTYPE != null) ? item.VPTYPE : '';

        return [poid, ponum, date, orderby, ack, vrn, shipvia, vptype]
      })

      setStates((state) => {
        state.vpoHistory = parsed;
        state.isFetched.vpo = true;
      })
    } catch (error) {
      console.error("Error fetching vpo data", error);
    }
  }

  // fetch vendor invoice data
  const fetchInvData = async() => {
    try {
      const response = await fetch(`${constants.BASE_URL}/api/vendinfo/invoice?input=${vdid}`, {method: 'GET'});
      const data = await response.json();

      // parse the data
      const parsed = data.map(item => {
        const invid = (item.VNID != null) ? item.VNID : '';
        const invno = (item.INVNO != null) ? item.INVNO : '';
        const cpono = (item.ORDERNO != null) ? item.ORDERNO : '';
        const vpono = (item.PONUM != null) ? item.PONUM : '';
        const date = (item.DATES != null) ? format(new Date(item.DATES), 'yyyy-MM-dd') : '';
        const paid = (item.PAID != null) ? item.PAID : '';
        const paidDate = (item.PAIDDATE != null) ? format(new Date(item.PAIDDATE), 'yyyy-MM-dd') : '';
        const amount = (item.AMOUNT != null) ? item.AMOUNT : '';
        const cat = (item.CATID != null) ? item.CATID : '';
        const expense = (item.FREIGHTCHG != null) ? Math.round(item.FREIGHTCHG*100)/100 : '';
        const checkno = (item.CHECKNO != null) ? item.CHECKNO : '';
        const recvid = (item.PARTIAL_INV_RECVID != null) ? item.PARTIAL_INV_RECVID : '';
        const bank = (item.BNK != null) ? item.BNK : '';

        return [invid, invno, cpono, vpono, date, paid, paidDate, amount, cat, expense, checkno, recvid, bank]
      })
      
      setStates((state) => {
        state.payableHistory = parsed;
        state.isFetched.history = true;
      })
    } catch (error) {
      console.error("Error fetching vpo data", error);
    }
  }

  // fetch carrying parts data
  const fetchPartsData = async() => {
    try {
      const response = await fetch(`${constants.BASE_URL}/api/vendinfo/parts?input=${vdid}`, {method: 'GET'});
      const data = await response.json();

      // parse the data
      const parsed = data.map(item => {
        const partno = (item.PARTNO != null) ? item.PARTNO : '';
        const descr = (item.DESCRIPTION != null) ? item.DESCRIPTION : '';
        const quoteCount = (item.COUNT != null) ? item.COUNT : '';
        const paid = (item.PAID != null) ? item.PAID : '';

        return [partno, descr, quoteCount, paid]
      })
      
      setStates((state) => {
        state.carryingParts = parsed;
        state.isFetched.parts = true;
      })
    } catch (error) {
      console.error("Error fetching vpo data", error);
    }
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
  // handle closing edit info dialog
  const handleClostEditDialog = () => {
    setStates((state) => {
      state.infoDialogOpen = false;
    })
  }

  // handle 'save info' button in the info edit form dialog
  const handleSaveInfoClick = () => {
    const toaster = OverlayToaster.create({position: "top"});
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
      fetch(`${constants.BASE_URL}/api/vendinfo/info?input=${vdid}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          addr1: states.infoForm.addr1,
          addr2: states.infoForm.addr2,
          city: states.infoForm.city,
          zip: states.infoForm.zip,
          tel: states.infoForm.tel,
          fax: states.infoForm.fax,
          contact: states.infoForm.contact,
          email: states.infoForm.email,
          billaddr1: states.infoForm.billaddr1,
          billaddr2: states.infoForm.billaddr2,
          billcity: states.infoForm.billcity,
          billzip: states.infoForm.billzip,
          billtel: states.infoForm.billtel,
          billfax: states.infoForm.billfax,
          billcontact: states.infoForm.billcontact,
          billemail: states.infoForm.billemail,
          accountno: states.infoForm.accountno,
          payterm: payint
        })
      }) 
      toaster.show({
        message: "Vendor info edit has been saved!",
        intent: Intent.SUCCESS
      })
    } catch (error) {
      console.error('Error posting customer info', error);
      toaster.show({
        message: "Vendor info edit failed!",
        intent: Intent.WARNING
      })
    }
    handleClostEditDialog();
  }

  // handle save notes button
  const handleSaveNotesClick = () => {

    // initialize the toaster
    const myToaster = OverlayToaster.create({position: "bottom"});
    
    // check if notes have been edited
    if (states.editable === true) {
      myToaster.show({
        message: "Notes have not been edited!",
        intent: Intent.WARNING
      });
      return;
    } else {
      try {
        fetch(`${constants.BASE_URL}/api/vendinfo/notes?input=${vdid}`, {
          method: 'POST',
          headers: {
            'Content-type' : 'application/json'
          },
          body: JSON.stringify({
            notes: states.notes
          })
        })
      } catch (error) {
        console.error('Error posting vendor notes', error);
      }
      myToaster.show({
        message: "Notes have been saved.",
        intent: Intent.PRIMARY
      });
    }
  };

  useEffect(() => {
    fetchInfoData();  
  }, [states.infoDialogOpen]);

  // set focus to the first cell when tables are rendered
  useEffect(() => {
    if (states.isFetched.vpo) {
      handleVpoFocusChange({row: 0});
    }

    if (states.isFetched.parts) {
      handlePartsFocusChange({row: 0})
    }
  }, [states.isFetched.vpo, states.isFetched.parts])


  // loading options for tabls
  const getLoadingOptions = () => {
    const loadingOptions = [];
    if (states.selectedTab == 'vpo') {
      if (states.isFetched.vpo !== true) {
        loadingOptions.push(TableLoadingOption.CELLS);
      }
    } else if (states.selectedTab == 'invoice') {
      if (states.isFetched.history !== true) {
        loadingOptions.push(TableLoadingOption.CELLS);
      }
    } else if (states.selectedTab == 'parts') {
      if (states.isFetched.parts !== true) {
        loadingOptions.push(TableLoadingOption.CELLS);
      }
    }
    return loadingOptions;
  }

  const editVendorInfoDialog = (
    <Dialog
      title="Vendor Info Edit Form"
      isOpen={states.infoDialogOpen}
      onClose={handleClostEditDialog}
      style={{width: '800px', height: '700px'}}
    >
      <DialogBody>
        <FormGroup 
          inline={formProps.inline}
          label="Addr1"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.addr1}
            onChange={(e) => setStates((state) => {
              state.infoForm.addr1 = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Addr2"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.addr2}
            onChange={(e) => setStates((state) => {
              state.infoForm.addr2 = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="City"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.city}
            onChange={(e) => setStates((state) => {
              state.infoForm.city = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Zip"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.zip}
            onChange={(e) => setStates((state) => {
              state.infoForm.zip = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Tel"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.tel}
            onChange={(e) => setStates((state) => {
              state.infoForm.tel = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Fax"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.fax}
            onChange={(e) => setStates((state) => {
              state.infoForm.fax = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Contact"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.contact}
            onChange={(e) => setStates((state) => {
              state.infoForm.contact = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Email"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.infoForm.email}
            onChange={(e) => setStates((state) => {
              state.infoForm.email = e.target.value
            })}
          />
        </FormGroup>
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

  const vendorTagNames = [
    "Address",
    "Tel",
    "Fax",
    "Contact",
    "Email",
    "Bill Address",
    "Bill Tel",
    "Bill Fax",
    "Bill Contact",
    "Bill Email",
    "Account No.",
    "Payterm"
  ]
  const vendorInfoTags = vendorTagNames.map((item, index) => {
    return (
      <CompoundTag
        key={index+1}
        leftContent={item}
        children={states.info[index+1]}
        round={tagProps.round}
        minimal={tagProps.minimal}
        intent="none"
        large={tagProps.large}
        className='vend-info-tag'
        fill={tagProps.fill}
      />
    )
  })

  const infoPanel = (
    <>
      {editVendorInfoDialog}
      <Card>
        <div className='name'>
          <h2>{states.info[0]}</h2>
          <Button icon="edit" className='edit-button' text="Edit Info" onClick={handleEditInfoClick}/>
        </div>
        {vendorInfoTags}
        {/* <dl>
          <dt>Address</dt>
          <dd>
            {states.info[1] && <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[1]}</Tag>}
          </dd>
          <dt>Tel/Fax</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[2]}</Tag>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[3]}</Tag>
          </dd>
          <dt>Contact</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[4]}</Tag>
          </dd>
          <dt>Email</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[5]}</Tag>
          </dd>
          <dt>Bill Address</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[6]}</Tag>
          </dd>
          <dt>Bill Tel/Fax</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[7]}</Tag>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[8]}</Tag>
          </dd>
          <dt>Bill Contact</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[9]}</Tag>
          </dd>
          <dt>Bill Email</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[10]}</Tag>
          </dd>
          <dt>Account No.</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[12]}</Tag>
          </dd>
          <dt>Payterm</dt>
          <dd>
            <Tag intent={tagProps.intent} large={tagProps.large} round={tagProps.round}>{states.info[13]}</Tag>
          </dd>
        </dl> */}
      </Card>
      <Card>
        <div className='memo-container'>
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
          className='vendor-notes'
        />
      </Card>
    </>
  );

  // vpo history table's column names
  const vpoNames = ["PO ID", "PO #", "Date", "Order By", "ACK", "V.R.N", "Ship Via", "Trade"]

  // vpo history table cell renderer
  const vpoCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {states.vpoHistory[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  }

  // vpo histor column header renderere
  const renderVpoHeader = (index) => {
    return (
      <ColumnHeaderCell
        name={vpoNames[index]}
        index={index}
        nameRenderer={constants.renderName}
      />
    )
  }

  // vpo history columns
  const vpoColumns = vpoNames.map((index) => {
    return <Column key={index} cellRenderer={vpoCellRenderer} columnHeaderCellRenderer={renderVpoHeader} />
  })

  // vpo part table's column names
  const vpoPartsNames = ["Seq", "Part No.", "Qty", "Amount"]

  // handle double-click within vpo parts table
  const handleDoubleClick = (rowIndex, colIndex) => {
    // retrieve part id which is at the last hidden column
    const paid = states.vpoParts[rowIndex][4];

    const url = baseUrl+`#/partinfo?paid=${paid}`;
    const title = 'Part Info';
    window.electronAPI.openWindow([url, title]);
  }

  // vpo part table's cell renderer
  const vpoPartsCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <div onDoubleClick={() => handleDoubleClick(rowIndex, columnIndex)}>
          {states.vpoParts[rowIndex][columnIndex]}
        </div>
      </Cell>
    )
  }

  // vpo part table's column header renderer
  const renderVpoPartsHeader = (index) => {
    return (
      <ColumnHeaderCell
        name={vpoPartsNames[index]}
        index={index}
        nameRenderer={constants.renderName}
      />
    )
  }

  // vpo part table columns
  const vpoPartsColumns = vpoPartsNames.map((index) => {
    return <Column key={index} cellRenderer={vpoPartsCellRenderer} columnHeaderCellRenderer={renderVpoPartsHeader} />
  })

  // handle focus change in the vpo table
  const handleVpoFocusChange = async(coords) => {
    // check if vpo table has records
    if (states.vpoHistory.length > 0) {
      const vpid = states.vpoHistory[coords.row][0];

      // fetch vpo's parts data
      const response = await fetch(`${constants.BASE_URL}/api/vendinfo/vpohist/parts?input=${vpid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched data
      const parsed = data.map(item => {
        const seq = (item.SEQ != null) ? item.SEQ : '';
        const partno = (item.PARTNO != null) ? item.PARTNO : '';
        const qty = (item.QTY != null) ? item.QTY : '';
        const amount = (item.AMOUNT != null) ? Math.round(item.AMOUNT*100)/100 : '';
        const paid = (item.PAID != null) ? item.PAID : '';

        return [seq, partno, qty, amount, paid]
      })

      setStates((state) => {
        state.vpoParts = parsed;
      })
      }
  }

  const renderVpoHistory = () => {
    var content;
    if (states.isFetched.vpo) {
      if (states.vpoHistory.length > 0) {
        content = (
          <Table2
            numRows={states.vpoHistory.length}
            renderMode={RenderMode.BATCH}
            onFocusedCell={handleVpoFocusChange}
            enableFocusedCell={true}
          >
            {vpoColumns}
          </Table2>
        )
      } else {
        content = (
          <NonIdealState
            icon="search"
            description={"No VPO record found!"}
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

  // vpo panel
  const vpoPanel = (
    <>
      <Card className='vpo-card'>
        {renderVpoHistory()}
      </Card>
      <Card className='vpo-parts'>
        <Table2
          numRows={states.vpoParts.length}
          renderMode={RenderMode.BATCH}
          cellRendererDependencies={states.vpoParts}
        >
          {vpoPartsColumns}
        </Table2>
      </Card>
    </>
  )

  // invoice history column names
  const invColNames = ["VNID", "INV No.", "CPO #", "VPO #", "Date", "Paid", "Paid Date", "Amount", "CAT", "Expense", "Check #", "Partial (Recv ID)", "BANK"];

  // invoice history table cell renderer
  const invCellRenderer = (rowIndex, columnIndex) => {
    // render cell as checkbox for 'paid' column
    if (columnIndex == 5) {
      var checked;
      const paid = states.payableHistory[rowIndex][5];
      checked = (paid == 'Y') ? true : false;
      return (
        <Cell interactive={true}>
          <Checkbox
            className='paid-checkbox'
            checked={checked}
            disabled={false}
          />
        </Cell>
      )
    } else {
      return (
        <Cell interactive={true}>
          <TruncatedFormat detectTruncation={true}>
            {states.payableHistory[rowIndex][columnIndex]}
          </TruncatedFormat>
        </Cell>
      )
    }
  }

  // invoice history column header renderer
  const renderInvHeader = (index) => {
    return (
      <ColumnHeaderCell
        name={invColNames[index]}
        index={index}
        nameRenderer={constants.renderName}
      />
    )
  }

  // invoice history columns
  const invColumns = invColNames.map((index) => {
    return <Column key={index} cellRenderer={invCellRenderer} columnHeaderCellRenderer={renderInvHeader} />
  })

  const renderInvoicePanel = () => {
    var content;
    if (states.isFetched.history) {
      if (states.payableHistory.length > 0) {
        content = (
          <Table2
            numRows={states.payableHistory.length}
            renderMode={RenderMode.BATCH}
            cellRendererDependencies={states.payableHistory}
            loadingOptions={getLoadingOptions()}
          >
            {invColumns}
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
 
  // payable history panel
  const invoicePanel = (
    <>
      <Card className='invoice-card'>
        {renderInvoicePanel()}
      </Card>
    </>
  )

  // compare function for sorting columns in the ordered 
  const compareAmt = (a, b) => {
    return a - b;
  }

  // handle focus change within the parts table
  const handlePartsFocusChange = async(coords) => {

    // check if parts table has records
    if (states.carryingParts.length > 0) {
      // check for sorted indices
      var rowIndex = coords.row;
      const sortedRowIndex = states.sortedIndexMap.parts[coords.row];
      if (sortedRowIndex != null) {
        rowIndex = sortedRowIndex;
      }
      
      // part id is at column index 3 which is not shown in the table
      const paid = states.carryingParts[rowIndex][3];

      // fetch quotation history date for the focused part
      const response = await fetch(`${constants.BASE_URL}/api/vendinfo/parts/quothist?input=${paid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched data
      const parsed = data.map(item => {
        const receivedDate = (item.DTRECIEVE != null) ? format(new Date(item.DTRECIEVE), 'yyyy-MM-dd') : '';
        const vendor = (item.VENDOR != null) ? item.VENDOR : '';
        const mfr = (item.MFG != null) ? item.MFG : '';
        const del = (item.VDEL != null) ? item.VDEL : '';
        const qty = (item.NEEDED != null) ? item.NEEDED : '';
        const moq = (item.QTY != null) ? item.QTY : '';
        const units = (item.UNITS != null) ? item.UNITS : '';
        const price = (item.PRICE != null) ? item.PRICE : '';
        const ordered = (item.ORDERED != null) ? item.ORDERED : '';
        const mprice = (item.MPRICE != null) ? item.MPRICE : '';
        const cust = (item.CUSTOMER != null) ? item.CUSTOMER : ''; 
        const prjname = (item.PRJNAME != null) ? item.PRJNAME : '';
        
        return [receivedDate, vendor, mfr, del, qty, moq, units, price, ordered, mprice, cust, prjname]
      })

      setStates((state) => {
        state.partsQuotHist = parsed;
      })
      }
  }

  // sort columns in the carrying parts table
  const sortColumn = (columnIndex, comparator) => {
    var data;
    if (states.selectedTab == 'parts') {
      data = states.carryingParts;
    }

    // initialize array for sorted indices
    const sortedIndexMap = Utils.times(data.length, (i) => i);
    sortedIndexMap.sort((a,b) => {
      return comparator(data[a][columnIndex], data[b][columnIndex])
    });

    setStates((state) => {
      if (states.selectedTab == 'parts') {
        state.sortedIndexMap.parts = sortedIndexMap;
      }
    })
  }

  // menu renderer for the carrying parts table
  const menuRenderer = (index) => {
    const sortAsc = (index) => {
      sortColumn(index, (a,b) => compareAmt(a,b));
    }
    const sortDesc = (index) => {
      sortColumn(index, (a,b) => compareAmt(b,a));
    }
    return (
      <Menu>
        <MenuItem icon="sort-asc" text="Sort Asc" onClick={() => {
          sortAsc(index);
        }}
        />
        <MenuItem icon="sort-desc" text="Sort Desc" onClick={() => {
          sortDesc(index);
        }} 
        />
      </Menu>
    )
  }

  // carrying parts column names
  const partsNames = ["Part No.", "Description", "Total Quotes"];

  // carring parts table cell renderer
  const partsCellRenderer = (rowIndex, columnIndex) => {
    // check for sorted indices
    const sortedRowIndex = states.sortedIndexMap.parts[rowIndex];
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex;
    }

    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {states.carryingParts[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  }

  // carring parts column header renderer
  const renderPartsHeader = (index) => {
    return (
      <ColumnHeaderCell
        name={partsNames[index]}
        index={index}
        nameRenderer={constants.renderName}
        menuRenderer={() => menuRenderer(index)}
      />
    )
  }

  // carring parts columns
  const partsColumns = partsNames.map((index) => {
    return <Column key={index} cellRenderer={partsCellRenderer} columnHeaderCellRenderer={renderPartsHeader} />
  })

  // columns widths for parts table
  const partsWidths = {
    partno: 150,
    descr: 200,
    count: 150
  }
  const partsWidthValues = Object.values(partsWidths);

  // parts quot history column names
  const quotHistNames = ["Received Date", "Vendor", "Manufacturer", "V.DEL", "Needed Qty", "MOQ", "UI", "Price", "Ordered", "Min. Price", "Customer", "Project"]

  // quot history tabel cell renderer
  const quotHistCellRenderer = (rowIndex, columnIndex) => {

    return (
      <Cell interactive={true}>
        <TruncatedFormat detectTruncation={true}>
          {states.partsQuotHist[rowIndex][columnIndex]}
        </TruncatedFormat>
      </Cell>
    )
  }

  // quot history header renderer
  const renderQuotHistHeader = (index) => {

    return (
      <ColumnHeaderCell
        name={quotHistNames[index]}
        index={index}
        nameRenderer={constants.renderName}
      />
    )
  }

  // quot history table columns
  const quotHistColumns = quotHistNames.map((index) => {
    return <Column key={index} cellRenderer={quotHistCellRenderer} columnHeaderCellRenderer={renderQuotHistHeader} />
  })

  const renderPartsPanel = () => {
    var content;
    if (states.isFetched.parts) {
      if (states.carryingParts.length > 0) {
        content = (
          <Table2
            numRows={states.carryingParts.length}
            renderMode={RenderMode.BATCH}
            cellRendererDependencies={states.sortedIndexMap.parts}
            columnWidths={partsWidthValues}
            enableFocusedCell={true}
            onFocusedCell={handlePartsFocusChange}
            ref={partsTableRef}
          >
            {partsColumns}
          </Table2>
        )
      } else {
        content = (
          <NonIdealState
            icon="search"
            description={"No carrying parts found!"}
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

  // carrying parts panel
  const partsPanel = (
    <>
      <Card className='parts-card'> 
        {renderPartsPanel()}
      </Card>
      <Card className='quotHist-card'>
        <Table2
          numRows={states.partsQuotHist.length} 
          renderMode={RenderMode.BATCH}
          cellRendererDependencies={states.partsQuotHist} 
        >
          {quotHistColumns}
        </Table2>
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
      fetchInfoData();
    } else if (newTabId == 'vpo') {
      fetchVpo();
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
        <Tab id="vpo" title="Vendor PO" panel={vpoPanel} />
        <Tab id="invoice" title="Payable History" panel={invoicePanel} />
        <Tab id="parts" title="Carrying Parts" panel={partsPanel} />
      </Tabs>
    </div>
  );
};

export default VendorInfo;
