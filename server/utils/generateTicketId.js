export const generateTicketId = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TICKET-${random}`;
};


