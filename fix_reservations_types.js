const fs = require('fs');
let content = fs.readFileSync('client/src/pages/reservations/ReservationsPage.tsx', 'utf8');

content = content.replace(
  "await createReservation(resForm);",
  "await createReservation(resForm as Partial<Reservation>);"
);

content = content.replace(
  "await createWaitlist(waitForm);",
  "await createWaitlist(waitForm as Partial<Waitlist>);"
);

fs.writeFileSync('client/src/pages/reservations/ReservationsPage.tsx', content);
