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
  MenuItem,
  TextArea,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
  ButtonGroup,
  Card,
  CompoundTag,
  FormGroup,
  HTMLSelect,
  RadioGroup,
  Radio,
  NumericInput,
  OverlayToaster,
  Checkbox,
  Drawer,
  DrawerSize,
  NonIdealState,
  Popover,
  Menu,
  CardList,
  Icon,
  IconSize,
  Alert,
  useHotkeys
} from "@blueprintjs/core";
import { 
  Column, 
  Table2, 
  Cell,
  TruncatedFormat,
  EditableCell2,
  ColumnHeaderCell,
  RenderMode,
  Regions,
} from "@blueprintjs/table";
import {
  ItemPredicate,
  ItemRenderer,
  Suggest,
  Omnibar
} from "@blueprintjs/select";
import {
  DateInput3
} from "@blueprintjs/datetime2";
import '@blueprintjs/core/lib/css/blueprint.css'; 
import '@blueprintjs/table/lib/css/table.css';
import '@blueprintjs/select/lib/css/blueprint-select.css'
import '../styles/crfqinfo.scss'
import {useImmer} from 'use-immer';
import {format} from 'date-fns';
import constants from '../config';
import FunctionsIcon from '@mui/icons-material/Functions';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import NumbersIcon from '@mui/icons-material/Numbers';

