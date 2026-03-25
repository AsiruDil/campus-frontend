// src/utils/nicParser.js

export const parseNIC = (nicNumber) => {
  let year, dayOfYear, gender;
  
  // Clean string
  const nic = nicNumber.trim();

  // Check Format
  if (nic.length === 10 && (nic.endsWith('V') || nic.endsWith('v') || nic.endsWith('X') || nic.endsWith('x'))) {
    // Old NIC (e.g., 901234567V)
    year = "19" + nic.substring(0, 2);
    dayOfYear = parseInt(nic.substring(2, 5));
  } else if (nic.length === 12 && !isNaN(nic)) {
    // New NIC (e.g., 199012345678)
    year = nic.substring(0, 4);
    dayOfYear = parseInt(nic.substring(4, 7));
  } else {
    return null; // Invalid Format
  }

  // Determine Gender (Females have values > 500)
  if (dayOfYear > 500) {
    gender = "Female";
    dayOfYear -= 500;
  } else {
    gender = "Male";
  }

  // Validate Day
  if (dayOfYear < 1 || dayOfYear > 366) return null;

  // Calculate Date
  const date = new Date(year, 0); // Start at Jan 1st of that year
  date.setDate(dayOfYear); // Add days

  // Format Birthday (YYYY-MM-DD)
  const formattedBirthday = date.toISOString().split('T')[0];

  // Calculate Age
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return {
    birthday: formattedBirthday,
    age: age,
    gender: gender
  };
};