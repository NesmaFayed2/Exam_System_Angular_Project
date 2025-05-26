const Major = require("../models/Major");

async function seedMajors() {
  const majors = [
    { name: "mern", description: "MERN Stack" },
    { name: "dotnet", description: ".NET Stack" },
    { name: "python", description: "Python Stack" },
  ];

  try {
    const count = await Major.countDocuments();
    if (count === 0) {
      await Major.insertMany(majors);
      console.log("Majors seeded successfully!");
    } else {
      console.log("Majors already exist, skipping seeding.");
    }
  } catch (err) {
    console.error("Error seeding majors:", err);
  }
}
module.exports = seedMajors;