const CRFQ = () => {

  const crfqItemRef = useRef(null);
  const markupValueRef = useRef(null);

  // state variables
  const [states, setStates] = useImmer({
    crfqInfo: [],
    crfqItems: [],
    custList: [],
    crfqSummary: [],
    crfqParts: {},
    crfqPriceDetails: {},
    quotHist: [],
    stock: [],
    linkedCPOs: [],
    crfqItemCount: {},
    rowsToAssignVendors: [],
    detailDialogOpen: false,
    detailForm: {
      customer: '',
      prjname: '',
      prgname: '',
      receivedate: '',
      duedate: '',
      category: '',
      receiveby: '',
      analyzeby: '',
      validity: -1,
      term: '',
      fob: '',
      warranty: -1,
      minpo: -1,
      origquote: '',
      ligcontact: ''
    },
    crfqItemForm: {
      selected: '',
      ordered: '',
      nobid: ''
    },
    selectedCustomer: '',
    selectedDate: null,
    crfqItemsFetched: false,
    cpoButtonStatus: false,
    isOpen: {
      quotDrawer: false,
      stockDrawer: false,
      cpoMenu: false,
      sendEmail: false,
      partnoInputDialog: false,
      assignVendorDialog: false
    },
    focusedCellCoords: {
      crfqItems: {
        row: 0,
        col: 0
      }
    },
    copiedValues: null,
    partnoInput: '',
    filter: {
      selectedOnly: false,
      orderedOnly: false,
      assignedVendorsOnly: false
    },
    markupValue: 0
  });

  // tag props
  const tagProps = {
    intent: "primary",
    large: true,
    round: true,
    fill: false,
    minimal: false
  };

  // form properties for edit form
  const formProps = {
    inline: true
  }

  // textarea props
  const textareaProps = {
    readOnly: false,
    large: false,
    fill: false
  }

  // retrieve the base id of the home page
	const baseUrl = window.location.href.split('#')[0];

  // retrieve rq id
  const params = constants.getParams(window);
  const rqid = params['rqid'];

  const fetchCrfqItems = async() => {
    // now fetch crfq items info
    try{
      const response = await fetch(`${constants.BASE_URL}/api/crfqitems?input=${rqid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched data
      const parsed = 
        data.map(item => {
          const partno = (item.PARTNO != null) ? item.PARTNO : '';
          const vendor = (item.VENDOR != null) ? item.VENDOR : '';
          const vendorPartNO = (item.VITEMNO != null) ? item.VITEMNO : '';
          const qiid = (item.QIID != null) ? item.QIID : '';
          const bomhead = (item.BOMHEAD != null) ? item.BOMHEAD : '';
          const selected = (item.SELECTED != null) ? item.SELECTED : 'N';
          const ordered = (item.ORDERED != null) ? item.ORDERED : 'N';
          const hidetocust = (item.HIDETOCUST != null) ? item.HIDETOCUST : 'N'; // no bid
          const seq = (item.SEQ != null) ? item.SEQ : '';
          const requstedqty = (item.NEEDED != null) ? item.NEEDED : '';
          const units = (item.UNITS != null) ? item.UNITS : '';
          const price = (item.PRICE != null) ? Math.round(item.PRICE*100)/100 : 0;
          const qty = (item.QTY != null) ? item.QTY : 0;
          const amount = (item.AMOUNT != null) ? Math.round(item.AMOUNT*100)/100 : 0;
          const vdel = (item.DELIVERY != null) ? item.DELIVERY : '';
          const cdel = (item.DELDATES != null) ? item.DELDATES : '';
          const notes = (item.SHORTNOTE != null) ? item.SHORTNOTE : '';
          const intNotes = (item.INTNOTE != null) ? item.INTNOTE : '';
          const mfg = (item.MFG != null) ? item.MFG : '';
          const cmfg = (item.CMFG != null) ? item.CMFG : '';
          const mprice = (item.MPRICE != null) ? Math.round(item.MPRICE*100)/100 : 0;
          const mamount = (item.MAMOUNT != null) ? Math.round(item.MAMOUNT*100)/100 : 0;
          const origin = (item.ORIGIN != null) ? item.ORIGIN : '';
          const vqrn = (item.VQRN != null) ? item.VQRN : '';
          const receiveDate = (item.RECEIVED != null) ? format(new Date(item.RECEIVED), 'yyyy-MM-dd') : '';
          const pktype = (item.PKTYPE != null) ? item.PKTYPE : '';
          const rsuchg = (item.RSUCHG != null) ? item.RSUCHG : '';
          const suchg = (item.SUCHG != null) ? item.SUCHG : '';
          const mrsetup = (item.MRSETUP != null) ? item.MRSETUP : '';
          const msetup = (item.MSETUP != null) ? item.MSETUP : '';
          const inspectrpt = (item.INSPECTRPT != null) ? item.INSPECTRPT : '';
          const inspectrptPrice = (item.INSPECTRPT_PRICE != null) ? item.INSPECTRPT_PRICE : '';
          const mfrCoc = (item.MFR_COC != null) ? item.MFR_COC : '';
          const mfrCocPrice = (item.MFR_COC_PRICE != null) ? item.MFR_COC_PRICE : '';
          const milpartno = (item.MILPARTNO != null) ? item.MILPARTNO : '';
          const authDistributor = (item.AUTHDISTRIBUTOR != null) ? item.AUTHDISTRIBUTOR : '';
          const exportCountry = (item.EXPORTCOUNTRY != null) ? item.EXPORTCOUNTRY : '';
          const supplierNote = (item.NOTETOSUPPLIER != null) ? item.NOTETOSUPPLIER : '';
          const origPartOnly = (item.ORIGPARTNOONLY != null) ? item.ORIGPARTNOONLY : '';
          const techMemo = (item.TECHNICALMEMO != null) ? item.TECHNICALMEMO : '';
          const ligNote = (item.LIG_AUX != null) ? item.LIG_AUX : '';
          const ligAccept = (item.LIG_ACCEPTANCE != null) ? item.LIG_ACCEPTANCE : '';
          const ligReason = (item.LIG_REASON != null) ? item.LIG_REASON : '';
          const ligCost = (item.LIG_COSTESTQTY != null) ? item.LIG_COSTESTQTY : '';
          const ligAccum = (item.LIG_ACCUMULATE != null) ? item.LIG_ACCUMULATE : '';
          const njPrice = (item.NJPRICE != null) ? item.NJPRICE : '';
          const njAmount = (item.NJAMOUNT != null) ? item.NJAMOUNT : '';
          const minq = (item.MINQ != null) ? item.MINQ : '';
          const multiq = (item.MULTIQ != null) ? item.MULTIQ : '';

          // store part & vendor id to display part/vendor details in the bottom
          const paid = (item.PAID != null) ? item.PAID : '';
          const vdid = (item.VDID != null) ? item.VDID : '';

          // initialize values for crfq item form to be used as fetch post body
          setStates((state) => {
            state.crfqItemForm.selected = selected;
            state.crfqItemForm.ordered = ordered;
            state.crfqItemForm.nobid = hidetocust;
          })
          return [partno, vendor, vendorPartNO, qiid, bomhead, selected, ordered, hidetocust, seq, requstedqty, units, price, qty, amount,mprice, mamount, vdel, cdel, notes, intNotes, mfg, cmfg, origin, vqrn, receiveDate, pktype, rsuchg, suchg, mrsetup, msetup, inspectrpt, inspectrptPrice, mfrCoc, mfrCocPrice, milpartno, authDistributor, exportCountry, supplierNote, origPartOnly, techMemo, ligNote, ligAccept, ligReason, ligCost, ligAccum, njPrice, njAmount, minq, multiq, paid, vdid];
      });
      setStates((state) => {
        state.crfqItems = parsed;
        state.crfqItemsFetched = true;

        // count the total count of items, items with/without vendors assigned
        const totalCount = parsed.length;
        const withVendors = parsed.filter(row => row[1] !== '').length;
        const withoutVendors = totalCount - withVendors;
        state.crfqItemCount["Total Count"] = totalCount;
        state.crfqItemCount["With Vendors"] = withVendors;
        state.crfqItemCount["Without Vendors"] = withoutVendors;

        // compute crfq summary values and update the state
        // amount is at column index 12
        const buyingtotal = parsed.reduce(function(acc, curr) {
          return acc + curr[13];
        }, 0);

        // mamount is at column index 15
        const sellingtotal = parsed.reduce(function(acc, curr) {
          return acc + curr[15];
        }, 0);
        const totalmarkup = Math.round(((sellingtotal - buyingtotal)/buyingtotal)*100)/100;

        var markupValue = (isNaN(totalmarkup)) ? 'N/A' : totalmarkup
        state.crfqSummary = [`${Math.round(buyingtotal*100)/100}`, `${Math.round(sellingtotal*100)/100}`, markupValue];
      })
      
    } catch (error) {
      console.error("Error fetching crfq items ", error);
    }
  }

  const fetchData = async() => {
    // fetch CRFQ details info first
    try{
      const response = await fetch(`${constants.BASE_URL}/api/crfqinfo?input=${rqid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched data
      const parsed = 
        data.map(item => {
          const rqid = (item.RQID !== null) ? item.RQID : null;
          const customer = (item.CUSTOMER !== null) ? item.CUSTOMER : null;
          const prjname = (item.PRJNAME !== null) ? item.PRJNAME : null;
          const prgname = (item.SAUPNAME !== null) ? item.SAUPNAME : null;
          const quotecat = (item.QUOTECAT !== null) ? item.QUOTECAT : null;
          const parsedcat = (quotecat != null) ? constants.category[quotecat] : null;
          const receivedate = (item.DTRECIEVE !== null) ? format(new Date(item.DTRECIEVE), 'yyyy-MM-dd') : null;
          const duedate = (item.DUEDATE !== null) ? format(new Date(item.DUEDATE), 'yyyy-MM-dd') : null;
          const receivedby = (item.RECIEVEBY !== null) ? constants.idToWorker[item.RECIEVEBY] : null;
          const analyzedby = (item.ANALYSEDBY !== null) ? constants.idToWorker[item.ANALYSEDBY] : null;
          const validity = (item.VALIDITY !== null) ? item.VALIDITY : null;
          const term = (item.TERM !== null) ? item.TERM : null;
          const fob = (item.FOB !== null) ? item.FOB : null;
          const minpo = (item.MINPO !== null) ? item.MINPO : null;
          const ligcontact = (item.LIG_REP !== null) ? item.LIG_REP : null;
          const warranty = (item.WARRANTY !== null) ? item.WARRANTY : null;
          const origquote = (item.ORGINALEXCEL !== null) ? item.ORGINALEXCEL : null;
          const cuid = (item.CUID != null) ? item.CUID : null;

          // initialize values for the edit details dialog
          setStates((state) => {
            state.detailForm.customer = customer;
            state.detailForm.prjname = prjname;
            state.detailForm.prgname = prgname;
            state.detailForm.quotecat = quotecat; 
            state.detailForm.receivedate = receivedate;
            state.detailForm.duedate = duedate;
            state.detailForm.receiveby = receivedby;
            state.detailForm.analyzeby = analyzedby;
            state.detailForm.term = (term !== '') ? term : 'None';
            state.detailForm.fob = fob;
            state.detailForm.minpo = minpo;
            state.detailForm.validity = (validity !== '') ? validity : 0;
            state.detailForm.ligcontact = ligcontact;
            state.detailForm.warranty = warranty;
            state.detailForm.origquote = origquote;
          })

          return {
            "CRFQ ID": rqid,
            "Customer": customer,
            "Project Name": prjname,
            "Program Name": prgname,
            "Category": parsedcat,
            "Receive Date": receivedate,
            "Due Date": duedate,
            "Received By": receivedby,
            "Analyzed By": analyzedby,
            "Validity": validity,
            "Term": term,
            "FOB": fob,
            "Min PO": minpo,
            "Contact": ligcontact,
            "Warranty": warranty,
            "CUID": cuid 
          }

      })[0];
      setStates((state) => {
        state.crfqInfo = parsed;
      })

    } catch (error) {
      console.error("Error fetching crfq details ", error);
    }

    // // now fetch crfq items info
    // try{
    //   const response = await fetch(`${constants.BASE_URL}/api/crfqitems?input=${rqid}`, {method: 'GET'});
    //   const data = await response.json();

    //   // parse the fetched data
    //   const parsed = 
    //     data.map(item => {
    //       const partno = (item.PARTNO != null) ? item.PARTNO : '';
    //       const vendor = (item.VENDOR != null) ? item.VENDOR : '';
    //       const vendorPartNO = (item.VITEMNO != null) ? item.VITEMNO : '';
    //       const qiid = (item.QIID != null) ? item.QIID : '';
    //       const bomhead = (item.BOMHEAD != null) ? item.BOMHEAD : '';
    //       const selected = (item.SELECTED != null) ? item.SELECTED : 'N';
    //       const ordered = (item.ORDERED != null) ? item.ORDERED : 'N';
    //       const hidetocust = (item.HIDETOCUST != null) ? item.HIDETOCUST : 'N'; // no bid
    //       const seq = (item.SEQ != null) ? item.SEQ : '';
    //       const requstedqty = (item.NEEDED != null) ? item.NEEDED : '';
    //       const units = (item.UNITS != null) ? item.UNITS : '';
    //       const price = (item.PRICE != null) ? Math.round(item.PRICE*100)/100 : 0;
    //       const qty = (item.QTY != null) ? item.QTY : 0;
    //       const amount = (item.AMOUNT != null) ? Math.round(item.AMOUNT*100)/100 : 0;
    //       const vdel = (item.DELIVERY != null) ? item.DELIVERY : '';
    //       const cdel = (item.DELDATES != null) ? item.DELDATES : '';
    //       const notes = (item.SHORTNOTE != null) ? item.SHORTNOTE : '';
    //       const intNotes = (item.INTNOTE != null) ? item.INTNOTE : '';
    //       const mfg = (item.MFG != null) ? item.MFG : '';
    //       const cmfg = (item.CMFG != null) ? item.CMFG : '';
    //       const mprice = (item.MPRICE != null) ? Math.round(item.MPRICE*100)/100 : 0;
    //       const mamount = (item.MAMOUNT != null) ? Math.round(item.MAMOUNT*100)/100 : 0;
    //       const origin = (item.ORIGIN != null) ? item.ORIGIN : '';
    //       const vqrn = (item.VQRN != null) ? item.VQRN : '';
    //       const receiveDate = (item.RECEIVED != null) ? format(new Date(item.RECEIVED), 'yyyy-MM-dd') : '';
    //       const pktype = (item.PKTYPE != null) ? item.PKTYPE : '';
    //       const rsuchg = (item.RSUCHG != null) ? item.RSUCHG : '';
    //       const suchg = (item.SUCHG != null) ? item.SUCHG : '';
    //       const mrsetup = (item.MRSETUP != null) ? item.MRSETUP : '';
    //       const msetup = (item.MSETUP != null) ? item.MSETUP : '';
    //       const inspectrpt = (item.INSPECTRPT != null) ? item.INSPECTRPT : '';
    //       const inspectrptPrice = (item.INSPECTRPT_PRICE != null) ? item.INSPECTRPT_PRICE : '';
    //       const mfrCoc = (item.MFR_COC != null) ? item.MFR_COC : '';
    //       const mfrCocPrice = (item.MFR_COC_PRICE != null) ? item.MFR_COC_PRICE : '';
    //       const milpartno = (item.MILPARTNO != null) ? item.MILPARTNO : '';
    //       const authDistributor = (item.AUTHDISTRIBUTOR != null) ? item.AUTHDISTRIBUTOR : '';
    //       const exportCountry = (item.EXPORTCOUNTRY != null) ? item.EXPORTCOUNTRY : '';
    //       const supplierNote = (item.NOTETOSUPPLIER != null) ? item.NOTETOSUPPLIER : '';
    //       const origPartOnly = (item.ORIGPARTNOONLY != null) ? item.ORIGPARTNOONLY : '';
    //       const techMemo = (item.TECHNICALMEMO != null) ? item.TECHNICALMEMO : '';
    //       const ligNote = (item.LIG_AUX != null) ? item.LIG_AUX : '';
    //       const ligAccept = (item.LIG_ACCEPTANCE != null) ? item.LIG_ACCEPTANCE : '';
    //       const ligReason = (item.LIG_REASON != null) ? item.LIG_REASON : '';
    //       const ligCost = (item.LIG_COSTESTQTY != null) ? item.LIG_COSTESTQTY : '';
    //       const ligAccum = (item.LIG_ACCUMULATE != null) ? item.LIG_ACCUMULATE : '';
    //       const njPrice = (item.NJPRICE != null) ? item.NJPRICE : '';
    //       const njAmount = (item.NJAMOUNT != null) ? item.NJAMOUNT : '';
    //       const minq = (item.MINQ != null) ? item.MINQ : '';
    //       const multiq = (item.MULTIQ != null) ? item.MULTIQ : '';

    //       // store part & vendor id to display part/vendor details in the bottom
    //       const paid = (item.PAID != null) ? item.PAID : '';
    //       const vdid = (item.VDID != null) ? item.VDID : '';

    //       // initialize values for crfq item form to be used as fetch post body
    //       setStates((state) => {
    //         state.crfqItemForm.selected = selected;
    //         state.crfqItemForm.ordered = ordered;
    //         state.crfqItemForm.nobid = hidetocust;
    //       })
    //       return [partno, vendor, vendorPartNO, qiid, bomhead, selected, ordered, hidetocust, seq, requstedqty, units, price, qty, amount,mprice, mamount, vdel, cdel, notes, intNotes, mfg, cmfg, origin, vqrn, receiveDate, pktype, rsuchg, suchg, mrsetup, msetup, inspectrpt, inspectrptPrice, mfrCoc, mfrCocPrice, milpartno, authDistributor, exportCountry, supplierNote, origPartOnly, techMemo, ligNote, ligAccept, ligReason, ligCost, ligAccum, njPrice, njAmount, minq, multiq, paid, vdid];
    //   });
    //   setStates((state) => {
    //     state.crfqItems = parsed;
    //     state.crfqItemsFetched = true;

    //     // count the total count of items, items with/without vendors assigned
    //     const totalCount = parsed.length;
    //     const withVendors = parsed.filter(row => row[1] !== '').length;
    //     const withoutVendors = totalCount - withVendors;
    //     state.crfqItemCount = [totalCount, withVendors, withoutVendors]

    //     // compute crfq summary values and update the state
    //     // amount is at column index 12
    //     const buyingtotal = parsed.reduce(function(acc, curr) {
    //       return acc + curr[13];
    //     }, 0);

    //     // mamount is at column index 15
    //     const sellingtotal = parsed.reduce(function(acc, curr) {
    //       return acc + curr[15];
    //     }, 0);
    //     const totalmarkup = Math.round(((sellingtotal - buyingtotal)/buyingtotal)*100)/100;

    //     var markupValue = (isNaN(totalmarkup)) ? 'N/A' : totalmarkup
    //     state.crfqSummary = [`${Math.round(buyingtotal*100)/100}`, `${Math.round(sellingtotal*100)/100}`, markupValue];
    //   })
      
    // } catch (error) {
    //   console.error("Error fetching crfq items ", error);
    // }

    // now fetch customer list
    try {
      const response = await fetch(`${constants.BASE_URL}/api/custlist`, {method: 'GET'});
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

    // now fetch cpo list
    try {
      const response = await fetch(`${constants.BASE_URL}/api/crfqinfo/cpo?rqid=${rqid}`, {method: 'GET'});
      const data = await response.json();
      const parsed = data.map((item, index) => {
        const cpid = (item.CPID != null) ? item.CPID : '';
        const orderno = (item.ORDERNO != null) ? item.ORDERNO : '';
        return {index: index, cpid: cpid, orderno: orderno};
      })
      setStates((state) => {
        state.linkedCPOs = parsed; 
        if (parsed.length < 1) {
          state.cpoButtonStatus = true;
        }
      })
    } catch (error) {
      console.error("Error fetching customer list", error);
    }
  };

  useEffect(() => {
    fetchData();  
      // console.log('rendered');
  }, [states.detailDialogOpen])  

  // once crfq item data is fetched, set focus to the first cell
  useEffect(() => {
    if (states.crfqItemsFetched) {
      handleCrfqFocusChange({row: 0});
    }
  }, [states.crfqItemsFetched])

  // fetch crfq items once when crfq info page is mounted
  useEffect(() => {
    fetchCrfqItems();
  }, [])

  const crfqInfoTags = [
    "CRFQ ID", 
    "Customer", 
    "Project Name", 
    "Program Name",
    "Category",
    "Receive Date", 
    "Due Date", 
    "Received By", 
    "Analyzed By", 
    "Validity", 
    "Term", 
    "FOB", 
    "Min PO",
    "Contact",
    "Warranty"
  ]

  const crfqInfoDetails = crfqInfoTags.map((item, index) => {
    return (
      <CompoundTag
        icon="info-sign"
        leftContent={item}
        children={states.crfqInfo[item] !== null ? states.crfqInfo[item] : 'N/A'}
        key={index}
        round={tagProps.round}
        className='crfq-info-tag'
        fill={tagProps.fill}
        large={tagProps.large} 
        intent="none"
        minimal={tagProps.minimal}
      />
    )
  })

  // crfq item table column names
  const crfqNames = [
    "Part No.",
    "Vendor",
    "Vendor P.N.",
    "QIID",
    "BOMHEAD",
    "Selected",
    "Ordered",
    "No bid",
    "Seq",
    "Requested Qty",
    "Units",
    "Price",
    "B.Qty",
    "Amount",
    "M.Price",
    "M.Amount",
    "VDEL",
    "CDEL",
    "Notes",
    "Int. Notes",
    "MFG",
    "CMFG",
    "Origin",
    "VQRN",
    "Received Date",
    "C.Pkg",
    "R.Setup",
    "Setup",
    "M.R.Setup",
    "M.Setup",
    "I.R",
    "Insp.Rpt",
    "M.COC",
    "MFR COC",
    "Mil P/N",
    "Auth.Distr",
    "Ex. Country",
    "Supplier Note",
    "Org.Part.Only",
    "Tech.Memo",
    "LIG Note",
    "LIG (Accept)",
    "LIG (Reason)",
    "LIG (Cost Est. Qty)",
    "LIG (Accul PO Qty)",
    "NJPRICE",
    "NJAMOUNT",
    "MINQ",
    "MULTIQ"
  ]

  // column widths for CRFQ items table
  const crfqItemWidths = {
    partno: 150,
    vendor: 150,
    vendorPartNo: 150,
    qiid: 80,
    bomhead: 100,
    selected: 80,
    ordered: 80,
    nobid: 80,
    seq: 50,
    requestedqty: 140,
    units: 60,
    price: 80,
    bqty: 60,
    amount: 80,
    mprice: 100,
    mamount: 100,
    vdel: 60,
    cdel: 60,
    notes: 100,
    internalnote: 100,
    mfg: 100,
    cmfg: 100,
    origin: 80,
    vqrn: 80,
    receivedate: 130,
    cpkg: 80,
    rsetup: 80,
    setup: 70,
    mrsetup: 100,
    msetup: 80,
    ir: 50,
    inspectrpt: 100,
    mcoc: 100,
    mfrcoc: 100,
    milpn: 100,
    authdistr: 100,
    excountry: 100,
    suppliernote: 130,
    orgpartonly: 130,
    techmemo: 130,
    lignote: 100,
    ligaccept: 110,
    ligreason: 110,
    ligcostestqty: 150,
    ligpoqty: 150,
    njprice: 100,
    njamount: 100,
    minq: 100,
    multiq: 100
  }
  const crfqItemWidthValues = Object.values(crfqItemWidths);

  // handle pasting copied cell values into the CRFQ items table
  const handleKeyPress = (event) => {
    if (event.key === 'Shift') {
      console.log('shift pressed')
    }
  } 

  // handle cell value change in crfq items table
  const handleCellValueChange = (value, rowIndex, columnIndex) => {
    // console.log(value, rowIndex, columnIndex)
    setStates((state) => {
      state.crfqItems[rowIndex][columnIndex] = value;
    })
  }

  // define keyboard shortcuts
  // const hotkeys = useMemo(() => [
  //   {
  //     combo: "ctrl+v",
  //     onKeyDown: handleKeyPress,
  //     global: true,
  //     label: "paste excel cell values into table",
  //     preventDefault: true
  //   }
  // ])
  // const {handleKeyDown, handleKeyUp} = useHotkeys(hotkeys);

  /* editable text props for editable cell
   * if isEditing is set to true, cells are editable after 'enter' press instead of double-click
   */
  const editableCellProps = (rowIndex, columnIndex) => {
    var editable = false;
    // partno, vendor, qiid, amount, and mamount columns are not editable
    if (columnIndex === 0 || columnIndex === 1 || columnIndex === 3 || columnIndex === 13 || columnIndex === 15) {
      editable = true;
    }
    return {
      disabled: editable,
      alwaysRenderInput: false,
      isEditing: true,
      selectAllOnFocus: true
    } 
  }

  // handle confirm in crfq item table's editable cells
  const handleCrfqItemConfirm = (rowIndex, columnIndex) => {
    // check if confirmed cell is price, b.qty, or m.price column
    if (columnIndex === 11 || columnIndex === 12 || columnIndex === 14) {
      const price = parseFloat(states.crfqItems[rowIndex][11]);
      const qty = parseInt(states.crfqItems[rowIndex][12]);
      const markup = parseFloat(states.crfqItems[rowIndex][14]);

      // update the 'amount' & 'mamount' columns
      setStates((state) => {
        state.crfqItems[rowIndex][13] = Math.round(price*qty*100)/100;
        state.crfqItems[rowIndex][15] = Math.round(markup*qty*100)/100;
      })
    }
  }

  // crfq item table cell renderer
  const crfqCellRenderer = (rowIndex, columnIndex) => {

    // check for selected & ordered & assigned vendors only filters
    if (states.filter.selectedOnly && states.crfqItems[rowIndex][5] === 'N') {
      return;
    } 
    if (states.filter.orderedOnly && states.crfqItems[rowIndex][6] === 'N') {
      return;
    }
    
    if (states.filter.assignedVendorsOnly && states.crfqItems[rowIndex][1] === '') {
      return;
    }

    // selected, ordered, and nobid columns are at 5, 6, and 7 index
    if (columnIndex >= 5 && columnIndex <= 7) {
      return (
        <Cell interactive={true}>
          <Checkbox
            checked={(states.crfqItems[rowIndex][columnIndex] == 'Y') ? true : false}
            disabled={false}
            className='crfq-checkbox'
            onChange={(e) => {
              setStates((state) => {
                state.crfqItems[rowIndex][columnIndex] = (e.target.checked) ? 'Y' : 'N';
              })
            }}
          />
        </Cell>
      )
    } else {
      return (
        <EditableCell2
          editableTextProps={editableCellProps(rowIndex, columnIndex)}
          // value={filteredCrfqItems[rowIndex][columnIndex]}
          value={states.crfqItems[rowIndex][columnIndex]}
          onKeyPress={()=>handleKeyPress()}
          interactive={false}
          onChange={(value)=> handleCellValueChange(value, rowIndex, columnIndex)}
          onConfirm={() => handleCrfqItemConfirm(rowIndex, columnIndex)}
        />
    )
    }
  }

  // menu renderer for filtering selected and ordered
  const tableMenuRenderer = () => {
    return (
      <Menu>
        <MenuItem 
          icon="filter" 
          text="filter" 
        >
          <Checkbox 
            label="Selected Only"
            checked={states.filter.selectedOnly}
            onChange={() => {
              setStates((state) => {
                state.filter.selectedOnly = !(state.filter.selectedOnly)
              })
            }}
          />
          <Checkbox 
            label="Ordered Only"
            checked={states.filter.orderedOnly}
            onChange={() => {
              setStates((state) => {
                state.filter.orderedOnly = !(state.filter.orderedOnly)
              })
            }}
          />
          <Checkbox 
            label="w/Vendors Only"
            checked={states.filter.assignedVendorsOnlyOnly}
            onChange={() => {
              setStates((state) => {
                state.filter.assignedVendorsOnly = !(state.filter.assignedVendorsOnly)
              })
            }}
          />
        </MenuItem>
      </Menu>
     )
  }

  // crfq item table headers
  const renderCrfqHeader = (index) => {
    return (
      <ColumnHeaderCell
        name={crfqNames[index]}
        index={index}
        nameRenderer={constants.renderName}
        menuRenderer={tableMenuRenderer}
      />
    )
  }

  // crfq item columns
  const crfqItemsColumns = crfqNames.map((index) => {
    return (
      <Column
        key={index}
        cellRenderer={crfqCellRenderer}
        columnHeaderCellRenderer={renderCrfqHeader}
      />
    )
  })

  // handle edit details button click
  const handleEditDetailsClick = () => {
    setStates(state => {
      state.detailDialogOpen = true;
    });
  }

  // handle closing the edit dialog
  const handleCloseEditDialog = () => {
    setStates((state) => {
      state.detailDialogOpen = false;
    })
  }

  // handle save button click in the edit details dialog
  const handleSaveDetailsClick = () => {
    // initialize the toaster 
    const toaster = OverlayToaster.create({position: "top"});

    // map worker's name to id
    const receiveid = Object.keys(constants.idToWorker).find(key => constants.idToWorker[key] === states.detailForm.receiveby);
    const analyzeid = Object.keys(constants.idToWorker).find(key => constants.idToWorker[key] === states.detailForm.analyzeby);

    try {
      fetch(`${constants.BASE_URL}/api/crfqinfo/details?input=${rqid}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          customer: states.detailForm.customer,
          prjname: states.detailForm.prjname,
          prgname: states.detailForm.prgname,
          quotecat: states.detailForm.quotecat,
          receivedate: states.detailForm.receivedate,
          duedate: states.detailForm.duedate,
          receiveby: receiveid,
          analyzeby: analyzeid,
          validity: states.detailForm.validity,
          term: states.detailForm.term,
          warranty: states.detailForm.warranty,
          minpo: states.detailForm.minpo,
          origquote: states.detailForm.origquote
        })
      }) 
      toaster.show({
        message: "CRFQ details have been edited!",
        intent: Intent.SUCCESS
      });
    } catch (error) {
      console.error('Error posting crfq details', error);
      toaster.show({
        message: "CRFQ details edit failed!",
        intent: Intent.WARNING
      })
    }
    handleCloseEditDialog();
  }

  // render customer list item for suggest component inside edit details dialog 
  const renderCustomerItem = (item, {handleClick}) => {
    return (
      <MenuItem
        text={`${item.title}`}
        roleStructure="listoption"
        selected={item.title === states.detailForm.customer}
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

	// properties for the date picker in ECCN edit form
	const {...spreadProps} = {
		highlightToday: true,
		showActionsBar: true,
		shortcuts: false,
	}

  // handle file open dilaog in the crfq edit details form
  const handleFileOpenClick = async() => {
    // store the select filepath and save it
    const filepath = await window.electronAPI.selectFile();
    setStates((state) => {
      state.detailForm.origquote = filepath;
    })
  }

  // edit dialog for crfq details
  const detailsDialog = (
    <Dialog
      title="CRFQ Details Edit Form"
      isOpen={states.detailDialogOpen}
      onClose={handleCloseEditDialog}
      style={{width: '750px', height: '700px'}}
    >
      <DialogBody>
        <FormGroup
          inline={formProps.inline}
          label="Customer"
          className='form-label'
        >
          <Suggest
            query={states.detailForm.customer}
            onQueryChange={(e) => setStates((state) => {
              state.detailForm.customer = e;
            })}
            className="form-input"
            items={states.custList}
            itemRenderer={renderCustomerItem}
            onItemSelect={(item) => setStates((state) => {
              state.detailForm.customer = item.title;
            })}
            inputValueRenderer={renderInputValue}
            itemPredicate={filterCustomer}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Project Name"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.detailForm.prjname}
            onChange={(e) => setStates((state) => {
              state.detailForm.prjname = e.target.value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Program Name"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.detailForm.prgname}
            onChange={(e) => setStates((state) => {
              state.detailForm.prgname = e.target.value
            })}
          />
        </FormGroup>
        <RadioGroup
          label="Category"
          onChange={(e) => setStates((state) => {
            state.detailForm.quotecat = e.target.value
          })}
          selectedValue={states.detailForm.quotecat}
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
          className='form-label'
        >
          <DateInput3
            placeholder="M/D/YYYY"
            value={states.detailForm.receivedate}
            onChange={(date) => setStates((state) => {
              state.detailForm.receivedate = date;
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
          className='form-label'
        >
          <DateInput3
            placeholder="M/D/YYYY"
            value={states.detailForm.duedate}
            onChange={(date) => setStates((state) => {
              state.detailForm.duedate = date;
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
          className='form-label'
        >
          <HTMLSelect
            className='form-input'
            value={states.detailForm.receiveby}
            onChange={(e) => setStates((state) => {
              state.detailForm.receiveby = e.target.value
            })}
            options={Object.values(constants.idToWorker)}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Analyzed By"
          className='form-label'
        >
          <HTMLSelect 
            className='form-input'
            value={states.detailForm.analyzeby}
            onChange={(e) => setStates((state) => {
              state.detailForm.analyzeby = e.target.value
            })}
            options={Object.values(constants.idToWorker)}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Validity (days)"
          className='form-label'
        >
          <NumericInput 
            className='form-input'
            value={states.detailForm.validity}
            onValueChange={(value) => setStates((state) => {
              state.detailForm.validity = value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Term"
          className='form-label'
        >
          <HTMLSelect 
            className='form-input'
            value={states.detailForm.term}
            onChange={(e) => setStates((state) => {
              state.detailForm.term = e.target.value
            })}
            options={["None", "COD-N30", "Prepayment", "NET 30", "NET 60"]}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Warranty (months)"
          className='form-label'
        >
          <NumericInput 
            className='form-input'
            value={states.detailForm.warranty}
            onValueChange={(value) => setStates((state) => {
              state.detailForm.warranty = value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Min P.O"
          className='form-label'
        >
          <NumericInput 
            className='form-input'
            value={states.detailForm.minpo}
            onValueChange={(value) => setStates((state) => {
              state.detailForm.minpo = value
            })}
          />
        </FormGroup>
        <FormGroup 
          inline={formProps.inline}
          label="Original Quotation"
          className='form-label'
        >
          <InputGroup 
            className='form-input'
            value={states.detailForm.origquote}
            rightElement={<Button text="browse" minimal={false} onClick={handleFileOpenClick}/>}
          />
        </FormGroup>
      </DialogBody>
      <DialogFooter actions={<Button icon="tick" text="Save" onClick={handleSaveDetailsClick}/>} />
    </Dialog>
  )

  // handle open original quote button
  const handleOpenQuoteClick = () => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    // check if original quote excel filepath was saved before
    if (states.detailForm.origquote === 'N/A') {
      toaster.show({
        message: "Original Quote Excel file doesn't exist!",
        intent: Intent.WARNING
      })
      return;
    } else {
      // if the filepath exists, open it
      window.electronAPI.openFile(states.detailForm.origquote);
    }
  }

  // handle export to csv click
  const handleExportClick = async() => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    // check if crfq item table is empty
    if (states.crfqItems.length < 1) {
      toaster.show({
        message: "CRFQ ITEM table is empty!",
        intent: Intent.WARNING
      })
      return;
    }

    // format the project name to be used as filename
    const formattedPrjname = states.crfqInfo["Project Name"].split('/').join('_').concat('_csv');
    
    // build table to export: headers + rows in the crfq items table
    const headers = [crfqNames]
    const table = headers.concat(states.crfqItems);
    const data = {
      array: table,
      filename: formattedPrjname
    }

    const result = await window.electronAPI.saveCsv(data);

    if (!result) {
      toaster.show({
        message: "Saving canceled.",
        intent: Intent.NONE
      })
    } else {
      toaster.show({
        message: "CSV file has been saved.",
        intent: Intent.SUCCESS
      })
    }
  }

  // handle save changes click
  const handleSaveClick = () => {
    console.log("save!");
  }

  // handle send vendors button click 
  const handleSendVrfqClick = async() => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    // check if crfq item table is empty
    if (states.crfqItems.length < 1) {
      toaster.show({
        message: "CRFQ ITEM table is empty!",
        intent: Intent.WARNING
      })
      return;
    }

    // select parts with assigned vendors only
    const vendorsAssigned = states.crfqItems.filter(row => row[1] !== '');
    const vendorids = vendorsAssigned.map(function(row, index) {return row[50]});
    const uniqueVendors = new Set(vendorids);

    uniqueVendors.forEach(function(value) {
      const selected = states.crfqItems.filter(row => row[50] === value);
      console.log(selected);
      // fetch vendor information

    });


    // window.electronAPI.sendVrfq();
  }

  // crfq summary tags for total buying & selling amount and markup
  const crfqSummaryNames = [
    "Total Buying Amount",
    "Total Selling Amount",
    "Total Markup"
  ]
  
  const crfqSummaryTags = crfqSummaryNames.map((item, index) => {
    return (
      <CompoundTag
        icon={<FunctionsIcon fontSize='small'/>}
        leftContent={item}
        children={states.crfqSummary[index]}
        key={index}
        round={tagProps.round}
        className='crfq-summary-tag'
        fill={tagProps.fill}
        large={tagProps.large}
        intent="none"
        minimal={tagProps.minimal}
      />
    )
  })

  // crfq item count tags
  const crfqItemCountNames = [
    "Total Count",
    "With Vendors",
    "Without Vendors"
  ]
  const crfqItemCountTags = crfqItemCountNames.map((item, index) => {
    return (
      <CompoundTag
        icon={<NumbersIcon fontSize='small'/>}
        leftContent={item}
        children={states.crfqItemCount[item]}
        key={index}
        round={tagProps.round}
        className='crfq-summary-tag'
        fill={tagProps.fill}
        large={tagProps.large}
        minimal={tagProps.minimal}
        intent="none"
      />
    )
  })

  // handle open quotation history click
  const handleOpenQuotHistoryClick = async() => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    // check if crfq item table has records 
    if (states.crfqItems.length < 1) {
      toaster.show({
        message: "CRFQ ITEM table is empty!",
        intent: Intent.WARNING
      })
      return;
    }

    // retrieve customer id and part ids in the crfq items table
    const cuid = states.crfqInfo["CUID"]
    const unique_paid = new Set([])
    states.crfqItems.forEach((row, index) => {
      unique_paid.add(states.crfqItems[index][49])
    } )

    // build urlsearchparams object with the list of unique paid values
    const paid_values = [...unique_paid]
    const params = new URLSearchParams();
    paid_values.forEach(value => params.append('values', value));

    // fetch quot history records based on cuid and paid values
    const url = `${constants.BASE_URL}/api/crfqinfo/quothist?cuid=${cuid}&` + params.toString()
    const response = await fetch(url, {method: 'GET'});
    const data = await response.json();
    
    // parsed the fetched data
    const parsed = data.map(item => {
      const rqid = (item.RQID != null) ? item.RQID : 'N/A';
      const prjname = (item.PRJNAME != null) ? item.PRJNAME : 'N/A';
      const receivedate = (item.DTRECIEVE != null) ? format(new Date(item.DTRECIEVE), 'yyyy-MM-dd') : null;
      const partno = (item.PARTNO != null) ? item.PARTNO : 'N/A';
      const seq = (item.SEQ != null) ? item.SEQ : 'N/A';
      const unit = (item.UNITS != null) ? item.UNITS : 'N/A';
      const vendor = (item.VENDOR != null) ? item.VENDOR : 'N/A';
      const manufacturer = (item.MFG != null) ? item.MFG : 'N/A';
      const requestedQty = (item.NEEDED != null) ? item.NEEDED : 'N/A';
      const price = (item.PRICE != null) ? Math.round(item.PRICE*100)/100 : 'N/A';
      const amount = (item.AMOUNT != null) ? Math.round(item.AMOUNT*100)/100 : 'N/A';
      const qty = (item.QTY != null) ? item.QTY : 'N/A';
      const markupPrice = (item.MPRICE != null) ? Math.round(item.MPRICE*100)/100 : 'N/A';
      const markupAmt = (item.MAMOUNT != null) ? Math.round(item.MAMOUNT*100)/100 : 'N/A';
      const markup = Math.round(((markupAmt-amount)/amount)*100)/100;
      const vdel = (item.VDEL != null) ? item.VDEL : 'N/A';
      const cdel = (item.DELDATES != null) ? item.DELDATES : 'N/A';
      const buyer = (item.RECIEVEBY != null) ? constants.idToWorker[item.RECIEVEBY] : 'N/A';

      return [rqid, prjname, receivedate, partno, seq, unit, vendor, manufacturer, requestedQty, price, amount, qty, markupPrice, markupAmt, markup, vdel, cdel, buyer]
    })

    setStates((state) => {
      state.quotHist = parsed;
      state.isOpen.quotDrawer = true;
    })
  }

  // handle open stock click
  const handleOpenStockClick = async() => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    // check if crfq item table has records 
    if (states.crfqItems.length < 1) {
      toaster.show({
        message: "CRFQ ITEM table is empty!",
        intent: Intent.WARNING
      })
      return;
    }
    // retrieve unique part ids in the crfq items table
    const unique_paid = new Set([])
    states.crfqItems.forEach((row, index) => {
      unique_paid.add(states.crfqItems[index][49])
    } )

    // build urlsearchparams object with the list of unique paid values
    const paid_values = [...unique_paid]
    const params = new URLSearchParams();
    paid_values.forEach(value => params.append('values', value));

    // fetch stock inventory based on the paid values
    const url = `${constants.BASE_URL}/api/crfqinfo/stock?` + params.toString()
    const response = await fetch(url, {method: 'GET'});
    const data = await response.json();
    
    // parsed the fetched data
    const parsed = data.map(item => {
      const smid = (item.SMID != null) ? item.SMID : 'N/A'; // receiving id
      const partno = (item.PARTNO != null) ? item.PARTNO : 'N/A';
      const vponum = (item.PONUM != null) ? item.PONUM : 'N/A';
      const manufacturer = (item.MFG != null) ? item.MFG : 'N/A'
      const receivedate = (item.RECEIVEDATE != null) ? format(new Date(item.RECEIVEDATE), 'yyyy-MM-dd') : 'N/A';
      const seq = (item.SEQ != null) ? item.SEQ : 'N/A';
      const qty = (item.QTY != null) ? item.QTY : 'N/A';
      const units = (item.UNITS != null) ? item.UNITS : 'N/A';
      const code = (item.COD != null) ? item.COD : 'N/A';
      const datecode = (item.DATECODE != null) ? item.DATECODE : 'N/A';
      const invcheckdate = (item.INVCHECKDATE != null) ? format(new Date(item.INVCHECKDATE), 'yyyy-MM-dd') : 'N/A';
      const location = (item.REMARK != null) ? item.REMARK : 'N/A';
      const availqty = (item.AVAIL != null) ? item.AVAIL : 'N/A';

      return [smid, partno, vponum, manufacturer, receivedate, seq, qty, units, code, datecode, invcheckdate, location, availqty]
    })

    setStates((state) => {
      state.stock = parsed;
      state.isOpen.stockDrawer = true;
    })
  }

  // crfq individual item price tag names
  const crfqPriceNames = [
    "Buying Amount",
    "Selling Amount",
    "Markup"
  ]
  const crfqPriceTags = crfqPriceNames.map((item, index) => {
    return (
      <CompoundTag
        icon={<AttachMoneyIcon fontSize='small' />}
        leftContent={item}
        children={states.crfqPriceDetails[item]}
        key={index}
        round={tagProps.round}
        className='crfq-summary-tag'
        fill={tagProps.fill}
        large={tagProps.large}
        intent="none"
        minimal={tagProps.minimal}
      />
    )
  })

  // part detail tag names
  const crfqPartNames = [
    "Discontinued",
    "Description",
    "NSN",
    "Classification",
    "ECCN",
    "HSCODE",
    "Payterm"
  ]
  const crfqPartTags = crfqPartNames.map((item, index) => {
    return (
      <CompoundTag
        icon="info-sign"
        leftContent={item}
        children={states.crfqParts[item]}
        key={index}
        round={tagProps.round}
        className='crfq-summary-tag'
        fill={tagProps.fill}
        large={tagProps.large}
        intent="none"
        minimal={tagProps.minimal}
      />
    )
    
  })

  // handle focus change in the crfq items table
  const handleCrfqFocusChange = async(coords) => {
    // check if crfq item table has records
    if (states.crfqItems.length < 1) {
      return
    }
    const paid = states.crfqItems[coords.row][49];
    const vdid = states.crfqItems[coords.row][50]; 

    // update the focused cell coords of crfq items table
    setStates((state) => {
      state.focusedCellCoords.crfqItems.row = coords.row;
      state.focusedCellCoords.crfqItems.col = coords.col;
    })

    // update crfq price tags with the focused row's buying/selling amount and markp up
    const buyingamount = states.crfqItems[coords.row][13]; // amount column
    const sellingamount = states.crfqItems[coords.row][15]; // mamount column
    const markup = Math.round(((sellingamount - buyingamount)/buyingamount)*100)/100;
    const markupValue = isNaN(markup) ? 'N/A' : markup;
    setStates((state) => {
      state.crfqPriceDetails["Buying Amount"] = buyingamount;
      state.crfqPriceDetails["Selling Amount"] = sellingamount;
      state.crfqPriceDetails["Markup"] = markupValue;

      // update the part & vendor id
      state.crfqParts["vdid"] = vdid;
      state.crfqParts["paid"] = paid;
    })

    // check if part id exists
    if (!paid) {
      return;
    }
    
    // fetch part details for the focused crfq item cell
    try {
      const response = await fetch(`${constants.BASE_URL}/api/crfqinfo/parts?paid=${paid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched data
      const parsed = data.map(item => {
        const descr = (item.DESCRIPTION != null) ? item.DESCRIPTION : 'N/A';
        const eccn = (item.ECCN != null) ? item.ECCN : 'N/A';
        const hscode = (item.HSCODE != null) ? item.HSCODE : 'N/A';
        const nsn = (item.INT_PID != null) ? item.INT_PID : 'N/A';
        const notes = (item.NOTES != null) ? item.NOTES : 'N/A';
        const trouble = (item.TROBLE != null) ? item.TROBLE : 'N/A';
        const internal = (item.INTERNALNOTE != null) ? item.INTERNALNOTE : 'N/A';
        const discontinued = (item.DISCONTINUED != null) ? item.DISCONTINUED : 'N/A';
        const reason = (item.REASON != null) ? item.REASON : '';

        // build the classification string
        var classification = '';
        const dos_el_reqd = (item.DOS_EL_REQD != null) ? item.DOS_EL_REQD : '-';
        const sme = (item.SME != null) ? item.SME : '-';
        const bis_el_reqd = (item.BIS_EL_REQD != null) ? item.BIS_EL_REQD : '-';
        const isnlr = (item.ISNLR != null) ? item.ISNLR : '-';
        const nlr_country = (item.NLR_COUNTRY != null) ? item.NLR_COUNTRY : '-';
        const isc32 = (item.ISC32 != null) ? item.ISC32 : '-';
        if (dos_el_reqd === 'Y') {
          classification = 'DOS E/L Required.';
          if (sme === 'Y') {
            classification += ' SME';
          }
        } else {
          if (bis_el_reqd === 'Y') {
            classification = 'BIS E/L';
          } else {
            if (isnlr === 'Y') {
              classification = 'NLR';

              if (nlr_country !== '-') {
                let country = ' ' + nlr_country;
                classification += country;
              }
              if (isc32 === 'Y') { 
                classification += ' C32';
              } else {
                classification += ' C33';
              }
            } 
          }
        }
        if (classification === ''){
          classification = 'N/A';
        }

        return {
          "Classification": classification,
          "Description": descr,
          "ECCN": eccn,
          "HSCODE": hscode,
          "NSN": nsn,
          "Part Notes": notes,
          "Part Trouble": trouble,
          "Part Internal": internal,
          "Discontinued": discontinued,
          "Reason": reason
        }
      })[0];
      setStates((state) => {
        state.crfqParts["Classification"] = parsed["Classification"];
        state.crfqParts["Description"] = parsed["Description"];
        state.crfqParts["ECCN"] = parsed["ECCN"];
        state.crfqParts["HSCODE"] = parsed["HSCODE"];
        state.crfqParts["NSN"] = parsed["NSN"];
        state.crfqParts["Part Notes"] = parsed["Part Notes"];
        state.crfqParts["Part Trouble"] = parsed["Part Trouble"];
        state.crfqParts["Part Internal"] = parsed["Part Internal"];
        state.crfqParts["Discontinued"] = parsed["Discontinued"];
        state.crfqParts["Reason"] = parsed["Reason"];
      })

    } catch (error) {
      console.error("Error fetching crfq item's part details");
    }

    // check  if vendor id exists
    if (!vdid) {
      // clear the vendor-related notes and tag
      setStates((state) => {
        state.crfqParts["Vendor Notes"] = "";
        state.crfqParts["Vendor Trouble"] = "";
        state.crfqParts["Payterm"] = "";
      })
      return;
    }
    // now fetch vendor details for the focused crfq item cell
    try {
      const response = await fetch(`${constants.BASE_URL}/api/crfqinfo/vendor?vdid=${vdid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched data
      const parsed = data.map(item => {
        const notes = (item.NOTES != null) ? item.NOTES : 'N/A';
        const trouble = (item.TROBLE != null) ? item.TROBLE: 'N/A';
        const payterm = (item.PAYINT != null) ? item.PAYINT : 'N/A';

        return {
          "Vendor Notes": notes,
          "Vendor Trouble": trouble,
          "Payterm": payterm
        }
      })[0];
      setStates((state) => {
        state.crfqParts["Vendor Notes"] = parsed["Vendor Notes"];
        state.crfqParts["Vendor Trouble"] = parsed["Vendor Trouble"];
        state.crfqParts["Payterm"] = parsed["Payterm"];
      })

    } catch (error) {
      console.error("Error fetching crfq item's vendor details");
    }
  } 


  // handle save notes button click in the part&vendor details card
  const handleSaveNotesClick = async() => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    const discontinuedToaster = OverlayToaster.create({position: "bottom"});
    // first check if a row in crfq items has been selected (focused)
    if (!("paid" in states.crfqParts)) {
      toaster.show({
        message: "CRFQ item row must be selected!",
        intent: Intent.WARNING
      })
      return;
    } else {
      // retrieve part and vendor id of the selected crfq item row
      const paid = states.crfqParts["paid"];
      const vdid = states.crfqParts["vdid"];
      var discontinued = states.crfqParts["Discontinued"];

      // if part discontinued reason textarea is not empty, update discontinued field
      if ((states.crfqParts["Discontinued"] === 'N') & states.crfqParts["Reason"] !== '') {
        discontinued = 'Y';
        discontinuedToaster.show({
          message: "Part has been marked as Discontinued!",
          intent: Intent.WARNING
        })
      } else if (states.crfqParts["Discontinued"] === 'Y' & states.crfqParts["Reason"] === '') {
        discontinued = 'N';
        discontinuedToaster.show({
          message: "Part has been marked as NOT Discontinued!",
          intent: Intent.WARNING
        })
      }
      
      try {
        const response = await fetch(`${constants.BASE_URL}/api/crfqinfo/notes?paid=${paid}&vdid=${vdid}`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            partNotes: states.crfqParts["Part Notes"],
            partTrouble: states.crfqParts["Part Trouble"],
            partInternal: states.crfqParts["Part Internal"],
            partReason: states.crfqParts["Reason"],
            partDiscontinued: discontinued,
            vendorNotes: states.crfqParts["Vendor Notes"],
            vendorTrouble: states.crfqParts["Vendor Trouble"]
          })
        })
        const data = await response.json();
        if (data) {
          toaster.show({
            message: "CRFQ Item Part & Vendor notes have been saved!",
            intent: Intent.SUCCESS
          });
          // console.log(states.focusedCellCoords.crfqItems);
          handleCrfqFocusChange({row: states.focusedCellCoords.crfqItems.row, col: states.focusedCellCoords.crfqItems.col});
        }
      } catch (error) {
        console.error("Error posting crfq part and vendor notes", error)
        toaster.show({
          message: "CRFQ Item Part & Vendor notes save failed!",
          intent: Intent.WARNING
        })
      }
    }
  }

  // quot history table column names
  const quotNames = [
    "RQID",
    "Project",
    "Quot Date",
    "Part No.",
    "SEQ",
    "UNIT",
    "Vendor",
    "Manufacturer",
    "Requested Qty",
    "Price",
    "Amount",
    "B.Qty",
    "Markup Price",
    "Markup Amount",
    "Markup",
    "VDEL",
    "CDEL",
    "Buyer"
  ]

  // quot history column width values
  const quotWidths = {
    rqid: 80,
    prjname: 180,
    quotdate: 100,
    partno: 160,
    seq: 50,
    unit: 50,
    vendor: 210,
    manufacturer: 140,
    requestedqty: 130,
    price: 80,
    amount: 90,
    bqty: 60,
    markupPrice: 120,
    markupAmount: 140,
    markup: 80,
    vdel: 80,
    cdel: 80,
    buyer: 100
  }
  const quotWidthValues = Object.values(quotWidths);

  // handle double-click within the ordered quotation history table
  const handleQuotHistDoubleClick = (rowIndex, columnIndex) => {
    
    // id is the first column of the table
    const rqid = states.quotHist[rowIndex][0];
    const url = baseUrl+`#/crfqinfo?rqid=${rqid}`;
    const title = 'CRFQ Info';
    window.electronAPI.openWindow([url, title]);
  }

  // quot history cell renderer
  const quotHistCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}>
        <div
          onDoubleClick={() => {
            handleQuotHistDoubleClick(rowIndex, columnIndex)
          }}
        >
          <TruncatedFormat detectTruncation={true}>
            {states.quotHist[rowIndex][columnIndex]}
          </TruncatedFormat>
        </div>
      </Cell>
    )
  }

  // quot history table header renderer
  const renderQuotHistHeader = (index) => {
    return (
      <ColumnHeaderCell
        name={quotNames[index]}
        index={index}
        nameRenderer={constants.renderName}
      />
    )
  }

  // quot history columns
  const quotHistColumns = quotNames.map((index) => {
    return (
      <Column
        key={index}
        cellRenderer={quotHistCellRenderer}
        columnHeaderCellRenderer={renderQuotHistHeader}
      />
    )
  })

  // drawer props
  const drawerProps = {
    size: DrawerSize.SMALL,
    hasBackdrop: false,
    position: "bottom",
    canOutsideClickClose: false,
    enforceFocus: false
  }

  // quotation history drawer
  const renderQuotDrawer = () => {
    var content;
    if (states.quotHist.length > 0) {
      content = (
        <Table2
          numRows={states.quotHist.length}
          renderMode={RenderMode.BATCH}
          columnWidths={quotWidthValues}
        >
          {quotHistColumns}
        </Table2>
      )
    } else {
      content = (
        <NonIdealState
          icon="search"
          description={"No ordered quotation history from this customer!"}
      />
      )
    }
    return (
      <Drawer
        title="Ordered Quotation History"
        isOpen={states.isOpen.quotDrawer}
        size={drawerProps.size}
        onClose={() => {
          setStates((state) => {
            state.isOpen.quotDrawer = false;
          })
        }}
        hasBackdrop={drawerProps.hasBackdrop}
        position={drawerProps.position}
        canOutsideClickClose={drawerProps.canOutsideClickClose}
        enforceFocus={drawerProps.enforceFocus}
      >
        {content}
      </Drawer>
    )
  }
  

  // stock table column names
  const stockNames = [
    "SMID",
    "Part No.",
    "VPO #",
    "Manufacturer",
    "Receive Date",
    "SEQ",
    "Qty",
    "UI",
    "CODE",
    "Datecode",
    "Inv Check Date",
    "Location",
    "Available Qty"
  ]

  // stock table column widths
  const stockWidths = {
    smid: 80,
    partno: 150,
    vpono: 150,
    manufacturer: 150,
    receivedate: 120,
    seq: 60,
    qty: 50,
    ui: 50,
    code: 60,
    datecode: 100,
    invcheckdate: 150,
    location: 150,
    availqty: 120
  }
  const stockWidthValues = Object.values(stockWidths);

  // stock table cell renderer
  const stockCellRenderer = (rowIndex, columnIndex) => {
    return (
      <Cell interactive={true}
      >
        <TruncatedFormat detectTruncation={true}>
            {states.stock[rowIndex][columnIndex]}
          </TruncatedFormat>
      </Cell>
    )
  }
  
  // stock table header renderer
  const renderStockHeader = (index) => {
    return (
      <ColumnHeaderCell
        name={stockNames[index]}
        index={index}
        nameRenderer={constants.renderName}
      />
    )
  }

  // stock table columns
  const stockColumns = stockNames.map((index) => {
    return (
      <Column
        key={index}
        cellRenderer={stockCellRenderer}
        columnHeaderCellRenderer={renderStockHeader}
      />
    )
  })

  // crfq items stock drawer
  const renderStockDrawer = () => {
    var content;
    if (states.stock.length > 0) {
      content = (
        <Table2
          numRows={states.stock.length}
          renderMode={RenderMode.BATCH}
          columnWidths={stockWidthValues}
        >
          {stockColumns}
        </Table2>
      )
    } else {
      content = (
        <NonIdealState
          icon="search"
          description={"No available stock"}
        />
      )
    }
    return (
      <Drawer
        title="Available Stock"
        isOpen={states.isOpen.stockDrawer}
        size={drawerProps.size}
        onClose={() => {
          setStates((state) => {
            state.isOpen.stockDrawer = false;
          })
        }}
        hasBackdrop={drawerProps.hasBackdrop}
        position={drawerProps.position}
        canOutsideClickClose={drawerProps.canOutsideClickClose}
        enforceFocus={drawerProps.enforceFocus}
      >
        {content}
      </Drawer>
    )
  }
    

  // handle open part & vendor click
  const handleOpenPartVendorClick = (param) => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    var url;
    var title;

    // check if crfq item record has been selected
    if (states.crfqParts["paid"] === undefined) {
      toaster.show({
        message: "CRFQ Item row must be selected!",
        intent: Intent.WARNING
      })
      return;
    }

    // check if paid or vdid values exist, i.e. part and vendor has been selected
    if (param == "Part") {
      const paid = states.crfqParts["paid"];
      if (paid === 0) {
        toaster.show({
          message: "Part has not been selected!",
          intent: Intent.WARNING
        })
        return;
      }
      url = baseUrl+`#/partinfo?paid=${paid}`;
      title = 'Part Info';
    } else if (param == "Vendor") {
      const vdid = states.crfqParts["vdid"];
      if (!vdid) {
        toaster.show({
          message: "Vendor has not been assigned!",
          intent: Intent.WARNING
        })
        return;
      }
      url = baseUrl+`#/vendinfo?vdid=${vdid}`;
      title = 'Vendor Info';
    }
    window.electronAPI.openWindow([url, title]);
  }

  const cpoMenuItems = (
    <Menu
    >
      {states.linkedCPOs.map((item, index) => {
        return (
          <div key={index}>
            <MenuItem
              text={`${item.orderno}[${item.cpid}]`}
            />
          </div>
        )
      })}
    </Menu>
  )

  const handleCreateCrfqClick = async() => {
    // initialize the toaster for crfq info page
    const toaster = OverlayToaster.create({position: "top"});
    // check if crfq item table is empty
    if (states.crfqItems.length < 1) {
      toaster.show({
        message: "CRFQ ITEM table is empty!",
        intent: Intent.WARNING
      })
      return;
    }

    // format the project name to be used as filename
    const formattedPrjname = states.crfqInfo["Project Name"].split('/').join('_');

    // create crfq for 'selected' crfq items only
    const selected = states.crfqItems.filter(row => row[5] === 'Y');
    const data = {
      customer: 'customer',
      array: selected,
      filename: formattedPrjname
    }
    const result = await window.electronAPI.createCrfq(data);

    if (!result) {
      toaster.show({
        message: "Creating CRFQ canceled.",
        intent: Intent.NONE
      })
    } else {
      toaster.show({
        message: "CRFQ has been created.",
        intent: Intent.SUCCESS
      })
    }
  }

  // handle copy click in the crfq items body context menu
  const handleCopyClick = (selectedRows, selectedCols) => {
    // console.log(selectedRows, selectedCols);
    const selectedRow = selectedRows[0];
    const selectedCol = selectedCols[0];
    const copiedValue = states.crfqItems[selectedRow][selectedCol];


    if (copiedValue) {
      window.electronAPI.copyToClipboard(copiedValue);
    }
    // console.log(states.crfqItems[selectedRow][selectedCol]);
    // const startRow = selectedRows[0], endRow = selectedRows[1];
    // const startCol = selectedCols[0], endCol = selectedCols[1];
    
    // const selectedValues = []
    // for (let i = startRow; i < endRow+1; i++) {
    //   const row = []
    //   for (let j = startCol; j < endCol+1; j++) {
    //     if (states.crfqItems[i][j] !== null) {
    //       row.push(states.crfqItems[i][j])
    //     }
    //   }
    //   selectedValues.push(row)
    // }
    // setStates((state) => {
    //   state.copiedValues = selectedValues;
    //   console.log('copied: ', states.copiedValues);
    // })
  }

  // handle paste click in the crfq items body context menu
  const handlePasteClick = async(event) => {
    // check if selected cell is partno, vendor, qiid, amount, or amount column
    // pasting into these columns should not be possible
    const currentCol = states.focusedCellCoords.crfqItems.col;
    if (currentCol === 0 || currentCol === 1 || currentCol === 3 || currentCol === 13 || currentCol === 15) {
      return;
    }
    // read text from the clipboard
    const text = await window.electronAPI.readClipboard();
    
    // paste the clipboard text into the current cell value
    event.target.innerText = text;
    
  }

  // handle partno input dialog open
  const handlePartnoInputDialogOpen = () => {
    setStates((state) => {
      state.isOpen.partnoInputDialog = true;
    })
  }

  // handle partno input dialog close
  const handlePartnoInputDialogClose = () => {
    setStates((state) => {
      state.isOpen.partnoInputDialog = false;
    })
  }

  // handle partno select from partno input omnibar
  const handlePartnoSave = async() => {
    // initialize the toaster 
    const toaster = OverlayToaster.create({position: "top"});

    // retrieve the current focused cell coords
    const focusedRow = states.focusedCellCoords.crfqItems.row;
    const focusedCol = states.focusedCellCoords.crfqItems.col

    const response = await fetch(`${constants.BASE_URL}/api/crfqinfo/parts/edit?input=${states.partnoInput}`, {method: 'GET'});
    const data = await response.json();

    // check if the partno input is a valid part, i.e. paid exists
    if (data.length === 0) {
      toaster.show({
        message: "Part not found!",
        intent: Intent.WARNING
      })
      return;
    }

    // check if query returned a paid i.e. input partno was valid
    const paid = data[0].PAID;

    // update the partno & paid value of the current focused cell
    setStates((state) => {
      state.crfqItems[focusedRow][0] = state.partnoInput; // partno col
      state.crfqItems[focusedRow][49] = paid; // paid col
      state.crfqParts["paid"] = paid; // update the paid for part tags

      // reset the partno input value
      state.partnoInput = '';

      // close the partno edit dialog
      state.isOpen.partnoInputDialog = false;

      // call handlefocus again to update the part & vendor details
      // handleCrfqFocusChange({row: focusedRow, col: focusedCol});
    })
  }    

  // render partno input dialog
  const renderPartnoInputDialog = () => {
    return (
      <Dialog
        title="Edit Partno Input Dialog"
        isOpen={states.isOpen.partnoInputDialog}
        onClose={handlePartnoInputDialogClose}
      >
        <DialogBody>
          <InputGroup
            value={states.partnoInput}
            onChange={(e) => {
              setStates((state) => {
                state.partnoInput = e.target.value;
              })
            }}
            autoFocus={true}
          />
        </DialogBody>
        <DialogFooter actions={<Button icon="tick" text="save" onClick={handlePartnoSave}/>}/>
      </Dialog>
    )
  }

  // handle delete row menuitem click in crfq items table
  const handleDeleteRowClick = (rows, cols) => {
    // retrieve selected row coords
    const selectedRow = rows[0];

    // !TO-DO: actually delete the crfq item record from crfqitems table


    // delete the selected row from crfq items
    setStates((state) => {
      state.crfqItems.splice(selectedRow, 1);
    })

  }

  // handle apply markup click in crfq items context menu
  const handleApplyMarkupClick = (rows, cols) => {
    const curRow = rows[0];
    const curCol = cols[0];

    // console.log('mark up value: ', markupValueRef.current.value)
    const markup = parseFloat(markupValueRef.current.value);
    // launch markup input dialog


    const startRow = rows[0], endRow = rows[1];
    const startCol = cols[0], endCol = cols[1];
    
    for (let i = startRow; i < endRow + 1; i++) {
      const price = parseFloat(states.crfqItems[i][11]);
      const markupPrice = price*(1+markup);
      const qty = parseInt(states.crfqItems[i][12]);
      const buyingAmount = states.crfqItems[i][13];
      const sellingAmount = Math.round(markupPrice*qty*100)/100;

      setStates((state) => {
        // compute markup price
        state.crfqItems[i][14] = Math.round(markupPrice*100)/100;

        // compute markup amount
        state.crfqItems[i][15] = sellingAmount;

        // update price detail tags
        state.crfqPriceDetails["Buying Amount"] = buyingAmount;
        state.crfqPriceDetails["Selling Amount"] = sellingAmount;
        state.crfqPriceDetails["Markup"] = Math.round(((sellingAmount - buyingAmount)/buyingAmount)*100)/100;
      })
    }

  }

  // handle markup value input change
  const handleMarkupValueChange = (value) => {
    setStates((state) => {
      state.markupValue = value;
    })
  }

  // handle closing vendor assignment dialog
  const handleAssignVendorDialogClose = () => {
    setStates((state) => {
      state.isOpen.assignVendorDialog = !(state.isOpen.assignVendorDialog);
    })
  }

  // handle opening vendor assignment dialog
  const handleAssignVendorDialogOpen = (rows, cols) => {
    // store the row indices that will be assigned vendors
    setStates((state) => {
      // clear the existing row indices
      state.rowsToAssignVendors = [];
      for (var i= rows[0]; i <= rows[1]; i++) {
        state.rowsToAssignVendors.push(i);
      }
      state.isOpen.assignVendorDialog = true;
    })
  }

  // handle assign button click in the vendor assignment dialog
  const handleAssignVendorsClick = () => {
    console.log('rows to assign vendors: ', states.rowsToAssignVendors);

    setStates((state) => {
      // close the dialog
      state.isOpen.assignVendorDialog = false;
    })

  }

  // render assign vendor dialog
  const renderAssignVendorDialog = () => {
    return (
      <Dialog
        title="Vendor Assignment Form"
        isOpen={states.isOpen.assignVendorDialog}
        onClose={handleAssignVendorDialogClose}
      >
        <DialogBody>
          test
        </DialogBody>
        <DialogFooter actions={<Button icon="tick" text="Assign" onClick={handleAssignVendorsClick}/>} />
      </Dialog>
    )
  }

  // body contexxt menu for crfq items table
  const renderBodyContextMenu = (event) => {
    if (event.selectedRegions) {
      // console.log('selected: ', event.selectedRegions);
      // console.log('selected: ', event.selectedRegions)
      const selectedRows = event.selectedRegions.map((region) => {
        console.log('rows :', region.rows)
        return region.rows;
      })
      const selectedCols = event.selectedRegions.map((region) => {
        console.log('cols: ', region.cols)
        return region.cols;
      })
      console.log('selected: ', selectedRows, selectedCols)
      // const selectedRows = event.selectedRegions[0].rows;
      // const selectedCols = event.selectedRegions[0].cols;
      
      return (
        <Menu>
          <MenuItem 
            icon="edit" 
            text="Edit Part No."  
            // check if selected column is 'partno' column and vendor is not assigned yet
            disabled={(selectedCols[0] === 0 && states.crfqItems[selectedRows[0]][1] === '') ? false : true}
            onClick={() => handlePartnoInputDialogOpen()}
          />
          <MenuItem 
            icon="plus" 
            text="Assign Vendor" 
            // check if selected column is 'vendor' column and vendor is not assigned yet
            disabled={(selectedCols[0] === 1 && states.crfqItems[selectedRows[0]][1] === '') ? false : true }
            onClick={() => handleAssignVendorDialogOpen(selectedRows, selectedCols)}
          />
          <MenuItem
            icon="calculator"
            text="Apply Markup"
            // check if selected column is 'Price' column
            disabled={(selectedCols[0] === 11) ? false : true}
            // onClick={() => handleApplyMarkupClick(selectedRows, selectedCols)}
          >
            <NumericInput
              inputRef={markupValueRef}
              asyncControl={true}
              value={states.markupValue} 
              onValueChange={handleMarkupValueChange}
              rightElement={
                <Button
                  text="save"
                  minimal={true}
                  onClick={() => handleApplyMarkupClick(selectedRows, selectedCols)}
                />
              }
              fill={true}
              stepSize={1}
            />
          </MenuItem>
          <MenuItem 
            icon="delete" 
            text="Delete Row" 
            onClick={() => handleDeleteRowClick(selectedRows, selectedCols)}
          />
        </Menu>
        )
      }
  }

  // retrieve cell value in crfq items table
  const getCellData = (rowIndex, colIndex) => {
    return states.crfqItems[rowIndex][colIndex];
  }

  // define keyboard shortcuts
	const hotkeys = useMemo(() => [
		{
			combo: "ctrl+v",
			onKeyDown: handlePasteClick,
			global:true,
			label: "handle paste into crfq items table"
		}
	])

	const {handleKeyDown, handleKeyUp} = useHotkeys(hotkeys);

  
  return (
    <div 
      className='crfq-page'
      // onKeyDown={handleKeyDown}
      // onKeyUp={handleKeyUp}
    > 
      {renderStockDrawer()}
      {renderQuotDrawer()}
      {renderPartnoInputDialog()}
      {renderAssignVendorDialog()}
      {detailsDialog}
      <Card className='crfq-detail-card'>
        {/* <dl className='crfq-info-dl'>
          {crfqInfoDetails}
        </dl> */}
        <div className='crfq-detail-header'>
          <h2>CRFQ Details</h2>
          <ButtonGroup>
            <Button 
              icon="edit" 
              className='edit-button' 
              text="Edit Details" 
              onClick={handleEditDetailsClick}
            />
            <Button icon={<OpenInNewIcon fontSize='small'/>} className='open-button' text="Original Quote" onClick={handleOpenQuoteClick}/>
            <Button 
              icon="duplicate" 
              text="Make a copy" 
              disabled={true}
            />
            <Popover
              content={cpoMenuItems}
              isOpen={states.isOpen.cpoMenu}
              onInteraction={(nextOpenState) => setStates((state) => {
                state.isOpen.cpoMenu = nextOpenState;
              })}
              minimal={false}
              placement="right"
            >
              <Button 
                icon={<OpenInNewIcon fontSize='small'/>} 
                text="Open CPO" 
                className='open-button' 
                disabled={states.cpoButtonStatus}
              />
            </Popover>
          </ButtonGroup>
        </div>
        <div>
          {crfqInfoDetails}
        </div>
      </Card>
      <Card className='items-card'>
        <div className='items-header'>
          <h2>CRFQ Items</h2>
          <ButtonGroup>
            <Button 
              icon="tick" 
              className='save-button' 
              text="Save Changes" 
              onClick={handleSaveClick}
            />
            <Button 
              icon="bring-forward" 
              className='open-button' 
              text="Quot History" 
              onClick={handleOpenQuotHistoryClick}
            />
            <Button 
              icon="bring-forward" 
              className='open-button' 
              text="Stock" 
              onClick={handleOpenStockClick}
            />
            <Button 
              icon="export" 
              className='export-button' 
              text="Export to CSV" 
              onClick={handleExportClick}
            />
            <Button 
              icon="generate" 
              className='export-button' 
              text="Create CRFQ" 
              onClick={handleCreateCrfqClick}
            />
            <Button 
              icon="send-message" 
              className='send-button' 
              text="Send VRFQ" 
              onClick={handleSendVrfqClick}
              disabled={true}
            />
          </ButtonGroup>
        </div>
        <div className='items-tags'>
          {crfqItemCountTags}
          {crfqSummaryTags}
          {crfqPriceTags}
        </div>
        <div
          onKeyDown={handleKeyDown}
        >
          <Table2
            className='items-table'
            numRows={states.crfqItems.length} 
            renderMode={RenderMode.BATCH_ON_UPDATE}
            cellRendererDependencies={[states.crfqItems, states.filter]}
            enableFocusedCell={true}
            numFrozenColumns={3}
            columnWidths={crfqItemWidthValues}
            onFocusedCell={handleCrfqFocusChange}
            ref={crfqItemRef}
            bodyContextMenuRenderer={renderBodyContextMenu}
            getCellClipboardData={getCellData}
          >
            {crfqItemsColumns}
          </Table2>
        </div>
      </Card>
      <Card className='part-detail-card'>
        <div className='part-details-header'>
          <h2>Part & Vendor Details</h2>
          <ButtonGroup>
            <Button 
              icon="tick" 
              className='save-button' 
              text="Save Changes" 
              onClick={handleSaveNotesClick}
            />
            <Button 
              icon={<OpenInNewIcon 
              fontSize='small'/>} 
              className='open-button' 
              text="Open Part" 
              onClick={() => handleOpenPartVendorClick("Part")}
            />
            <Button 
              icon={<OpenInNewIcon fontSize='small'/>} 
              className='open-button' 
              text="Open Vendor" 
              onClick={() => handleOpenPartVendorClick("Vendor")}
            />
          </ButtonGroup>
        </div>
        <div className='part-tags'>
          {crfqPartTags}
        </div>
        <div className='textareas-notes-div'>
          <FormGroup
            label="Part Notes"
          >
            <TextArea
              readOnly={textareaProps.readOnly}
              value={states.crfqParts["Part Notes"]}
              onChange={(e) => {
                setStates((state) => {
                  state.crfqParts["Part Notes"] = e.target.value;
                })
              }}
              large={textareaProps.large}
              fill={textareaProps.fill}
              className='textareas-notes'
            />
          </FormGroup>
          <FormGroup
            label="Part Internal Notes"
          >
            <TextArea
              readOnly={textareaProps.readOnly}
              value={states.crfqParts["Part Internal"]}
              onChange={(e) => {
                setStates((state) => {
                  state.crfqParts["Part Internal"] = e.target.value;
                })
              }}
              large={textareaProps.large}
              fill={textareaProps.fill}
              className='textareas-notes'
            />
          </FormGroup>
          <FormGroup
            label="Part Trouble Notes"
          >
            <TextArea
              readOnly={textareaProps.readOnly}
              value={states.crfqParts["Part Trouble"]}
              onChange={(e) => {
                setStates((state) => {
                  state.crfqParts["Part Trouble"] = e.target.value;
                })
              }}
              large={textareaProps.large}
              fill={textareaProps.fill}
              className='textareas-notes'
            />
          </FormGroup>
          <FormGroup
            label="Part Discontinued Reason"
          >
            <TextArea
              readOnly={textareaProps.readOnly}
              value={states.crfqParts["Reason"]}
              onChange={(e) => {
                setStates((state) => {
                  state.crfqParts["Reason"] = e.target.value;
                })
              }}
              large={textareaProps.large}
              fill={textareaProps.fill}
              className='textareas-notes'
            />
          </FormGroup>
          <FormGroup
            label="Vendor Notes"
          >
            <TextArea
              readOnly={textareaProps.readOnly}
              value={states.crfqParts["Vendor Notes"]}
              onChange={(e) => {
                setStates((state) => {
                  state.crfqParts["Vendor Notes"] = e.target.value;
                })
              }}
              large={textareaProps.large}
              fill={textareaProps.fill}
              className='textareas-notes'
            />
          </FormGroup>
          <FormGroup
            label="Vendor Trouble Notes"
          >
            <TextArea
              readOnly={textareaProps.readOnly}
              value={states.crfqParts["Vendor Trouble"]}
              onChange={(e) => {
                setStates((state) => {
                  state.crfqParts["Vendor Trouble"] = e.target.value;
                })
              }}
              large={textareaProps.large}
              fill={textareaProps.fill}
              className='textareas-notes'
            />
          </FormGroup>
        </div>
      </Card>
    </div>
  );
};

export default CRFQ;
