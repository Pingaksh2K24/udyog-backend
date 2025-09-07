import express from 'express';
import { 
  getSuppliersByUser, 
  getAllSuppliers, 
  getSupplierById, 
  updateSupplier, 
  deleteSupplier,
  createNewSupplier
} from '../controllers/supplierController.js';

const router = express.Router();

// Create new supplier
router.post('/createNewSupplier', createNewSupplier);

// Get suppliers by user_id
router.get('/user/:userId', getSuppliersByUser);

// Get all suppliers (admin)
router.get('/', getAllSuppliers);

// Get supplier by ID
router.get('/:id', getSupplierById);

// Update supplier
router.put('/:id', updateSupplier);

// Delete supplier
router.delete('/:id', deleteSupplier);

export default router;