import {
  nigeriaLocations,
  deliveryPricing,
  findLocation,
} from "../data/nigeria-locations.js";

/**
 * Dijkstra's Algorithm for calculating shortest delivery path and cost
 * In this simplified version, we calculate direct distance from Lagos (hub) to destination
 * For a full graph implementation, you would build a network of connected cities
 */

class DeliveryService {
  /**
   * Calculate base delivery cost based on distance from Lagos
   * Uses distance-based pricing with zone rates
   */
  calculateBaseDeliveryCost(distance) {
    const { zones, minimumFee, baseRatePerKm } = deliveryPricing;

    // Lagos zone (within 50km) - flat rate
    if (distance <= zones.lagos.maxDistance) {
      return zones.lagos.baseRate;
    }

    // Calculate based on zone-specific rates
    let cost;
    if (distance <= zones.nearbyStates.maxDistance) {
      cost = distance * zones.nearbyStates.ratePerKm;
    } else if (distance <= zones.southWest.maxDistance) {
      cost = distance * zones.southWest.ratePerKm;
    } else if (distance <= zones.southSouth.maxDistance) {
      cost = distance * zones.southSouth.ratePerKm;
    } else if (distance <= zones.middleBelt.maxDistance) {
      cost = distance * zones.middleBelt.ratePerKm;
    } else if (distance <= zones.northCentral.maxDistance) {
      cost = distance * zones.northCentral.ratePerKm;
    } else if (distance <= zones.northWest.maxDistance) {
      cost = distance * zones.northWest.ratePerKm;
    } else {
      cost = distance * zones.northEast.ratePerKm;
    }

    return Math.max(cost, minimumFee);
  }

  /**
   * Calculate delivery cost with speed option
   */
  calculateDeliveryCostWithSpeed(distance, speedOption = "standard") {
    const baseCost = this.calculateBaseDeliveryCost(distance);
    const { speedOptions } = deliveryPricing;

    const option = speedOptions[speedOption] || speedOptions.standard;
    return Math.round(baseCost * option.multiplier);
  }

  /**
   * Get all delivery options with pricing for a distance
   */
  getAllDeliveryOptions(distance, orderTotal = 0) {
    const { speedOptions, freeShippingThreshold } = deliveryPricing;
    const isFreeShipping = orderTotal >= freeShippingThreshold;

    const options = [];

    for (const [key, option] of Object.entries(speedOptions)) {
      const cost = isFreeShipping
        ? 0
        : this.calculateDeliveryCostWithSpeed(distance, key);
      const deliveryTime = this.estimateDeliveryTimeForSpeed(distance, key);

      options.push({
        id: key,
        name: option.name,
        description: option.description,
        cost: cost,
        originalCost: this.calculateDeliveryCostWithSpeed(distance, key),
        isFree: isFreeShipping,
        deliveryDays: `${deliveryTime.daysMin}-${deliveryTime.daysMax}`,
        daysMin: deliveryTime.daysMin,
        daysMax: deliveryTime.daysMax,
        isDefault: option.isDefault || false,
      });
    }

    return options;
  }

  /**
   * Estimate delivery time for a specific speed option
   */
  estimateDeliveryTimeForSpeed(distance, speedOption = "standard") {
    const { deliveryTime, speedOptions } = deliveryPricing;
    const speed = speedOptions[speedOption] || speedOptions.standard;

    let timeRange;
    if (distance <= deliveryTime.lagos.maxDistance) {
      timeRange = deliveryTime.lagos;
    } else if (distance <= deliveryTime.nearbyStates.maxDistance) {
      timeRange = deliveryTime.nearbyStates;
    } else if (distance <= deliveryTime.mediumDistance.maxDistance) {
      timeRange = deliveryTime.mediumDistance;
    } else if (distance <= deliveryTime.farDistance.maxDistance) {
      timeRange = deliveryTime.farDistance;
    } else {
      timeRange = deliveryTime.veryFarDistance;
    }

    // Get days based on speed option
    const baseDays = timeRange.standardDays;
    let daysMin, daysMax;

    if (speedOption === "economy") {
      daysMin = baseDays + 2;
      daysMax = baseDays + 3;
    } else if (speedOption === "express") {
      daysMin = Math.max(1, Math.floor(baseDays / 2));
      daysMax = Math.max(1, Math.ceil(baseDays / 1.5));
    } else {
      // Standard
      daysMin = baseDays;
      daysMax = baseDays + 1;
    }

    return {
      daysMin,
      daysMax,
      text:
        daysMin === daysMax
          ? `${daysMin} day${daysMin > 1 ? "s" : ""}`
          : `${daysMin}-${daysMax} days`,
    };
  }

