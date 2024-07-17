const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const format = require('pg-format');

const app = express();
app.use(cors());

// ! Do not delete this
// use middleware to parse the request stream
app.use(express.json());

// port number has to be different from 3000 because react is running on port 3000
const port = 3001; 

// for acutal production
// user, host, database, password, and port have been replaced for security
const pool = new Pool({
  user: 'test', 
  host: 'test',
  database: 'test',
  password: 'test',
  port: 1111,
});


// return the payterm table
app.get('/api/payterm', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "PAYTERM"');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// comprehensive search query in home page
app.get('/api/search', async (req, res) => {

  let searchColumn;
  let searchTable;

  // retrieve the search input, option, and category from home page's search bar
  var queryInput = req.query.input;
  const queryColumn = req.query.column;
  const queryTable = req.query.table;

  // id column to use for search query
  var searchId;
  var resultColumns;

  // choose which table to use for query
  if (queryTable == 'Customer') {
    searchTable = 'CUST';
    resultColumns = '"CUID", "TITLE"';
    searchId = 'CUID';

    // choose which column to use for query
    if (queryColumn == 'account') {
      searchColumn = 'ACCTNO';
    } else if (queryColumn == 'contact') {
      searchColumn = 'BILLCONTACT';
    } else if (queryColumn == 'tel') {
      searchColumn = 'BILLTEL';
    } else if (queryColumn == 'fax') {
      searchColumn = 'BILLFAX';
    } else {
      searchColumn = 'TITLE';
    }

  } else if (queryTable == 'Vendor') {
    searchTable = 'VEND';
    resultColumns = '"VDID", "NAME"';
    searchId = 'VDID';

    // choose which column to use for query
    if (queryColumn == 'account') {
      searchColumn = 'ACCOUNTNO';
    } else if (queryColumn == 'contact') {
      searchColumn = 'CONTACT';
    } else if (queryColumn == 'tel') {
      searchColumn = 'TEL';
    } else if (queryColumn == 'fax') {
      searchColumn = 'FAX';
    } else {
      searchColumn = 'NAME';
    }
  } else if (queryTable == 'Parts') {
    searchTable = 'PARTS';
    resultColumns = '"PAID", "PARTNO", "DESCRIPTION", "DISCONTINUED", "INT_PID"';
    searchId = 'PAID';

    // choose which column to use for query
    if (queryColumn =='nsn') {
      searchColumn = 'INT_PID';
    } else if (queryColumn =='descr') {
      searchColumn = 'DESCRIPTION';
    } else if (queryColumn == 'notes') {
      searchColumn = 'NOTES';
    } else if (queryColumn =='vendorpartno') {
      try {
        const partnoResult = await pool.query('SELECT "PARTNO" from "CRFQITEM" WHERE LOWER("VITEMNO") = LOWER($1)', [queryInput]);

        // update the input with the returned part no. from CRFQITEM table if there's a result from the first query
        if (partnoResult.rows.length > 0) {
          queryInput = partnoResult.rows[0].PARTNO;
        }
        searchColumn = 'PARTNO'
      } catch (error) {
        console.error("Error executing vendor partno query", error);
      }
    } else {
      searchColumn = 'PARTNO'
    }
  } else if (queryTable == 'CRFQ') {
    searchTable = 'CRFQ';
    resultColumns = '"RQID", "CUSTOMER", "PRJNAME", "DTRECIEVE", "DUEDATE", "ANALYSEDBY", "SAUPNAME"';
    searchId = 'DTRECIEVE';

    // choose which column to use for query
    if (queryColumn == 'project') {
      searchColumn = 'PRJNAME';
    } else if (queryColumn == 'buyer') {
      searchColumn = 'USERID'
    } else if (queryColumn == 'program') {
      searchColumn = 'SAUPNAME';
    } else {
      searchColumn = 'CUSTOMER';
    }
  } else if (queryTable == 'CPO') {
    searchTable = 'CUSTPO';
    resultColumns = '"CPID", "CUSTOMER", "ORDERNO", "PRJNAME", "DATES", "DUEDATE", "REPID", "STATUS", "ITEMCNT", "TOTALAMT"';
    searchId = 'DATES';

    // choose column to use for query
    if (queryColumn == 'project') {
      searchColumn = 'PRJNAME';
    } else if (queryColumn == 'buyer') {
      searchColumn = 'REPID';
    } else if (queryColumn == 'order') {
      searchColumn = 'ORDERNO';
    } else {
      searchColumn = 'CUSTOMER';
    }
  } else if (queryTable == 'VPO') {
    searchTable = 'VPO';
    resultColumns = '"VPID", "VENDOR", "PONUM", "DATES", "CONTACT", "HOUSEPO", "REV", "TOTALAMT", "PREPAIDID"';
    searchId = 'DATES';

    // choose column to use for query
    if (queryColumn == 'ponum') {
      searchColumn = 'PONUM';
    } else if (queryColumn == 'buyer') {
      searchColumn = 'CONTACT';
    } else {
      searchColumn = 'VENDOR';
    }
  }

  // default query string
  var queryString = 
  'SELECT ' + resultColumns + ' ' + 
  'FROM "' + searchTable + '"  WHERE LOWER("' + searchColumn + '") ~ LOWER($1) ORDER BY "' + searchId + '" DESC LIMIT 1000'    

  // modify query string for searching CRFQ
  if (queryTable == 'CRFQ') {
    queryString = 
    `SELECT q."RQID", q."CUSTOMER", q."PRJNAME", q."DTRECIEVE", q."DUEDATE", q."ANALYSEDBY", q."SAUPNAME", w."USERID" `+ 
    `FROM "CRFQ" q, "WORKER" w ` + 
    `WHERE LOWER("` + searchColumn + `") ~ LOWER($1) ` + 
    `AND q."ANALYSEDBY" = w."WOID" ` +
    `ORDER BY "` + searchId + `" DESC, q."RQID" LIMIT 5000`
  }
  // const queryString = `
  //   SELECT $1 
  //   FROM $2
  //   WHERE LOWER($3) ~ LOWER($4)
  //   ORDER BY $5 ASC LIMIT 10
  // `
  try {
    const query = {
      text: queryString,
      values: [queryInput]
    }
    // console.log(req.query.input);
    const result = await pool.query(query);
    res.json(result.rows);
    // console.log('sending', result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add new part
app.post('/api/add/part', async(req, res) => {
  const sequence_name = 'PARTS_PAID_seq'
  const queryText = `
    INSERT INTO "PARTS" ("PARTNO", "HSCODE", "INT_PID", "DESCRIPTION", "REV", "NOTES", "INTERNALNOTE", "TROBLE", "PAID")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, nextval('"${sequence_name}"'))
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.partno, req.body.hscode, req.body.nsn, req.body.descr, req.body.rev, req.body.notes, req.body.internal, req.body.trouble]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// add new customer
app.post('/api/add/customer', async(req, res) => {
  const sequence_name = 'CUST_CUID_seq'
  const queryText = `
    INSERT INTO "CUST" (
      "BILLADD1",
      "BILLADD2",
      "BILLCITY",
      "BILLZIP",
      "BILLTEL",
      "BILLFAX",
      "BILLCONTACT",
      "BILLEMAIL",
      "SHIPADD1",
      "SHIPADD2",
      "SHIPCITY",
      "SHIPZIP",
      "SHIPTEL",
      "SHIPFAX",
      "SHIPCONTACT",
      "SHIPEMAIL",
      "SHIPVIA",
      "FOB",
      "ACCTNO",
      "CAT",
      "PAYINT",
      "TITLE",
      "CUID"
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, nextval('"${sequence_name}"'))
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.billaddr1, req.body.billaddr2, req.body.billcity, req.body.billzip, req.body.billtel, req.body.billfax, req.body.billcontact, req.body.billemail, req.body.shipaddr1, req.body.shipaddr2, req.body.shipcity, req.body.shipzip, req.body.shiptel, req.body.shipfax, req.body.shipcontact, req.body.shipemail, req.body.shipvia, req.body.fob, req.body.accountno, req.body.broker, req.body.payterm, req.body.title]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// add new vendor
app.post('/api/add/vendor', async(req, res) => {
  const sequence_name = 'VEND_VDID_seq'
  const queryText = `
    INSERT INTO "VEND" (
      "NAME",
      "ADD1",
      "ADD2",
      "CITY",
      "ZIP",
      "TEL",
      "FAX",
      "CONTACT",
      "EMAIL",
      "BILLADD1",
      "BILLADD2",
      "BILLCITY",
      "BILLZIP",
      "BILLTEL",
      "BILLFAX",
      "BILLCONTACT",
      "BILLEMAIL",
      "ACCTNO",
      "PAYINT",
      "VDID"
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, nextval('"${sequence_name}"'))
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.title, req.body.addr1, req.body.addr2, req.body.city, req.body.zip, req.body.tel, req.body.fax, req.body.contact, req.body.email, req.body.billaddr1, req.body.billaddr2, req.body.billcity, req.body.billzip, req.body.billtel, req.body.billfax, req.body.billcontact, req.body.billemail, req.body.accountno, req.body.payterm]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// add new crfq
app.post('/api/add/crfq', async(req, res) => {
  const sequence_name = 'CRFQ_RQID_seq'
  const queryText = `
    INSERT INTO "CRFQ" (
      "CUSTOMER",
      "PRJNAME",
      "SAUPNAME",
      "QUOTECAT",
      "DTRECIEVE",
      "DUEDATE",
      "RECIEVEBY",
      "ANALYSEDBY",
      "VALIDITY",
      "TERM",
      "WARRANTY",
      "MINPO",
      "ORGINALEXCEL",
      "CUID",
      "RQID"
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
      (SELECT "CUID" FROM "CUST" WHERE "TITLE" = $1), nextval('"${sequence_name}"'))
     RETURNING "RQID"
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.customer, req.body.prjname, req.body.prgname, req.body.quotecat, req.body.receivedate, req.body.duedate, req.body.receiveby, req.body.analyzeby, req.body.validity, req.body.term, req.body.warranty, req.body.minpo, req.body.origquote]
    }
    const result = await pool.query(query);

    // return the new rqid
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// add new crfqitems
app.post('/api/add/crfqitems', async(req, res) => {
  const sequence_name = 'CRFQITEM_QIID_seq';

  const injected = req.body.map(row => {
    return [row[0], `'${row[1]}'`, row[2], `'${row[3]}'`, row[4], `(SELECT "PAID" FROM "PARTS" WHERE "PARTNO" = '${row[1]}')`, `nextval('"${sequence_name}"')`]
  });
  const queryText = `
  INSERT INTO "CRFQITEM" 
  (
    "SEQ", 
    "PARTNO", 
    "NEEDED", 
    "UNITS",
    "RQID", 
    "PAID", 
    "QIID"
  ) 
  VALUES %s
  `;
  const sql = format(queryText, injected);
  try {
    const query = {
      text: sql
    }
    const result = await pool.query(query);

    // return the new rqid
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// part search query
app.get('/api/part', async (req, res) => {
  try {

    let searchColumn;

    // retrieve the search query and option from the parts search page's fetch url
    const queryOption = req.query.option;
    var queryInput = req.query.input;

    // choose which column to use for query
    if (queryOption == 'NSN'){
      searchColumn = 'INT_PID';
    } else if (queryOption == 'Desc.'){
      searchColumn = 'DESCRIPTION';
    } else if (queryOption == 'Notes') {
      searchColumn = 'NOTES';
    } else if (queryOption == 'Vendor Part No.'){
      try {
        const partnoResult = await pool.query('SELECT "PARTNO" from "CRFQITEM" WHERE LOWER("VITEMNO") = LOWER($1)', [queryInput]);
        // console.log(partnoResult.rows);

        // update the input with the returned part no. from CRFQITEM table if there's a result from the first query
        if (partnoResult.rows.length > 0){
          queryInput = partnoResult.rows[0].PARTNO;
        }

        // Vendor Part No. option eventually searches for part no.
        searchColumn = 'PARTNO'
      } catch (error) {
        console.error('Error executing query', error);
      }
    }
      else {
      searchColumn = 'PARTNO';
    }

    // query result is ordered by PAID by default
    const queryString = 'SELECT * FROM "PARTS" WHERE LOWER("' + searchColumn + '") ~ LOWER($1) ORDER BY "PAID" ASC LIMIT 30'; 
    const query = {
      text: queryString,
      values: [queryInput]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// customer search query
app.get('/api/customer', async (req, res) => {
  const queryString = `
    SELECT * 
    FROM "CUST"
    WHERE LOWER("TITLE") ~ LOWER($1)
    ORDER BY "CUID" ASC LIMIT 30
  `
  try {
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    // console.log(req.query.input);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// fetch query for customer info page
app.get('/api/custinfo', async(req, res) => {
  try{
    const queryString = `
      SELECT * 
      FROM "CUST"
      WHERE "CUID" = $1
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for customer invoice history in customer info page
app.get('/api/custinfo/invoice', async(req, res) => {
  try{
    const queryString = `
      SELECT s."SMID", s."PAID", s."INVNO", s."DATES", s."CPID", s."FREIGHT", s."PAIDDATE", s."NUMITEMS", s."AMOUNT", s."SHIPVIA", s."REFNO", SUM(o."AMOUNT") "BILLEDAMT"
      FROM "SHIPMENT" s
      JOIN "POITEMS" o ON s."SMID" = o."SMID"
      WHERE s."CUID" = $1
      GROUP BY s."SMID", s."PAID", s."INVNO", s."DATES", s."CPID", s."FREIGHT", s."PAIDDATE", s."NUMITEMS", s."AMOUNT", s."SHIPVIA", s."REFNO"
      ORDER BY s."DATES" DESC
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for customer's ordered parts history in the customer info page
app.get('/api/custinfo/parts', async(req, res) => {
  try{
    const queryString = `
      SELECT o."PARTNO", t."DESCRIPTION", SUM(o."AMOUNT") "TOTAL", MAX(p."DATES") "DATES", o."CPID", o."PAID"
      FROM "POITEMS" o
      JOIN "CUSTPO" p ON o."CPID" = p."CPID"
      JOIN "PARTS" t on o."PAID" = t."PAID"
      WHERE p."CUID" = $1
      AND o."RECTYPE" = 5
      GROUP BY o."PARTNO", t."DESCRIPTION", o."CPID", o."PAID", p."DATES"
      ORDER BY p."DATES" DESC, "TOTAL" DESC
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// update customer's info fields
app.post('/api/custinfo/info', async(req, res) => {
  const queryText = `
    UPDATE "CUST" 
    SET 
    "BILLADD1" = $1,
    "BILLADD2" = $2,
    "BILLCITY" = $3,
    "BILLZIP" = $4,
    "BILLTEL" = $5,
    "BILLFAX" = $6,
    "BILLCONTACT" = $7,
    "BILLEMAIL" = $8,
    "SHIPADD1" = $9,
    "SHIPADD2" = $10,
    "SHIPCITY" = $11,
    "SHIPZIP" = $12,
    "SHIPTEL" = $13,
    "SHIPFAX" = $14,
    "SHIPCONTACT" = $15,
    "SHIPEMAIL" = $16,
    "SHIPVIA" = $17,
    "FOB" = $18,
    "ACCTNO" = $19,
    "CAT" = $20,
    "PAYINT" = $21
        
    WHERE "CUID" = $22
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.billaddr1, req.body.billaddr2, req.body.billcity, req.body.billzip, req.body.billtel, req.body.billfax, req.body.billcontact, req.body.billemail, req.body.shipaddr1, req.body.shipaddr2, req.body.shipcity, req.body.shipzip, req.body.shiptel, req.body.shipfax, req.body.shipcontact, req.body.shipemail, req.body.shipvia, req.body.fob, req.body.accountno, req.body.broker, req.body.payterm, req.query.input]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// update customer's notes
app.post('/api/custinfo/notes', async(req, res) => {
  const queryText = `
    UPDATE "CUST" 
    SET "NOTES" = $1
    WHERE "CUID" = $2
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.notes, req.query.input]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// returns vendor table
app.get('/api/vendor', async (req, res) => {
  try {
    const query = {
      text: 'SELECT * FROM "VEND" WHERE "NAME" = $1',
      values: [req.query.input]
    }
    // console.log(req.query.input);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// fetch query for vendor info page
app.get('/api/vendinfo', async(req, res) => {
  try{
    const queryString = `
      SELECT * 
      FROM "VEND"
      WHERE "VDID" = $1
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for vendor info's vpo history panel
app.get('/api/vendinfo/vpohist', async(req, res) => {
  try{
    const queryString = `
      SELECT v.*, w."USERID" 
      FROM "VPO" v
      JOIN "WORKER" w
      on v."ORDEREDBY" = w."WOID"
      WHERE "VDID" = $1
      ORDER BY v."DATES" DESC 
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for vendor info's vpo history's parts table
app.get('/api/vendinfo/vpohist/parts', async(req, res) => {
  try{
    const queryString = `
      SELECT o."SEQ", o."PARTNO", o."QTY", o."AMOUNT", p."PAID"
      FROM "POITEMS" o
      JOIN "PARTS" p
      ON o."PARTNO" = p."PARTNO"
      WHERE "VPID" = $1
      AND "RECTYPE" = 6
      ORDER BY "SEQ", "PARTNO" DESC 
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for vendor's invoice history table
app.get('/api/vendinfo/invoice', async(req, res) => {
  try{
    const queryString = `
      SELECT c."ORDERNO", p."PONUM", v.*
      FROM "VINVOICE" v
      JOIN "VPO" p 
      ON v."VPID" = p."VPID"
      JOIN "CUSTPO" c
      ON c."CPID" = p."CPID"
      WHERE v."VDID" = $1
      ORDER BY v."DATES" DESC, v."VNID"
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for vendor info page's carrying parts table
app.get('/api/vendinfo/parts', async(req, res) => {
  try{
    const queryString = `
      SELECT v."PARTNO", p."DESCRIPTION", COUNT(i."PAID") "COUNT", p."PAID" 
      FROM "VITEM" v
      JOIN "PARTS" p
      ON v."PAID" = p."PAID"
      JOIN "CRFQITEM" i
      ON v."PAID" = i."PAID"
      WHERE v."VDID" = $1
      GROUP BY v."PARTNO", p."DESCRIPTION", p."PAID"
      ORDER BY v."PARTNO" ASC
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for vendor info page's quotation history table
app.get('/api/vendinfo/parts/quothist', async(req, res) => {
  try{
    const queryString = `
      SELECT i.*, q."DTRECIEVE", q."PRJNAME", q."CUSTOMER"
      FROM "CRFQITEM" i 
      JOIN "CRFQ" q
      ON i."RQID" = q."RQID"
      WHERE i."PAID" = $1
      ORDER BY q."DTRECIEVE" DESC, i."VENDOR", i."NEEDED", i."MFG", i."QIID"
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})



// update vendor's info fields
app.post('/api/vendinfo/info', async(req, res) => {
  const queryText = `
    UPDATE "VEND" 
    SET 
    "ADD1" = $1,
    "ADD2" = $2,
    "CITY" = $3,
    "ZIP" = $4,
    "TEL" = $5,
    "FAX" = $6,
    "CONTACT" = $7,
    "EMAIL" = $8,
    "BILLADD1" = $9,
    "BILLADD2" = $10,
    "BILLCITY" = $11,
    "BILLZIP" = $12,
    "BILLTEL" = $13,
    "BILLFAX" = $14,
    "BILLCONTACT" = $15,
    "BILLEMAIL" = $16,
    "ACCTNO" = $17,
    "PAYINT" = $18
        
    WHERE "VDID" = $19
  `;
  try {
    const query = {
      text: queryText,
      values: [ req.body.addr1, req.body.addr2, req.body.city, req.body.zip, req.body.tel, req.body.fax, req.body.contact, req.body.email, req.body.billaddr1, req.body.billaddr2, req.body.billcity, req.body.billzip, req.body.billtel, req.body.billfax, req.body.billcontact, req.body.billemail, req.body.accountno, req.body.payterm, req.query.input]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// fetch query for part info page
app.get('/api/partinfo', async(req, res) => {
  try{
    const result = await pool.query('SELECT * FROM "PARTS" WHERE "PAID" = $1', [req.query.input])
    // if (result.rows.length > 0){
    //   res.json(result.rows[0]);
    // }
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// update notes, internal, and trouble column in parts table
app.post('/api/partinfo', async(req, res) => {
  try {
    pool.query('UPDATE "PARTS" SET ("NOTES", "INTERNALNOTE", "TROBLE", "REASON") = ($1, $2, $3, $4) WHERE "PAID" = $5', [req.body.notes, req.body.internal, req.body.trouble, req.body.reason, req.query.input]);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// query for vpo history dialog in partinfo page
app.get('/api/vpohist', async(req, res) => {
  // console.log('received paid ' + req.query.input);
  const queryText = `
    SELECT v."PONUM", v."DATES", o."QTY", o."UNITS", o."UNITPRICE", o."AMOUNT", o."VENDOR", o."VDEL", o."DATES" 
    FROM "VPO" v 
    JOIN "POITEMS" o ON v."VPID" = o."VPID" 
    WHERE o."PAID" = $1 AND o."VPID" > 0 AND o."RECTYPE" = 6
    ORDER BY o."DATES" DESC, o."VDEL" DESC 
  `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// test query for quotation history of part info page
app.get('/api/partinfo/quothist', async(req, res) => {
  const queryText = `
  WITH crfqitem_query AS (
      SELECT 
          i."PARTNO", q."DTRECIEVE", q."PRJNAME", q."CUSTOMER", 
          i."HIDETOCUST", i."VDID", i."VDEL", i."SHORTNOTE", 
          i."NEEDED", i."QTY", i."UNITS", i."PRICE", q."QUOTECAT", 
          i."ORDERED", i."VENDOR", i."VITEMNO", q."RQID", 
          q."RECIEVEBY", i."MFG", i."PAID", i."MPRICE"
      FROM 
          "CRFQITEM" i
      JOIN 
          "CRFQ" q ON i."RQID" = q."RQID"
      WHERE 
          i."PAID" = $1
          AND i."VDID" > 0
  ), 
  poitems_custpo_query AS (
      SELECT 
          p."ORDERNO", p."CPID", i."RQID"
      FROM 
          "POITEMS" i
      LEFT JOIN 
          "CUSTPO" p ON i."CPID" = p."CPID"
      WHERE 
          i."PAID" = $1
          AND i."RECTYPE" = 5
          AND i."RQID" IN (SELECT "RQID" FROM crfqitem_query WHERE "ORDERED" = 'Y')
  ), 
  poitems_vpo_query AS (
      SELECT 
          p."PONUM", p."VPID", i."RQID"
      FROM 
          "POITEMS" i
      LEFT JOIN 
          "VPO" p ON (i."VPID" = p."VPID") AND (i."CPID" = p."CPID")
      WHERE 
          i."PAID" = $1
          AND i."RECTYPE" = 6
          AND i."RQID" IN (SELECT "RQID" FROM crfqitem_query WHERE "ORDERED" = 'Y')
  ) 
  SELECT 
      cq.*, pcq."ORDERNO", pcq."CPID", pvq."PONUM", pvq."VPID"
  FROM 
      crfqitem_query cq
  LEFT JOIN 
      poitems_custpo_query pcq ON cq."RQID" = pcq."RQID"
  LEFT JOIN 
      poitems_vpo_query pvq ON cq."RQID" = pvq."RQID"
  ORDER BY 
      cq."DTRECIEVE" DESC, cq."PARTNO", cq."CUSTOMER";
  `;
  try {
    const query = {
      text: queryText,
      values: [req.query.paid]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for quotation history dialog in part info page
app.get('/api/quothist', async(req, res) => {
  const queryText = `
    SELECT i."PARTNO", q."DTRECIEVE", q."PRJNAME", q."CUSTOMER", i. "HIDETOCUST", i."VDID", i."VDEL", i."SHORTNOTE", i."NEEDED", i."QTY", i."UNITS", i."PRICE", q."QUOTECAT", i."ORDERED", i."VENDOR", i."VITEMNO", q."RQID", q."RECIEVEBY", i."MFG", i."PAID", i."MPRICE", w."FULLNAMES"
    FROM "CRFQITEM" i, "CRFQ" q, "WORKER" w
    WHERE "PAID" = $1
    AND q."RQID" = i."RQID"
    AND i."VDID" > 0
    AND w."WOID" = q."RECIEVEBY"
    ORDER BY q."DTRECIEVE" DESC 
  `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for cpo no. for quotation history dialog in parts info page
app.get('/api/partinfo/cpo', async(req, res) => {
  const queryText = `
    SELECT p."ORDERNO", p."CPID" 
    FROM "POITEMS" i 
    LEFT JOIN "CUSTPO" p
    ON i."CPID" = p."CPID"
    WHERE i."PAID" = $1
    AND i."RECTYPE" = 5
    AND i."RQID" = $2
    ORDER BY i."DATES" DESC
  `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input1, req.query.input2]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for vpo no. for quotation history dialog in parts info page
app.get('/api/partinfo/vpo', async(req, res) => {
  const queryText = `
    SELECT p."PONUM", p."VPID" 
    FROM "POITEMS" i 
    LEFT JOIN "VPO" p
    ON ((i."VPID" = p."VPID") AND (i."CPID" = p."CPID"))
    WHERE i."PAID" = $1
    AND i."RECTYPE" = 6
    AND i."RQID" = $2
    ORDER BY i."DATES" DESC
  `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input1, req.query.input2]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for ECCN history within part info page
app.get('/api/eccnhist', async(req, res) => {
  const queryText = `
    SELECT e."DATEOFENTRY", e."WORKERNAME", e."ECCN", e."SOURCENAME", e."REASON", e."DOS_EL_REQD", e."SME", e."BIS_EL_REQD", e."ISNLR", e."NLR_COUNTRY", e."ISC32", p."PARTNO"
    FROM "ECCNTRACK" e, "PARTS" p
    WHERE e."PAID" = $1
    AND e."PAID" = p."PAID"
    ORDER BY "DATEOFENTRY" DESC; 
  `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for vendor list selection in ECCN edit form dialog
app.get('/api/eccnhist/vendor', async(req, res) => {
  const queryText = `
    SELECT DISTINCT i."VENDOR"
    FROM "CRFQITEM" i, "CRFQ" c
    WHERE "PAID" = $1
    AND i."RQID" = c."RQID"
    AND i."VDID" > 0
  `
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}) 

// create a new ECCN history record
app.post('/api/eccnhist', async(req, res) => {
  const sequence_name = 'ECCNTRACK_ETID_seq'
  const queryText = `
    INSERT INTO "ECCNTRACK" ("PAID", "DATEOFENTRY", "CLASS", "SOURCENAME", "REASON", "DOS_EL_REQD", "SME", "BIS_EL_REQD", "ISNLR", "NLR_COUNTRY", "ISC32", "ECCN", "ETID")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, nextval('"${sequence_name}"'))
  `;
  // console.log('received', req.body);
  try {
    const query = {
      text: queryText,
      values: [req.query.input, req.body.date, req.body.source, req.body.vendor, req.body.reason, req.body.dos, req.body.sme, req.body.bis, req.body.nlr, req.body.country, req.body.code, req.body.eccn]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// query for inventory within part info page
app.get('/api/inventory', async(req, res) => {
  const queryText = `
    SELECT i."OIID", s."SMID", s."SMCODES", s."CUID", c."CUSTOMER", s."INVNO", i."UNITS", i."VENDOR", s."DATES", s."REFNO", i."QTY", i."CALFACTOR", i."IO", i."SCRAP", i."INVCHECKDATE", i."CPID", i."VPID", i."PAID", i."VDID", i."AVAIL", i."POTIEQTY", i."SHIPPED", i."REMARK", i."BADCAT", i."BADQTY", i."COD", i."UNITPRICE", i."ORDERNOTE", i."RPAVAIL", i."RECTYPE"
    FROM "SHIPMENT" s
    INNER JOIN "POITEMS" i
    ON (s."SMID" = i."SMID")
    LEFT OUTER JOIN "CUSTPO" c
    ON (i."CPID" = c."CPID")
    WHERE i."PAID" = $1
    AND i."VDID" > 0
    AND ((s."SMCODES" = 'VI' AND i."AVAIL" > 0)
    OR ("SMCODES" = 'CI' AND i."RPAVAIL" > 0))
    AND i."REMARK" != 'QR'
    ORDER BY s."DATES" DESC;
  `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for inventory's standby qty
app.get('/api/inventory/standby', async(req, res) => {
  const queryText = `
    SELECT SUM(s."QTY") AS "SHIPQTY"
    FROM "POITEMS" s
    RIGHT JOIN "POITEMS" t
    ON s."SRCOIID" = t."OIID"
    LEFT JOIN "SHIPMENT" m
    ON s."SMID" = m."SMID"
    WHERE t."SRCOIID" = $1
    AND m."PRLOGSTATUS" = '1'
    `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for inventory's yet-tied qty
app.get('/api/inventory/nontied', async(req, res) => {
  const queryText = `
    SELECT SUM("AVAIL") AS "TIEAVAIL"
    FROM "POITEMS"
    WHERE "SRCOIID" = $1
    `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for incoming items table in inventory page
app.get('/api/inventory/incoming', async(req, res) => {
  const queryText = `
    SELECT i.*, v."PONUM" from "POITEMS" i
    RIGHT OUTER JOIN "VPO" v
    ON i."VPID" = v."VPID"
    WHERE i."PAID" = $1
    AND i."VPID" IS NOT NULL
    AND i."SMID" IS NULL
    AND i."RECTYPE" = 6
    AND i."PENDING" > 0
    `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// query for getting linked documents and web urls for individual parts
app.get('/api/partinfo/links', async(req, res) => {
  const queryText = `
    SELECT "DOC1", "DOC2", "DOC3", "DOC4", "DOC5", "DOC6", "DOC7", "DOC8", "DOC9", "DOC10"
    FROM "PARTS"
    WHERE "PAID" = $1
    `;
  try {
    const query = {
      text: queryText,
      values: [req.query.input]
    };
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// update attached documents/links in the links page of part info
app.post('/api/links', async(req, res) => {
  const docNo = req.body.doc;
  const queryText = `
    UPDATE "PARTS" 
    SET "` + req.body.doc + `" = ($1)
    WHERE "PAID" = $2
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.path, req.query.input]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// daily receiving report query
app.get('/api/receive/report', async (req, res) => {
  const queryString = `
    SELECT s."VPID", s."SMID", s."DATES", v."PONUM", i."VDID", i."SEQ", i."PARTNO", i."QTY", i."UNITS", i."UNITPRICE", i."AMOUNT", v."DATES" AS "VDATES", i."VDEL", c."CUSTOMER", v."VENDOR", s."SHIPNOTE", i."OIID", i."ORDERNOTE", v."CONTACT", i."REMARK", i."QIID", i."VITEMNO"
    FROM "POITEMS" i
    JOIN "SHIPMENT" s 
    ON (i."SMID" = s."SMID" AND s."SMCODES" = 'VI')
    JOIN "VPO" V 
    ON s."VPID" = v."VPID"
    JOIN "CUSTPO" c
    ON i."CPID" = c."CPID"
    WHERE s."DATES" >= $1
    AND s."DATES" <= $2
    AND i."IO" = 'I'
    ORDER BY s."DATES" DESC, v."PONUM", c."CUSTOMER", s."SMID", i."PARTNO" LIMIT 1000
  `
  try {
    const query = {
      text: queryString,
      values: [req.query.start, req.query.end]
    }
    // console.log(req.query.input);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// fetch query for crfq info page
app.get('/api/crfqinfo', async(req, res) => {
  try{
    const queryString = `
      SELECT q.*, w."USERID" 
      FROM "CRFQ" q
      JOIN "WORKER" w
      on (q."RECIEVEBY" = w."WOID") OR (q."ANALYSEDBY" = w."WOID")
      WHERE "RQID" = $1
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for crfq items table
app.get('/api/crfqitems', async(req, res) => {
  try{
    const queryString = `
      SELECT *
      FROM "CRFQITEM"
      WHERE "RQID" = $1
      ORDER BY "PARTNO", "VENDOR", "SEQ" ASC
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for crfq items table
app.get('/api/custlist', async(req, res) => {
  try{
    const queryString = `
      SELECT "TITLE"
      FROM "CUST"
    `
    const query = {
      text: queryString
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch partno list for crfq items table's edit partno feature
app.get('/api/partlist', async(req, res) => {
  try{
    const queryString = `
      SELECT "PARTNO", "PAID"
      FROM "PARTS"
    `
    const query = {
      text: queryString
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

app.get('/api/home/custlist', async(req, res) => {
  // console.log('fetch request received')
  try{
    const queryString = `
      SELECT "TITLE"
      FROM "CUST"
    `
    const query = {
      text: queryString
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// update crfq details
app.post('/api/crfqinfo/details', async(req, res) => {
  const queryText = `
    UPDATE "CRFQ" 
    SET 
    "CUSTOMER" = $1,
    "PRJNAME" = $2,
    "SAUPNAME" = $3,
    "QUOTECAT" = $4,
    "DTRECIEVE" = $5,
    "DUEDATE" = $6,
    "RECIEVEBY" = $7,
    "ANALYSEDBY" = $8,
    "VALIDITY" = $9,
    "TERM" = $10,
    "WARRANTY" = $11,
    "MINPO" = $12,
    "ORGINALEXCEL" = $13
    
    WHERE "RQID" = $14
  `;
  try {
    const query = {
      text: queryText,
      values: [req.body.customer, req.body.prjname, req.body.prgname, req.body.quotecat, req.body.receivedate, req.body.duedate, req.body.receiveby, req.body.analyzeby, req.body.validity, req.body.term, req.body.warranty, req.body.minpo, req.body.origquote, req.query.input]
    }
    const result = await pool.query(query);
    res.status(200).json({message: "Received JSON data"});
  } catch (error) {
    console.error('Error executing query', error);
  }
})

// fetch query for crfq item's part detail info
app.get('/api/crfqinfo/parts', async(req, res) => {
  try{
    const queryString = `
      SELECT *
      FROM "PARTS"
      WHERE "PAID" = $1
    `
    const query = {
      text: queryString,
      values: [req.query.paid]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for crfqitem's edit partno save
app.get('/api/crfqinfo/parts/edit', async(req, res) => {
  try{
    const queryString = `
      SELECT "PAID"
      FROM "PARTS"
      WHERE "PARTNO" = $1
    `
    const query = {
      text: queryString,
      values: [req.query.input]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for crfq item's vendor detail info
app.get('/api/crfqinfo/vendor', async(req, res) => {
  try{
    const queryString = `
      SELECT *
      FROM "VEND"
      WHERE "VDID" = $1
    `
    const query = {
      text: queryString,
      values: [req.query.vdid]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// update crfq item's part & vendor notes
app.post('/api/crfqinfo/notes', async(req, res) => {
  const queryText1 = `
    UPDATE "PARTS"
    SET 
    "NOTES" = $1,
    "TROBLE" = $2,
    "INTERNALNOTE" = $3,
    "REASON" = $4,
    "DISCONTINUED" = $5
    WHERE "PAID" = $6;
  `;

  const queryText2 = `
    UPDATE "VEND"
    SET
    "NOTES" = $1,
    "TROBLE" = $2
    WHERE "VDID" = $3;
  `

  try {
    const query1 = {
      text: queryText1,
      values: [req.body.partNotes, req.body.partTrouble, req.body.partInternal, req.body.partReason, req.body.partDiscontinued, req.query.paid]
    }
    const result = await pool.query(query1);
    res.status(200).json({message: "Received JSON data"});

    // if vdid is bigger than 0, save vendor notes
    if (req.query.vdid > 0) {
      try {
        const query2 = {
          text: queryText2,
          values: [req.body.vendorNotes, req.body.vendorTrouble, req.query.vdid]
        }
        const result = await pool.query(query2);
        // res.status(200).json({message: "Received JSON data"});
      } catch (error) {
        console.error('Error executign query2', error)
      } 
    }
  } catch (error) {
    console.error('Error executing query1', error);
  }
})

// fetch query for crfq item's quot history drawer
app.get('/api/crfqinfo/quothist', async(req, res) => {
  var paid_values; 
  if (Array.isArray(req.query.values)) {
    paid_values = req.query.values.map((value) => value);
  } else {
    paid_values = [req.query.values]
  }
  try{
    const queryString = `
    SELECT i.*, q."DTRECIEVE", q."PRJNAME", q."CUSTOMER", q."RECIEVEBY"
    FROM "CRFQITEM" i 
    JOIN "CRFQ" q
    ON i."RQID" = q."RQID"
    WHERE q."CUID" = $1 
    AND i."ORDERED" = 'Y'
    AND i."PAID" = ANY($2::int[])
    ORDER BY q."DTRECIEVE" DESC, i."PARTNO"
  `
    const query = {
      text: queryString,
      values: [req.query.cuid, paid_values]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for crfq item's stock drawer
app.get('/api/crfqinfo/stock', async(req, res) => {
  var paid_values; 
  // check if there are multiple parts
  if (Array.isArray(req.query.values)) {
    paid_values = req.query.values.map((value) => value);
  } else {
    paid_values = [req.query.values]
  }
  try{
    const queryString = `
    SELECT i.*, r."SMID", r."DATES" as "RECEIVEDATE", v."PONUM"  
    FROM "POITEMS" i 
    JOIN "SHIPMENT" r 
    ON i."SMID" = r."SMID"
    JOIN "VPO" v
    ON i."VPID" = v."VPID"
    WHERE i."PAID" = ANY($1::int[])
    AND i."RECTYPE" = 0
    AND i."AVAIL" > 0
    AND v."PONUM" is not null
    ORDER BY i."PARTNO", r."DATES" DESC
  `
    const query = {
      text: queryString,
      values: [paid_values]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

// fetch query for crfq item' linked cpo's
app.get('/api/crfqinfo/cpo', async(req, res) => {
  try{
    const queryString = `
    SELECT c."CPID", c."ORDERNO"
    FROM "CUSTPO" c
    WHERE c."RQID" = $1
    ORDER BY c."CPID"
  `
    const query = {
      text: queryString,
      values: [req.query.rqid]
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  };
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

// module.exports = app;
