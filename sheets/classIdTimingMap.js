// googleSheets.js

const { google } = require('googleapis');
const moment = require('moment-timezone');
require('dotenv').config();

const classIdTimingMap = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = process.env.CLASSES_SHEET_ID;

    const readResult = await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Sheet1!A:AE', // Specify the range you want to read
      });

      
  
      const rows = readResult.data.values;
      const classSubIdMap = new Map();

      if (rows.length) {
        rows.slice(1).forEach((row) => {

            const jsonObject = {};
            
            let upcomingTimeslots = [];
            let pastTimeslots = [];
            jsonObject['timeslots'] = [];
            const numberOfSubclasses = parseInt(row[25]) || 1;
            const classDuration = parseInt(row[13]) || 60;
            // console.log('Max slots',numberOfSubclasses);
            for (let counter = 0; counter < numberOfSubclasses; counter++) {
      
                const subClassId = `${row[0]}_${counter + 1}`; // Assuming 'id' is the first column
                const classStartTime = moment(row[19], 'YYYY-MM-DD HH:mm').format('HH:mm');
                const classEndTime = moment(row[20], 'YYYY-MM-DD HH:mm').format('HH:mm');
                const classStartTiming = counter === 0
                              ? row[19]
                              : row[25 + counter] + ' ' + classStartTime;
                const classEndTiming = counter === 0
                              ? row[20]
                              : row[25 + counter] + ' ' + classEndTime;
                
                const classEndTiming2 = moment(classStartTiming, 'YYYY-MM-DD HH:mm').add(classDuration, 'minutes').format('YYYY-MM-DD HH:mm');
                classSubIdMap.set(subClassId, [classStartTiming,classEndTiming2]);                              
                }
                
            });
      } else {
        console.log('No data found.');
      }
      return classSubIdMap;


  } catch (err) {
    console.error('Error reading from to Google Sheets:', err);
  }
};

module.exports = classIdTimingMap;
