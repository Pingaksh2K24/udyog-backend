import express from 'express';
import { 
  getCustomersByUser, 
  getCustomerById, 
  createNewCustomer,
  updateCustomer, 
  deleteCustomer
} from '../controllers/customerController.js';

const router = express.Router();

// Get customers by user ID
router.get('/user/:userId', getCustomersByUser);

// Get customer by ID
router.get('/:id', getCustomerById);

// Create new customer
router.post('/createNewCustomer', createNewCustomer);

// Update customer
router.put('/:id', updateCustomer);

// Delete customer
router.delete('/:id', deleteCustomer);

export default router;