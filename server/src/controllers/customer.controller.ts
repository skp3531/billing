import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getCustomers = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { search } = req.query;

  const query: any = { organizationId };
  if (search && typeof search === 'string' && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { phone: regex }];
  }

  const customers = await Customer.find(query).sort({ createdAt: -1 });
  return successResponse(res, customers, 'Customers fetched successfully');
};

export const createCustomer = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const customer = await Customer.create({ ...req.body, organizationId });
  return successResponse(res, customer, 'Customer created successfully', 201);
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const customer = await Customer.findOneAndUpdate(
    { _id: id, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!customer) {
    return errorResponse(res, 'Customer not found', 404);
  }

  return successResponse(res, customer, 'Customer updated successfully');
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const customer = await Customer.findOneAndDelete({ _id: id, organizationId });

  if (!customer) {
    return errorResponse(res, 'Customer not found', 404);
  }

  return successResponse(res, null, 'Customer deleted successfully');
};
