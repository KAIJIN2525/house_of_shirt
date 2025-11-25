import express from "express";
import deliveryService from "../services/delivery.service.js";

const router = express.Router();

/**
 * @route   POST /api/delivery/calculate
 * @desc    Calculate delivery cost and time for a location with speed options
 * @access  Public
 */
router.post("/calculate", async (req, res) => {
  try {
    const { state, city, speedOption = "standard", orderTotal = 0 } = req.body;

    if (!state) {
      return res.status(400).json({
        success: false,
        error: "State is required",
      });
    }

    // Calculate delivery details with speed option and order total
    const result = deliveryService.calculateDelivery(
      state,
      city,
      speedOption,
      orderTotal
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Delivery calculation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate delivery cost",
    });
  }
});

/**
 * @route   GET /api/delivery/locations
 * @desc    Get all available delivery locations
 * @access  Public
 */
router.get("/locations", async (req, res) => {
  try {
    const locations = deliveryService.getAvailableLocations();
    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch delivery locations",
    });
  }
});

/**
 * @route   GET /api/delivery/check/:state/:city?
 * @desc    Check if delivery is available to a location
 * @access  Public
 */
router.get("/check/:state/:city?", async (req, res) => {
  try {
    const { state, city } = req.params;

    const isAvailable = deliveryService.isDeliveryAvailable(state, city);

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable
        ? "Delivery is available to this location"
        : "Delivery is not available to this location",
    });
  } catch (error) {
    console.error("Error checking delivery availability:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check delivery availability",
    });
  }
});

export default router;
