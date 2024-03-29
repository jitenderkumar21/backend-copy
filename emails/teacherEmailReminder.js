const nodemailer = require('nodemailer');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { getChildInfoByClassId } = require('../dao/enrollmentsDao');
const {  insertSystemReport } = require('../dao/systemReportDao')

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';

const sendTeacherReminderEmail = async (reminderId,teacherReminderInfo) => {
 console.log('Sending reminder email for',reminderId,teacherReminderInfo);
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
      user: 'support@coralacademy.com',
      pass: 'xcvf sxnm yctg jvte',
    },
  });


  // Fetch learner details by classId
  const learnerDetails = await getChildInfoByClassId(teacherReminderInfo.subClassId);
  console.log('learnerDetails',learnerDetails);
  // Calculate totalEnrollments
  const totalEnrollments = learnerDetails.length;

  // Prepare the learner details table
  let learnerDetailsTable = `
    <table class="learner-table">
      <thead>
        <tr>
          <th>Child Name</th>
          <th>Child Age</th>
        </tr>
      </thead>
      <tbody>
  `;

  learnerDetails.forEach((learner) => {
    learnerDetailsTable += `
      <tr>
        <td>${learner.child_name}</td>
        <td>${learner.child_age}</td>
      </tr>
    `;
  });

  learnerDetailsTable += `
      </tbody>
    </table>
  `;

  // Prepare the email content
  const emailContent = `
    <html>
      <head>
        <title>Class Reminder - ${teacherReminderInfo.className}</title>
        <style>
          .learner-table {
            width: 60%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          .learner-table th, .learner-table td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }

          .learner-table th {
            background-color: #99e1ea;
          }
          p {
            color: black;
            font-size: 16px;
            line-height: 1.6;
          }
          li {
            color: black;
            font-size: 16px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <p>Hi ${teacherReminderInfo.teacherName},</p>
        <p>Just a friendly reminder that your class <strong>${teacherReminderInfo.className}</strong> is scheduled today.</p>
        <p><u><strong>Class Details:</strong></u></p>
        <p>Day & Date: ${teacherReminderInfo.DayandDate}</p>
        <p>Time: ${teacherReminderInfo.classTime}</p>
        <p>Zoom Link: ${teacherReminderInfo.zoomMeetingLink} , Meeting ID: ${teacherReminderInfo.meetingId}, Passcode: ${teacherReminderInfo.passcode}
        <p>Please find the learner details below:</p>
        <p>Total Enrollments: ${totalEnrollments} (This number might vary due to some expected no shows & last minute enrollments)</p>

        ${learnerDetailsTable}
        <p><strong><u>Things to note :</u></strong></p>

          <p><strong><u>Before Class : </u></strong></p>
          <ul>
              <li><strong>Class Prerequisites :</strong> We request you to email us the class prerequisites & materials (if any) at the earliest, so that we can send those to parents well in advance.</li>
              <li><strong>Student Homework & Uploads :</strong> Please inform us if your class requires completion of any student homework, so that we can request parents to upload the same.</li>
              <li><strong>Zoom Background :</strong> We request you to use the attached Coral Academy background on zoom during class.</li>
              <li><strong>Code of conduct :</strong> Classes are recorded for student safety, allowing parents to review study situations. Recorded videos are strictly confidential and for internal use only. We won't disclose them publicly or share with third parties without your consent.</li>
          </ul>

          <p><strong><u>During Class :</u></strong></p>
          <ul>
            <li><strong>Learner Verification :</strong> For learner safety, we request you to verify learners through a quick live video check-in at the beginning of each class, to visually confirm that the learner in question is a child. The learner can then turn off video after their check-in. If you’ve never seen the learner on video before, and they’re unable or unwilling to enable their video, please remove them from the class.</li>
            <li><strong>Post Class Interaction :</strong> Kindly inform students to stay back after you exit the class - We will be spending 10 minutes with the students to understand their topic preferences and get class feedback.</li>
            <li><strong>Support :</strong> A team member will join your class as a co-host, helping you navigate the waiting room and resolve any technical glitches.</li>
          </ul>

          <p><strong><u>After Class :</u></strong></p>
          <ul>
            <li><strong>Payments :</strong> Payments for class will be processed within 4 working days, post class.</li>
            <li><strong>Feedback :</strong> Your feedback is valuable to us! Please feel free to share your thoughts on how we can improve and make your experience even better.</li>
          </ul>

          <p>Please feel free to email us or text/call on (872)-222-8643 for any assistance required.</p>

          <p>Looking forward to class!</p>
          
          <p>Best,</p>
          <p>Coral Academy</p>
      </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: 'support@coralacademy.com',
    to: teacherReminderInfo.email,
    subject: `Reminder for class today - ${teacherReminderInfo.className}`,
    html: emailContent,
    headers: {
      References: uuidv4(),
    },
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending reminder email to teacher:', error);
      updateReminderStatus(reminderId, 'FAILURE', error.message);
      const reportData = { channel: 'EMAIL', type: 'Teacher Reminder', status: 'FAILURE', reason: error.message, parentEmail: teacherReminderInfo.email, classId:teacherReminderInfo.classId, reminderId:reminderId};
      insertSystemReport(reportData);
    } else {
      console.log('Reminder email sent to teacher:', teacherReminderInfo.email);
      updateReminderStatus(reminderId, 'SUCCESS', 'Teacher Reminder Email sent successfully');
      const reportData = { channel: 'EMAIL', type: 'Teacher Reminder', status: 'SUCCESS', parentEmail: teacherReminderInfo.email, classId:teacherReminderInfo.classId, reminderId:reminderId};
      insertSystemReport(reportData);
    }
  });
};

const updateReminderStatus = async (reminderId, statusToUpdate, responseBody) => {
  
    const updateClient = new Client({
        connectionString: connectionString,
    });
    try {
      await updateClient.connect();

      const result = await updateClient.query(
          'UPDATE reminders SET reminder_status = $1, response_body = $2 WHERE id = $3',
          [statusToUpdate, responseBody, reminderId]
      );


      console.log('Email Reminder status updated successfully for ID:', reminderId);
  } catch (err) {
      console.error('Error updating email reminder status:', err);
  } finally {
      updateClient.end();
}
};


module.exports = sendTeacherReminderEmail;
