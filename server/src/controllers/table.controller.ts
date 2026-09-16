import { Request, Response } from 'express';
import Table from '../models/Table';
import Order from '../models/Order';
import Reservation from '../models/Reservation';

// Create a new table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId, rotation, width, height, assignedWaiterId, guestsSeated, linkedOrderIds } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newTable = new Table({
      organizationId,
      outletId,
      name,
      capacity,
      status: status || 'AVAILABLE',
    });

    const savedTable = await newTable.save();
    res.status(201).json(savedTable);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating table' });
  }
};

// Get all tables for the organization
export const getTables = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tables = await Table.find({ organizationId }).sort({ name: 1 });
    res.status(200).json(tables);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching tables' });
  }
};

// Get a specific table
export const getTableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const table = await Table.findOne({ _id: id, organizationId });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json(table);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching table' });
  }
};

// Update a table
export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId, rotation, width, height, assignedWaiterId, guestsSeated, linkedOrderIds } = req.body;
    const organizationId = req.user?.organizationId;

    const table = await Table.findOneAndUpdate(
      { _id: id, organizationId },
      { name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId, rotation, width, height, assignedWaiterId, guestsSeated, linkedOrderIds },
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json(table);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error updating table' });
  }
};

// Delete a table
export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const table = await Table.findOneAndDelete({ _id: id, organizationId });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting table' });
  }
};


export const getTableDashboard = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    const { outletId } = req.query;

    const query: any = { organizationId };
    if (outletId) query.outletId = outletId;

    const tables = await Table.find(query);
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'AVAILABLE').length;
    const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
    const reservedTables = tables.filter(t => t.status === 'RESERVED').length;
    const cleaningTables = tables.filter(t => t.status === 'CLEANING').length;
    
    const occupancyPercentage = totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0;

    // Revenue & Guests for Today
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const orderQuery: any = { 
      organizationId, 
      createdAt: { $gte: today },
      orderType: 'DINE_IN'
    };
    if (outletId) orderQuery.outletId = outletId;

    const todayOrders = await Order.find(orderQuery);
    
    const guestsSeatedToday = todayOrders.length * 2; // Approximating guests if not explicitly captured per order yet
    const tableRevenueToday = todayOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

    return res.status(200).json({
      data: {
        totalTables,
        availableTables,
        occupiedTables,
        reservedTables,
        cleaningTables,
        occupancyPercentage,
        guestsSeatedToday,
        tableRevenueToday
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};
