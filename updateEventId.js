// googleSheets.js

const { google } = require('googleapis');

const updateEventId = async (index, newValue) => {
  try {
    
    

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '1S0TqlZmzF-U2id7XsNnUXQxTPxqxMDqMez3RIhIZJf4';

    console.log('saving event to cell',index,newValue);
    if (index!=undefined && newValue!=undefined) {
        // Update the cell in Google Sheets
        console.log('saving event to cell',index,newValue);
        await  google.sheets({ version: 'v4', auth: client }).spreadsheets.values.update({
          auth,
          spreadsheetId,
          range: `Sheet1!V${index + 1}`, // Assuming row[22] is in column V
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[newValue]], // Provide the new value to be inserted
          },
        });
      }

    console.log('Event id saved');

  } catch (err) {
    console.error('Error saving eventid', err);
  }
};

module.exports = updateEventId;
