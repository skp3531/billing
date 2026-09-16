const fs = require('fs');
let content = fs.readFileSync('server/src/routes/index.ts', 'utf8');

content = content.replace(
  "import printerRoutes from './printer.routes';",
  "import printerRoutes from './printer.routes';\nimport reservationRoutes from './reservation.routes';\nimport waitlistRoutes from './waitlist.routes';"
);

content = content.replace(
  "router.use('/printers', printerRoutes);",
  "router.use('/printers', printerRoutes);\nrouter.use('/reservations', reservationRoutes);\nrouter.use('/waitlist', waitlistRoutes);"
);

fs.writeFileSync('server/src/routes/index.ts', content);