  /**
   * Estimate delivery time based on distance (default standard speed)
   */
  estimateDeliveryTime(distance, speedOption = "standard") {
    return this.estimateDeliveryTimeForSpeed(distance, speedOption);
  }

  /**
   * Calculate estimated delivery date range
   */
  calculateDeliveryDate(distance, speedOption = "standard") {
    const { daysMin, daysMax } = this.estimateDeliveryTime(
      distance,
      speedOption
    );

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + daysMin);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + daysMax);

    return {
      minDate,
      maxDate,
      estimatedDate: maxDate, // Use max date as estimated delivery
    };
  }

  /**
   * Main function to calculate delivery details with speed options
   * Uses Dijkstra's principle: find the most cost-effective route
   * Returns all delivery speed options with pricing
   */
  calculateDelivery(
    state,
    city = null,
    speedOption = "standard",
    orderTotal = 0
  ) {
    try {
      // Find location data
      const location = findLocation(state, city);

      if (!location) {
        return {
          success: false,
          error: `Location not found: ${state}${city ? `, ${city}` : ""}`,
        };
      }

      const distance = location.distance;
      const { freeShippingThreshold } = deliveryPricing;
      const isFreeShipping = orderTotal >= freeShippingThreshold;

      // Get all delivery options
      const deliveryOptions = this.getAllDeliveryOptions(distance, orderTotal);

      // Get selected option (default to standard)
      const selectedOption =
        deliveryOptions.find((opt) => opt.id === speedOption) ||
        deliveryOptions.find((opt) => opt.isDefault);

      // Calculate delivery cost for selected option
      const deliveryCost = isFreeShipping ? 0 : selectedOption.cost;

      // Calculate delivery date for selected option
      const deliveryDates = this.calculateDeliveryDate(distance, speedOption);

      return {
        success: true,
        data: {
          state,
          city: city || state,
          distance,
          deliveryCost: deliveryCost,
          originalCost: selectedOption.originalCost,
          isFreeShipping,
          freeShippingThreshold,
          selectedSpeed: selectedOption.id,
          deliveryTime: selectedOption.deliveryDays,
          deliveryDays: selectedOption.daysMax,
          estimatedDeliveryDate: deliveryDates.estimatedDate,
          minDeliveryDate: deliveryDates.minDate,
          maxDeliveryDate: deliveryDates.maxDate,
          deliveryOptions, // All available options
          route: [
            { location: "Lagos (Hub)", distance: 0 },
            { location: `${city || state}`, distance },
          ],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Advanced Dijkstra implementation for multi-city routing
   * This would be used if you need to route through multiple distribution centers
   */
  findShortestPath(start, end, graph) {
    // Priority queue for Dijkstra's algorithm
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Initialize distances
    for (const node in graph) {
      distances[node] = Infinity;
      previous[node] = null;
      unvisited.add(node);
    }
    distances[start] = 0;

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let currentNode = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        if (distances[node] < minDistance) {
          minDistance = distances[node];
          currentNode = node;
        }
      }

      if (currentNode === end) break;
      if (minDistance === Infinity) break;

      unvisited.delete(currentNode);

      // Update distances to neighbors
      const neighbors = graph[currentNode] || {};
      for (const neighbor in neighbors) {
        const distance = distances[currentNode] + neighbors[neighbor];
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          previous[neighbor] = currentNode;
        }
      }
    }

    // Reconstruct path
    const path = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return {
      path,
      distance: distances[end],
    };
  }

  /**
   * Get all available delivery locations
   */
  getAvailableLocations() {
    const locations = [];
    for (const state in nigeriaLocations) {
      const stateData = nigeriaLocations[state];
      locations.push({
        state,
        cities: stateData.cities.map((city) => city.name),
        baseDistance: stateData.baseDistance,
      });
    }
    return locations;
  }

  /**
   * Validate if delivery is available to location
   */
  isDeliveryAvailable(state, city = null) {
    const location = findLocation(state, city);
    return location !== null;
  }
}

export default new DeliveryService();
