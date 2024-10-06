const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware');
const adminController = require('../controllers/adminController');

router.get('/student/form', authenticate, adminController.getStudentForm);
router.get('/student/table', authenticate, adminController.getStudentTable);
router.get('/group/table', authenticate, adminController.getGroupTable);
router.get('/group/info/:group_number', authenticate, adminController.getGroupInfo);

module.exports = router;
