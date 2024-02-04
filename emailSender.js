const nodemailer = require('nodemailer');
const ClassUtility = require('./utils/subClassUtility');
const classIdTimingMap = require('./sheets/classIdTimingMap');
const teacherInviteInfo = require('./teacherInviteInfo'); // Import the module
const { v4: uuidv4 } = require('uuid');

const sendEmail = async (personDetails,userTimeZone) => {
    const invitesInfo =  await teacherInviteInfo();
    const classIdTimings = await classIdTimingMap();

    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: 'xcvf sxnm yctg jvte',
        },
      });

      const prefix = "want another slot:";
      let flag = true;
      let confirmedClassesFlag = false;
      let isCoursePresent = false;
      
      let classes = '';
      let classes2 = '';

      const classDetails = personDetails.classDetails;
      classes += `
                <table class="class-table">
                    <tr>
                        <th>Class Name</th>
                        <th>Date and Time</th>
                        <th>Class Type</th>
                        <th>Zoom Details</th>
                    </tr>
            `;
      classDetails.forEach((classDetail) => {
        let { classid, className, classTag, timeslots } = classDetail;
        const inviteClassInfo = invitesInfo[classid];
        if (classTag.toLowerCase() === 'course') {
            classTag = 'Course *';
            if (timeslots && timeslots.length > 0) {
                // Filter out timeslots where isPast is true
                const futureTimeslots = timeslots.filter((timeslot) => !timeslot.isPast);
    
                if (futureTimeslots.length > 0) {
                    isCoursePresent = true;
                    confirmedClassesFlag = true;
                    classes += `
                            <tr>
                                <td>${className}</td>
                                <td>`;
    
                    futureTimeslots.forEach((timeslot, index) => {
                        let { timing, subClassId } = timeslot;
                        const userStartDateTime =classIdTimings.get(subClassId)[0];  // Replace this with the user's input
                        const userEndDateTime = classIdTimings.get(subClassId)[1]; 
                        let classDisplayTiming = ClassUtility.getClassDisplayTiming(userTimeZone,userStartDateTime,userEndDateTime);
                        
                        classes += `${classDisplayTiming}${index < futureTimeslots.length - 1 ? '<br>' : ''}`;
                    });
    
                    classes += `</td>
                                <td>${classTag}</td>
                                <td>
                                    <p class="custom-para"><a href=${inviteClassInfo[5]}>Zoom Link</a></p>
                                    <p class="custom-para">Meeting ID: ${inviteClassInfo[6]}</p>
                                    <p class="custom-para">Passcode: ${inviteClassInfo[7]}</p>
                                </td>
                            </tr>
                    `;
                }
            }
        } else {
            // For other class types
            if (timeslots && timeslots.length > 0) {
                // Filter out timeslots where isPast is true
                const futureTimeslots = timeslots.filter((timeslot) => !timeslot.isPast);
    
                futureTimeslots.forEach((timeslot) => {
                    let { timing,subClassId } = timeslot;
                    const userStartDateTime =classIdTimings.get(subClassId)[0];  // Replace this with the user's input
                    const userEndDateTime = classIdTimings.get(subClassId)[1]; 
                    let classDisplayTiming = ClassUtility.getClassDisplayTiming(userTimeZone,userStartDateTime,userEndDateTime);
                    confirmedClassesFlag = true;
                    classes += `
                            <tr>
                                <td>${className}</td>
                                <td>${classDisplayTiming}</td>
                                <td>${classTag}</td>
                                <td>
                                    <p class="custom-para"><a href="https://zoom.us/j/3294240234?pwd=ajdsWWlDWHpialdXUklxME1UVzVrUT09">Zoom Link</a></p>
                                    <p class="custom-para">Meeting ID: 329 424 0234</p>
                                    <p class="custom-para">Passcode: 123456</p>
                                </td>
                            </tr>
                    `;
                });
            }
        }
    });

      classes+=`</table>`;
    
      let message = '';
      if(personDetails.want_another_slot!== undefined && personDetails.want_another_slot !== ''){
        message = `We noticed that you have also requested additional time slots for some classes - ${personDetails.want_another_slot}.  We will try our best to schedule classes that work for you.</p>`;
      }
      let confirmedClassMessage1 = '';
      let confirmedClassMessage2 = '';
      if(confirmedClassesFlag==true){
        confirmedClassMessage1 = 'Here are your confirmed classes :';
        if(isCoursePresent == true){
          confirmedClassMessage2 = `* We recommend that ${personDetails.childName} attends all classes throughout the course to get the most out of them, as each class builds on the last one.`;
        }
      }else{
        classes = '';
        if(personDetails.want_another_slot!== undefined && personDetails.want_another_slot !== ''){
          message = `We noticed that you have also requested additional time slots for some classes - ${personDetails.want_another_slot}.  We will try our best to schedule classes that work for you.</p>`;
        }
      }
      
      const emailContent = `
      <html>
      <head>
        <title>Demo Registration Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
      
          .container {
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-left: 2%;
            margin-top:0;
            width: 80%;
          }
      
          h1 {
            color: #333;
            font-size: 24px;
            text-align: center;
          }
      
          p {
            color: black;
            font-size: 16px;
            line-height: 1.6;
          }
      
          .custom-para {
            color: #666;
            font-size: 12px;
            line-height: 1.0;
          }
          .class_div{
            margin-top: 20px;
            margin-bottom:50px;
          }
          .class-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
    
        .class-table th, .class-table td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }
    
        .class-table th {
            background-color: #99e1ea;
        }
          @media screen and (max-width: 600px) {
            .class_div p{
                line-height: 1.4;
                font-size: 14px;

              }
        }
          
          
        </style>
      </head>
      <body>
        <div class="container">
          <p>Dear ${personDetails.parentName},</p>
          <p>Thank You for choosing us for ${personDetails.childName}'s learning adventure! It's a joy to have you onboard!</p>
          <p>${confirmedClassMessage1}</p>
            ${classes}
          <p><i>${confirmedClassMessage2}</i></p>  
          ${message}
          <ul>
              <li><strong>Identity Verification:</strong> Ensuring learner safety as our highest priority,<strong> we request you to switch on ${personDetails.childName}'s camera at the start of each class for a quick identity check.</strong> While ${personDetails.childName} can choose to keep it off afterward, we suggest keeping it on for a more interactive learning experience.</li>
              <li><strong>Class Materials:</strong> The required class materials and details about homework submissions, if any, will be sent to you before class. Keep an eye on your email for these details.</li>
              <li><strong>Class Alerts:</strong> We have blocked your calendar for class; please let us know if you are unable to see it. We send class reminders via email & WhatsApp. Feel free to share your communication preferences with us!</li>
              <li><strong>Feedback:</strong> Class time includes a 10-minute feedback session. We kindly request ${personDetails.childName} to stay back, and share their class experience with us.</li>
              <li><strong>Class Withdrawals:</strong> We understand that plans might change - In case you would like to withdraw your child's enrolment from any class, please email us at support@coralacademy.com or send a text message to (872)-222-8643.</li>
              <li><strong>Code of Conduct:</strong> Classes are recorded for student safety, allowing parents to review study situations and enabling us to assess teacher performance. Recorded videos are strictly confidential and for internal use only. We won't disclose them publicly or share with third parties without parental consent.</li>
          </ul>

          <p>Your feedback is valuable to us! Please feel free to share any feedback with us <a href="https://docs.google.com/forms/d/e/1FAIpQLSflsLJJuG74V1jjS29B-R1TVPbD74e9H5CkKVQMX6CzM87AZQ/viewform">here!</a></p>

          <p>PFA our <a href="https://docs.google.com/document/d/1kU49ck4nGge6_k4Myua_eUpBx06MADlFxm_xRdUz7Os/edit" target="_blank">Code of Conduct Policy</a> for your reference.</p>

          <p><i><strong>Note:</strong>Classes are recorded for student safety. The recorded classes are for internal use only and are strictly confidential. These would not be disclosed or shared without parental consent.</i></p>

          <p>Happy Learning! </p>

          <p>Best,</p>
          <p>Coral Academy</p>
        </div>
      </body>
      </html>
      `;
      
      // Email content
      const mailOptions = {
        from: 'support@coralacademy.com', // Sender's email address
        to:personDetails.email,
        subject: `Let the Learning Begin! ${personDetails.childName} is Enrolled!`,
        // text: 'This is the email body text.',
        html:emailContent,
        headers: {
          References: uuidv4(),
        },
      };
      
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email to parent:', error);
        } else {
          console.log('Email sent to parent:', personDetails.email);
        }
      });

  };
  
  module.exports = sendEmail;