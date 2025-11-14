export const emailWrapper = (content) => `
  <div style="
    font-family: Arial, sans-serif;
    background: #f4f4f4;
    padding: 30px;
    color: #333;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      background: white;
      border-radius: 10px;
      padding: 25px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    ">
      <h2 style="text-align:center; color:#007bff;">SchedulEase</h2>
      <div style="font-size: 15px; line-height: 1.6;">
        ${content}
      </div>
      <br/>
      <hr />
      <p style="font-size: 12px; color: #777; text-align: center;">
        This is an automated email—please do not reply.
      </p>
    </div>
  </div>
`;

/* ======================================================
   BOOKING TEMPLATE
====================================================== */
export const bookingEmailTemplate = (name, title, date, time, status) =>
  emailWrapper(`
    <p>Dear <strong>${name}</strong>,</p>

    <p>Your appointment request has been received successfully!</p>

    <p><strong>Details:</strong></p>
    <ul>
      <li><strong>Title:</strong> ${title}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
      <li><strong>Status:</strong> ${status.toUpperCase()}</li>
    </ul>

    <p>We will notify you if the status changes.</p>
  `);

/* ======================================================
   APPROVAL TEMPLATE
====================================================== */
export const approvalEmailTemplate = (name, title, date, time) =>
  emailWrapper(`
    <p>Dear <strong>${name}</strong>,</p>

    <p>Good news — your appointment has been <strong style="color:green;">APPROVED</strong>!</p>

    <p><strong>Appointment Details:</strong></p>
    <ul>
      <li><strong>Title:</strong> ${title}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
    </ul>

    <p>We look forward to assisting you.</p>
  `);

/* ======================================================
   REJECTION TEMPLATE
====================================================== */
export const rejectionEmailTemplate = (name, title) =>
  emailWrapper(`
    <p>Dear <strong>${name}</strong>,</p>

    <p>We regret to inform you that your appointment <strong>"${title}"</strong> has been
    <strong style="color:red;">REJECTED</strong>.</p>

    <p>You may book a new appointment at your convenience.</p>
  `);

/* ======================================================
   CANCELLATION TEMPLATE
====================================================== */
export const cancellationEmailTemplate = (name, title, date, time) =>
  emailWrapper(`
    <p>Dear <strong>${name}</strong>,</p>

    <p>Your appointment <strong>"${title}"</strong> scheduled on <strong>${date}</strong> at <strong>${time}</strong> 
    has been <strong style="color:red;">CANCELLED</strong>.</p>

    <p>If this was a mistake, please book a new appointment.</p>
  `);

/* ======================================================
   RESCHEDULE TEMPLATE
====================================================== */
export const rescheduleEmailTemplate = (name, title, date, time) =>
  emailWrapper(`
    <p>Dear <strong>${name}</strong>,</p>

    <p>Your appointment has been successfully <strong>rescheduled</strong>.</p>

    <p><strong>Updated Details:</strong></p>
    <ul>
      <li><strong>Title:</strong> ${title}</li>
      <li><strong>New Date:</strong> ${date}</li>
      <li><strong>New Time:</strong> ${time}</li>
    </ul>

    <p>Thank you for using SchedulEase.</p>
  `);
