// googleSheets.js

const { google } = require('googleapis');
const moment = require('moment-timezone');
const ClassUtility = require('./utils/subClassUtility');

const maxLearners = async () => {
  try {
    

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '1S0TqlZmzF-U2id7XsNnUXQxTPxqxMDqMez3RIhIZJf4';

    const readResult = await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Sheet1!A:V', // Specify the range you want to read
      });

      
      const rows = readResult.data.values;
      var overAllMap = {};
      var classIdToValue = {};
      var classIdToSlots = {};

      if (rows.length) {
        rows.slice(1).forEach((row) => {
            var classId = row[0];
            var value = row[15];
            classIdToValue[classId] = value;
            let slots = [];
            let displayClassTime = "";
            let timeZoneAbbreviation = 'PST';
            const classStartTimeGmt = ClassUtility.getGmtFromPstTiming(row[19]);
            const classEndTimeGmt = ClassUtility.getGmtFromPstTiming(row[20]);
            let classStartTime = moment(classStartTimeGmt, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
            let classEndTime = moment(classEndTimeGmt, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
            if (classStartTime.isValid() && classEndTime.isValid()) {
              const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h:mm A');
              const formattedClassEndTime = classEndTime.format('h:mm A');

              // Format the final string
              displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
              slots.push(displayClassTime);
            }
            classStartTime = moment(classStartTimeGmt, 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
            classEndTime = moment(classEndTimeGmt, 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
            if (classStartTime.isValid() && classEndTime.isValid()) {
              const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h:mm A');
              const formattedClassEndTime = classEndTime.format('h:mm A');
              timeZoneAbbreviation = 'MST';
              // Format the final string
              displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
              slots.push(displayClassTime);
            }
            classStartTime = moment(classStartTimeGmt, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
            classEndTime = moment(classEndTimeGmt, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
            if (classStartTime.isValid() && classEndTime.isValid()) {
              const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h:mm A');
              const formattedClassEndTime = classEndTime.format('h:mm A');
              timeZoneAbbreviation = 'EST';
              // Format the final string
              displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
              slots.push(displayClassTime);
            }
            classStartTime = moment(classStartTimeGmt, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
            classEndTime = moment(classEndTimeGmt, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
            if (classStartTime.isValid() && classEndTime.isValid()) {
              const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h:mm A');
              const formattedClassEndTime = classEndTime.format('h:mm A');
              timeZoneAbbreviation = 'CST';
              // Format the final string
              displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
              slots.push(displayClassTime);
            }

            classIdToSlots[classId] = slots;
        });
      } else {
        console.log('No data found.');
      }
      overAllMap['classIdToValue']=classIdToValue;
      overAllMap['classIdToSlots']=classIdToSlots;
      return overAllMap;


  } catch (err) {
    console.error('Error reading maxLearners from sheet', err);
  }
};

module.exports = maxLearners;
