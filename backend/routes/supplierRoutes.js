const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const router = express.Router();

// Supplier Schema
const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
});

const Supplier = mongoose.model("Supplier", SupplierSchema);

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dinushadeshan4@gmail.com", // Replace with your Gmail
    pass: "oqax fsvx gtue mlmb",      // Replace with App Password
  },
});

// POST - Add a new supplier and send an email
router.post(
  "/suppliers",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, phone, email, address } = req.body;

      // Check for duplicate email
      const existingSupplier = await Supplier.findOne({ email });
      if (existingSupplier) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const supplier = new Supplier({ name, phone, email, address });
      await supplier.save();

      // Send welcome email
      const emailHTML = `
        <h2>Welcome to Kade Management System</h2>
        <p>Dear ${name},</p>
        <p>Thank you for partnering with us. Your details have been added to our system:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Address:</strong> ${address}</li>
        </ul>
        <p>We look forward to working with you.</p>
        <p><strong>Kade Management Team</strong></p>
      `;

      await transporter.sendMail({
        from: '"Kade Management" <dinushadeshan4@gmail.com>',
        to: email,
        subject: "Welcome to Kade Management",
        html: emailHTML,
      });

      res.status(201).json({ message: "Supplier added successfully, email sent.", supplier });
    } catch (error) {
      console.error("Error adding supplier:", error.message);
      res.status(500).json({ error: "Failed to add supplier" });
    }
  }
);

// POST - Add a new supplier
router.post(
  "/suppliers",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, phone, email, address } = req.body;

      // Check for duplicate email
      const existingSupplier = await Supplier.findOne({ email });
      if (existingSupplier) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const supplier = new Supplier({ name, phone, email, address });
      await supplier.save();
      res.status(201).json({ message: "Supplier added successfully", supplier });
    } catch (error) {
      res.status(500).json({ error: "Failed to add supplier" });
    }
  }
);

// GET - Fetch all suppliers
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json({ suppliers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

// PUT - Update a supplier
router.put("/suppliers:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedSupplier) return res.status(404).json({ error: "Supplier not found" });

    res.json({ message: "Supplier updated successfully", supplier: updatedSupplier });
  } catch (error) {
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

// DELETE - Remove a supplier
router.delete("/suppliers:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (!deletedSupplier) return res.status(404).json({ error: "Supplier not found" });

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});



module.exports = router;