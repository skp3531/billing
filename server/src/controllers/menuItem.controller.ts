import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getMenuItems = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { categoryId } = req.query;

  const query: any = { organizationId };
  if (categoryId) query.categoryId = categoryId;

  const menuItems = await MenuItem.find(query);
  return successResponse(res, menuItems, 'Menu items fetched successfully');
};

export const getMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const menuItem = await MenuItem.findOne({ _id: id, organizationId });
  if (!menuItem) {
    return errorResponse(res, 'Menu item not found', 404);
  }

  return successResponse(res, menuItem, 'Menu item fetched successfully');
};

export const createMenuItem = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const menuItem = await MenuItem.create({ ...req.body, organizationId });
  return successResponse(res, menuItem, 'Menu item created successfully', 201);
};

export const updateMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    return errorResponse(res, 'Menu item not found', 404);
  }

  return successResponse(res, menuItem, 'Menu item updated successfully');
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, organizationId },
    { active: false },
    { new: true }
  );

  if (!menuItem) {
    return errorResponse(res, 'Menu item not found', 404);
  }

  return successResponse(res, null, 'Menu item deleted successfully');
};

export const downloadCsvTemplate = async (req: Request, res: Response) => {
  const headers = ['name', 'categoryName', 'description', 'basePrice', 'isVeg'];
  const sampleData = ['Pizza Margherita', 'Pizzas', 'Classic pizza', '10.50', 'true'];
  const csvContent = `${headers.join(',')}\n${sampleData.join(',')}\n`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=menu_item_template.csv');
  res.status(200).send(csvContent);
};

export const importCsv = async (req: any, res: Response) => {
  try {
    const organizationId = req.user!.organizationId;
    
    if (!req.file) {
      return errorResponse(res, 'No CSV file uploaded', 400);
    }
    
    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split('\n').filter((line: string) => line.trim() !== '');
    if (lines.length < 2) {
      return errorResponse(res, 'CSV file is empty or missing data', 400);
    }
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    let importedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((col: string) => col.trim());
      const record: any = {};
      headers.forEach((header: string, index: number) => {
        record[header] = row[index];
      });

      const { name, categoryName, description, basePrice, isVeg } = record;
      
      if (!name || !categoryName) continue; // Skip invalid rows

      // Find or create category
      let category = await Category.findOne({ organizationId, name: categoryName });
      if (!category) {
        category = await Category.create({ organizationId, name: categoryName });
      }
      
      await MenuItem.create({
        organizationId,
        categoryId: category._id,
        name,
        description,
        basePrice: parseFloat(basePrice) || 0,
        isVeg: isVeg === 'true' || isVeg === '1',
      });
      importedCount++;
    }
    
    return successResponse(res, { importedCount }, `${importedCount} menu items imported successfully`);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Error importing CSV', 500);
  }
};

