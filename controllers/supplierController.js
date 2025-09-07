import mongoose from 'mongoose';

// Get suppliers by user_id
const getSuppliersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting suppliers for user:', userId);
    
    const suppliers = await mongoose.connection.db
      .collection("suppliers")
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .toArray();
      
    console.log('Suppliers found:', suppliers.length);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all suppliers (admin)
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await mongoose.connection.db
      .collection("suppliers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;
    console.log('Getting supplier for ID:', supplierId);
    
    let query;
    if (
      mongoose.Types.ObjectId.isValid(supplierId) &&
      supplierId.length === 24
    ) {
      query = { _id: new mongoose.Types.ObjectId(supplierId) };
    } else {
      query = { supplierId: supplierId };
    }

    const supplier = await mongoose.connection.db
      .collection("suppliers")
      .findOne(query);
      
    console.log('Supplier found:', supplier ? 'Yes' : 'No');
    
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Supplier API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    console.log('Updating supplier for ID:', supplierId);
    
    let query;
    if (
      mongoose.Types.ObjectId.isValid(supplierId) &&
      supplierId.length === 24
    ) {
      query = { _id: new mongoose.Types.ObjectId(supplierId) };
    } else {
      query = { supplierId: supplierId };
    }

    const { _id, ...updateData } = req.body;

    const result = await mongoose.connection.db
      .collection("suppliers")
      .updateOne(
        query,
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ 
      success: true, 
      message: "Supplier updated successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    console.log('Deleting supplier for ID:', supplierId);
    
    let query;
    if (
      mongoose.Types.ObjectId.isValid(supplierId) &&
      supplierId.length === 24
    ) {
      query = { _id: new mongoose.Types.ObjectId(supplierId) };
    } else {
      query = { supplierId: supplierId };
    }

    const supplier = await mongoose.connection.db
      .collection("suppliers")
      .findOne(query);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await mongoose.connection.db
      .collection("suppliers")
      .deleteOne(query);

    res.json({
      success: true,
      message: "Supplier deleted successfully",
      deletedSupplier: supplier
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create new supplier
const createNewSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      addresses,
      gstNumber,
      panNumber,
      bankDetails,
      paymentTerms,
      creditLimit,
      rating,
      productsSupplied,
      notes,
      createdBy
    } = req.body;

    // Generate supplier ID
    const supplierCount = await mongoose.connection.db.collection("suppliers").countDocuments();
    const supplierId = `SUPP${String(supplierCount + 1).padStart(4, '0')}`;

    // Create supplier object
    const newSupplier = {
      supplierId,
      user_id: createdBy,
      name,
      contactPerson,
      email,
      phone: phone || [],
      addresses: addresses || [],
      gstNumber: gstNumber || '',
      panNumber: panNumber || '',
      bankDetails: bankDetails || {},
      paymentTerms: paymentTerms || 'Net 30',
      creditLimit: creditLimit || 0,
      rating: rating || 0,
      productsSupplied: productsSupplied || [],
      notes: notes || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: createdBy,
      deletedAt: null,
      deletedBy: null
    };

    const result = await mongoose.connection.db
      .collection("suppliers")
      .insertOne(newSupplier);

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier: {
        _id: result.insertedId,
        supplierId: newSupplier.supplierId,
        name: newSupplier.name,
        email: newSupplier.email,
        status: newSupplier.status
      }
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { 
  getSuppliersByUser, 
  getAllSuppliers, 
  getSupplierById, 
  updateSupplier, 
  deleteSupplier,
  createNewSupplier
};