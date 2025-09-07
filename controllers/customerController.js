import mongoose from 'mongoose';

// Get customers by user_id
const getCustomersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting customers for user:', userId);
    
    const customers = await mongoose.connection.db
      .collection("customers")
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .toArray();
      
    console.log('Customers found:', customers.length);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    console.log('Getting customer for ID:', customerId);
    
    let query;
    if (
      mongoose.Types.ObjectId.isValid(customerId) &&
      customerId.length === 24
    ) {
      query = { _id: new mongoose.Types.ObjectId(customerId) };
    } else {
      query = { customerId: customerId };
    }

    const customer = await mongoose.connection.db
      .collection("customers")
      .findOne(query);
      
    console.log('Customer found:', customer ? 'Yes' : 'No');
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error('Customer API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new customer
const createNewCustomer = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      addresses,
      gstNumber,
      panNumber,
      paymentTerms,
      creditLimit,
      notes,
      createdBy
    } = req.body;

    // Generate customer ID
    const customerCount = await mongoose.connection.db.collection("customers").countDocuments();
    const customerId = `CUST${String(customerCount + 1).padStart(4, '0')}`;

    // Create customer object
    const newCustomer = {
      customerId,
      user_id: createdBy,
      name,
      contactPerson,
      email,
      phone: phone || [],
      addresses: addresses || [],
      gstNumber: gstNumber || '',
      panNumber: panNumber || '',
      paymentTerms: paymentTerms || 'Net 30',
      creditLimit: creditLimit || 0,
      notes: notes || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: createdBy
    };

    const result = await mongoose.connection.db
      .collection("customers")
      .insertOne(newCustomer);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: {
        _id: result.insertedId,
        customerId: newCustomer.customerId,
        name: newCustomer.name,
        email: newCustomer.email,
        status: newCustomer.status
      }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    console.log('Updating customer for ID:', customerId);
    
    let query;
    if (
      mongoose.Types.ObjectId.isValid(customerId) &&
      customerId.length === 24
    ) {
      query = { _id: new mongoose.Types.ObjectId(customerId) };
    } else {
      query = { customerId: customerId };
    }

    const { _id, ...updateData } = req.body;

    const result = await mongoose.connection.db
      .collection("customers")
      .updateOne(
        query,
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ 
      success: true, 
      message: "Customer updated successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    console.log('Deleting customer for ID:', customerId);
    
    let query;
    if (
      mongoose.Types.ObjectId.isValid(customerId) &&
      customerId.length === 24
    ) {
      query = { _id: new mongoose.Types.ObjectId(customerId) };
    } else {
      query = { customerId: customerId };
    }

    const customer = await mongoose.connection.db
      .collection("customers")
      .findOne(query);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await mongoose.connection.db
      .collection("customers")
      .deleteOne(query);

    res.json({
      success: true,
      message: "Customer deleted successfully",
      deletedCustomer: customer
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
};

export { 
  getCustomersByUser, 
  getCustomerById, 
  createNewCustomer,
  updateCustomer, 
  deleteCustomer
};