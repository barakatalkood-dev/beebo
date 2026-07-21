const Service = require("../models/Service");

// Get All Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll();

    res.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create Service
exports.createService = async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;

    const service = await Service.create({
      name,
      description,
      duration,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, duration, price } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await service.update({
      name,
      description,
      duration,
      price,
    });

    res.json({
      success: true,
      message: "Service updated successfully",
      service,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Service
exports.deleteService = async (req, res) => {
  try {

    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: "Service deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};