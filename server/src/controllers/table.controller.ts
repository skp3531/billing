import { Request, Response } from 'express';
import Table from '../models/Table';

// Create a new table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, capacity, status, outletId } = req.body;
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
    const { name, capacity, status, outletId } = req.body;
    const organizationId = req.user?.organizationId;

    const table = await Table.findOneAndUpdate(
      { _id: id, organizationId },
      { name, capacity, status, outletId },
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
