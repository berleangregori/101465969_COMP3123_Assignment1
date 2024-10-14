const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Employee = require('../models/Employee');

const router = express.Router();

// ENDPOINT #3 GET /api/v1/emp/employees User can get all employee list 
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT #4 POST /api/v1/emp/employees User can create new employee 
router.post('/employees', [
  // Validation rules for creating an employee
  body('first_name').isString().notEmpty().withMessage('First name is required.'),
  body('last_name').isString().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Email is not valid.'),
  body('position').isString().notEmpty().withMessage('Position is required.'),
  body('salary').isNumeric().withMessage('Salary must be a number.'),
  body('date_of_joining').isISO8601().withMessage('Date of joining must be a valid date.'),
  body('department').isString().notEmpty().withMessage('Department is required.')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json({ message: 'Employee created successfully', employee_id: newEmployee._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT #5 GET /api/v1/emp/employees/:eid User can get employee details by employee id 
router.get('/employees/:eid', [
  param('eid').isMongoId().withMessage('Invalid employee ID format.')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const employee = await Employee.findById(req.params.eid);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT #6 PUT /api/v1/emp/employees/:eid User can update employee details 
router.put('/employees/:eid', [
  param('eid').isMongoId().withMessage('Invalid employee ID format.'),
  body('first_name').optional().isString().notEmpty().withMessage('First name is required if provided.'),
  body('last_name').optional().isString().notEmpty().withMessage('Last name is required if provided.'),
  body('email').optional().isEmail().withMessage('Email is not valid.'),
  body('position').optional().isString().notEmpty().withMessage('Position is required if provided.'),
  body('salary').optional().isNumeric().withMessage('Salary must be a number.'),
  body('date_of_joining').optional().isISO8601().withMessage('Date of joining must be a valid date.'),
  body('department').optional().isString().notEmpty().withMessage('Department is required if provided.')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(req.params.eid, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: "Employee details updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT #7 DELETE /api/v1/emp/employees User can delete employee by employee id 
router.delete('/employees', [
  query('eid').isMongoId().withMessage('Invalid employee ID format.')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { eid } = req.query; 
  try {
    const result = await Employee.findByIdAndDelete(eid);
    if (!result) {
      return res.status(404).json({ message: "Employee not found." });
    }
    
    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
