const mockExisting = [
  { email: "john.doe@example.com", cin: "AA123456", phone: "+33601020304" },
  { email: "jane.smith@example.com", cin: "BB987654", phone: "+33611223344" },
];
export default mockExisting;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
export const phoneRegex = /^(\+?\d{6,15}|0\d{8,14})$/;
export const ribRegex = /^[0-9A-Z]{10,34}$/i; // IBAN/RIB simplified validation