import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback,
  useMemo
} from 'react';
import { 
  Button,
  Tag,
  TextArea,
  Switch,
  Intent,
  useHotkeys,
  Tooltip,
  ButtonGroup,
  Card,
  CompoundTag,
  Menu,
  MenuItem,
  Popover
} from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css'; // Import Blueprint.js core styles
import '@blueprintjs/table/lib/css/table.css'; // Import Blueprint.js table styles
import '../styles/partinfo.scss'
import {useImmer} from 'use-immer';
import { OverlayToaster, Position } from "@blueprintjs/core";
import {format} from 'date-fns';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import constants from '../config';

const PartInfo = () => {

  // part data  has to be initialized with dash strings to avoid empty error
  const [part, setPart] = useState([]);

  // editable state for the textareas
  const [isEditable, setIsEditable] = useState(true);

  // textarea state values
  const [states, setStates] = useImmer({
    notes: '',
    internal: '',
    trouble: '',
    reason: '',
    searchWebMenuOpen: false,
    isEditable: true,
    part: []
  });

  // tag props
  const tagProps = {
    intent: "primary",
    large: true,
    round: true,
    minimal: false,
    fill: false
  };

  // retrieve part id from the url
  const params = constants.getParams(window);
  const paid = params['paid'];

  // retrieve the base url
  const baseUrl = window.location.href.split('#')[0];

  const fetchData = async() => {
    try{
      const response = await fetch(`${constants.BASE_URL}/api/partinfo?input=${paid}`, {method: 'GET'});
      const data = await response.json();

      // parse the fetched data
      const partMap = 
        data.map(item => {
          const partNo = (item.PARTNO != null) ? item.PARTNO : '';
          const hsCode = (item.HSCODE != null) ? item.HSCODE : '';
          const eccn = (item.ECCN != null) ? item.ECCN : '';
          const nsn = (item.INT_PID != null) ? item.INT_PID : '';
          const descr = (item.DESCRIPTION != null) ? item.DESCRIPTION : '';
          const rev = (item.REV != null) ? item.REV : '';

          const notes = (item.NOTES != null) ? item.NOTES : '';
          const internalNotes = (item.INTERNALNOTE != null) ? item.INTERNALNOTE : '';
          const troubleNotes = (item.TROBLE != null) ? item.TROBLE : '';

          const discontinued = (item.DISCONTINUED != null) ? item.DISCONTINUED : '';
          const reason = (item.REASON != null) ? item.REASON : '';
          const stocka = (item.AVAILCODEA != null) ? item.AVAILCODEA : '';
          const stockd = (item.AVAILCODED != null) ? item.AVAILCODED : '';
          const udpatedDate = (item.STOCK_UPDATE != null) ? format(new Date(item.STOCK_UPDATE), 'yyyy-MM-dd') : '';

          var classification = '';
          const dos_el_reqd = (item.DOS_EL_REQD != null) ? item.DOS_EL_REQD : '';
          const sme = (item.SME != null) ? item.SME : '';
          const bis_el_reqd = (item.BIS_EL_REQD != null) ? item.BIS_EL_REQD : '';
          const isnlr = (item.ISNLR != null) ? item.ISNLR : '';
          const nlr_country = (item.NLR_COUNTRY != null) ? item.NLR_COUNTRY : '';

          const isc32 = (item.ISC32 != null) ? item.ISC32 : '';

          // build the classification string
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
          return {
            "Part No.": partNo,
            "HCCN": hsCode,
            "ECCN": eccn,
            "Classification": classification,
            "NSN": nsn,
            "Description": descr,
            "Rev": rev,
            "Discontinued": discontinued,
            "Stock A": stocka,
            "Stock D": stockd,
            "Updated Date": udpatedDate,
            "notes": notes,
            "trouble": troubleNotes,
            "internal": internalNotes,
            "reason": reason

          }
      })[0];
      // setPart(partMap);

      // update the textarea values with the fetched data
      setStates(state => {
        state.notes = partMap["notes"];
        state.internal = partMap["internal"];
        state.trouble = partMap["trouble"];
        state.reason = partMap["reason"];
        state.part = partMap
      });

    } catch (error) {
      console.error("Error fetching data ", error);
    }
  };

  // handle the edit notes switch
  const handleNotesSwitch = () => {
    setStates(state => {
      state.isEditable = !(state.isEditable);
    })
  };

  const handleSaveNotesClick = () => {

    // initialize the toaster
    const myToaster = OverlayToaster.create({position: "bottom"});

    // check if notes have been edited by checking the switch
    if (states.isEditable === true) {
      myToaster.show({
        message: "Notes have not been edited!",
        intent: Intent.WARNING
      });
    } else {
      try {
        fetch(`${constants.BASE_URL}/api/partinfo?input=${paid}`, {
        method: 'POST',
        headers: {
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({
          notes: states.notes,
          internal: states.internal,
          trouble: states.trouble,
          reason: states.reason
        })
      });
      } catch (error) {
        console.error('Error posting data', error);
      }

      myToaster.show({
        message: "Notes have been saved.",
        intent: Intent.PRIMARY
      });
      }
  };


  // vpo history dialog handler
  const handleVpoHistoryClick = () => {
    const url = baseUrl+`#/vpohist?paid=${paid}`;
    const title = 'VPO History';
    window.electronAPI.openWindow([url, title]);
  };

  // event handlers for the buttons
  const handleQuotHistoryClick = async() => {
    const url = baseUrl+`#/quothist?paid=${paid}`;
    const title = 'Quotation History';
    window.electronAPI.openWindow([url, title]);
    };
    
  const handleEccnHistoryClick = async() => {
    const url = baseUrl+`#/eccnhist?paid=${paid}`;
    const title = 'ECCN History';
    window.electronAPI.openWindow([url, title]);
  };

  const handleInventoryClick = async() => {
    const url = baseUrl+`#/inventory?paid=${paid}`;
    const title = 'Inventory';
    window.electronAPI.openWindow([url, title]);
  };

  const handleWebClick = async(sitename) => {
    // open the url with the given part no, which is part[0]
    console.log('chosen site: ', sitename)
    var url;

    if (sitename === 'findchips') {
      url = `https://www.findchips.com/search/`;
    } else if (sitename === 'trustedparts') {
      url = `https://www.trustedparts.com/en/search/`;
    } else if (sitename === 'boeing') {
      url = `https://boeingdistribution.com/?search=`;
    } else if (sitename === 'partsbase') {
      url = `https://www.partsbase.com/search?`;
    }
    window.electronAPI.openTab(url + encodeURIComponent(states.part["Part No."]));
  };

  const handleLinksClick = async() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const paid = urlParams.get('paid');
    const url = baseUrl+`#/links?paid=${paid}`;
    const title = 'Attached Links';
    window.electronAPI.openWindow([url, title]);
  }

  // define keyboard shortcuts for the buttons
  const hotkeys = useMemo(() => [
    {
      combo: "ctrl+v",
      onKeyDown: handleVpoHistoryClick,
      global:true,
      label: "Open vpo history"
    },
    {
      combo: "ctrl+q",
      onKeyDown: handleQuotHistoryClick,
      global:true,
      label: "Open quotation history"
    },
    {
      combo: "ctrl+e",
      onKeyDown: handleEccnHistoryClick,
      global:true,
      label: "Open eccn history"
    },
    {
      combo: "ctrl+i",
      onKeyDown: handleInventoryClick,
      global:true,
      label: "Open inventory"
    },
    {
      combo: "ctrl+w",
      onKeyDown: handleWebClick,
      global:true,
      label: "Open web search"
    },
    {
      combo: "ctrl+l",
      onKeyDown: handleLinksClick,
      global:true,
      label: "Open links"
    },
    {
      combo: "ctrl+s",
      onKeyDown: handleSaveNotesClick,
      global:true,
      label: "Save notes"
    }
  ]);

  const {handleKeyDown, handleKeyUp} = useHotkeys(hotkeys);


  useEffect(() => {
      fetchData();  
      // console.log('rendered');
  }, [])

  const partTagNames = [
    "Part No.",
    "HCCN",
    "ECCN",
    "Classification",
    "NSN",
    "Description",
    "Rev",
    "Discontinued",
    "Stock A",
    "Stock D",
    "Updated Date"
  ]
  const partInfoTags = partTagNames.map((item, index) => {
    return (
      <CompoundTag
        key={index}
        leftContent={item}
        children={states.part[item]}
        round={tagProps.round}
        minimal={tagProps.minimal}
        intent="none"
        large={tagProps.large}
        className='part-info-tag'
        fill={tagProps.fill}
      />

    )
  })

  // menu items for 'Search Web' button
  const searchWebMenuItems = (
    <Menu>
      <MenuItem 
        icon={<OpenInNewIcon />}
        text="Findchips" 
        onClick={() => handleWebClick("findchips")}
      />
      <MenuItem 
        icon={<OpenInNewIcon />}
        text="Trustedparts" 
        onClick={() => handleWebClick("trustedparts")}
      />
      <MenuItem 
        icon={<OpenInNewIcon />}
        text="Boeing Distribution" 
        onClick={() => handleWebClick("boeing")}
      />
      <MenuItem 
        icon={<OpenInNewIcon />}
        text="Partsbase" 
        onClick={() => handleWebClick("partsbase")}
      />
    </Menu>
  )

  return (
    <div 
      className='partinfo-page'
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >    
      <Card className='part-info-card'>
        <div className='part-info-header'>
          <h2>Part Details</h2>
          <ButtonGroup>
            <Tooltip 
              content="Ctrl+V" 
              placement='bottom'
            >
              <Button 
                text="VPO History" 
                onClick={handleVpoHistoryClick}
                className='part-button'
                icon={<OpenInNewIcon fontSize='small'/>}
              />
            </Tooltip>
            <Tooltip 
              content="Ctrl+Q" 
              placement='bottom'
            >
              <Button 
                text="Quotation History" 
                onClick={handleQuotHistoryClick}
                className='part-button'
                icon={<OpenInNewIcon fontSize='small'/>}
              />
            </Tooltip>
            <Tooltip 
              content="Ctrl+E" 
              placement='bottom'
            >
              <Button 
                text="ECCN History" 
                onClick={handleEccnHistoryClick}
                className='part-button'
                icon={<OpenInNewIcon fontSize='small'/>}
              />
            </Tooltip>
            <Tooltip 
              content="Ctrl+I" 
              placement='bottom'
            >
              <Button 
                text="Inventory" 
                onClick={handleInventoryClick}
                className='part-button'
                icon={<OpenInNewIcon fontSize='small'/>}
              />
            </Tooltip>
            <Button 
              text="I/O History"
              icon={<OpenInNewIcon fontSize='small'/>}
            />
            <Popover
              content={searchWebMenuItems}
              isOpen={states.searchWebMenuOpen}
              onInteraction={(nextOpenState) => {
                setStates((state) => {
                  state.searchWebMenuOpen = nextOpenState;
                })
              }}
              minimal={true}

            >
              <Button 
                text="Search Web" 
                icon="globe-network" 
                className='part-button'
              />
            </Popover>
            <Tooltip 
              content="Ctrl+L" 
              placement='bottom'
            >
              <Button 
                text="Links" 
                icon="link" 
                onClick={handleLinksClick}
                className='part-button'
              />
            </Tooltip>
          </ButtonGroup>
        </div>
        {partInfoTags}
      </Card>
      <Card className='part-notes-card'>
        <div className='edit-notes'>
          <div className='left-section'>
            <h3>Notes</h3>
            <Switch label="Edit Notes" onClick={handleNotesSwitch}/>
          </div>
          <div className='right-section'>
            <Tooltip content="Crtl+S" placement='bottom'>
              <Button icon="tick" className='save-notes-button' text="Save Notes" onClick={handleSaveNotesClick}/>
            </Tooltip>
          </div>
        </div>
        <TextArea 
          fill={true} 
          value={states.notes} 
          readOnly={states.isEditable} 
          onChange={e => {
            setStates(state => {
              state.notes = e.target.value;
            })
          }}
          className='part-notes'
        />
        <h3>Internal Notes</h3>
        <TextArea 
          fill={true} 
          value={states.internal} 
          readOnly={states.isEditable} 
          onChange={e => {
            setStates(state => {
              state.internal = e.target.value;
            })
          }}
          className='part-notes'
        />
        <h3>Trouble Notes</h3>
        <TextArea 
          fill={true} 
          value={states.trouble} 
          readOnly={states.isEditable} 
          onChange={e => {
            setStates(state => {
              state.trouble = e.target.value;
            })
          }}
          className='part-notes'
        />
        <h3>Discontinued Reason</h3>
        <TextArea 
          fill={true} 
          value={states.reason} 
          readOnly={states.isEditable} 
          onChange={e => {
            setStates(state => {
              state.reason = e.target.value;
            })
          }}
          className='part-notes'
        />
      </Card>
    </div>
  );
};

export default PartInfo;
