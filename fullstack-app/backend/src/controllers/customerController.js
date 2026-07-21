const { Op } = require("sequelize");
const Customer = require("../models/Customer");

// =============================
// Get All Customers
// =============================
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      customers,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// =============================
// Get Customer By ID
// =============================
exports.getCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// =============================
// Get Customer By ID
// =============================
exports.getCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// =============================
// Search Customers
// =============================
exports.searchCustomers = async (req,res)=>{

    try{

        const {query}=req.query;


        const customers = await Customer.findAll({

            where:{
                [Op.or]:[
                    {
                        full_name:{
                            [Op.like]:`%${query}%`
                        }
                    },
                    {
                        phone:{
                            [Op.like]:`%${query}%`
                        }
                    }
                ]
            }

        });


        res.json({
            customers
        });


    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Error searching customers"
        });

    }
  };






// =============================
// Create Customer
// =============================
exports.createCustomer = async (req, res) => {
  try {

    const {
      full_name,
      phone,
      email,
      notes,
    } = req.body;

    const customer = await Customer.create({
      full_name,
      phone,
      email,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// Update Customer
// =============================
exports.updateCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const {
      full_name,
      phone,
      email,
      notes,
    } = req.body;

    await customer.update({
      full_name,
      phone,
      email,
      notes,
    });

    res.json({
      success: true,
      message: "Customer updated successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// Delete Customer
// =============================
exports.deleteCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};