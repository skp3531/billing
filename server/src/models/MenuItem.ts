import mongoose, { Schema, Document } from 'mongoose';

interface IRecipeItem {
  rawMaterialId: mongoose.Types.ObjectId;
  quantity: number;
}

interface IVariant {
  name: string;
  price: number;
  active: boolean;
  recipe?: IRecipeItem[];
  sku?: string;
}

interface IModifierOption {
  name: string;
  price: number;
  active: boolean;
  recipe?: IRecipeItem[];
}

interface IModifierGroup {
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  active: boolean;
  options: IModifierOption[];
}

interface INutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface IAvailability {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  qrMenu: boolean;
}

export interface IMenuItem extends Document {
  organizationId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  shortName?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  basePrice: number;
  taxRate: number;
  taxType: 'INCLUSIVE' | 'EXCLUSIVE';
  hsnCode?: string;
  
  dietaryTags?: string[];
  allergens?: string[];
  isVeg: boolean;
  
  image?: string;
  galleryImages?: string[];
  
  kitchenStation?: string;
  prepTime?: number;
  
  isBestseller?: boolean;
  isRecommended?: boolean;
  isNewItem?: boolean;
  
  nutritionalInfo?: INutritionalInfo;
  availability?: IAvailability;
  
  active: boolean;
  recipe?: IRecipeItem[];
  variants: IVariant[];
  modifierGroups: IModifierGroup[];
  createdAt: Date;
  updatedAt: Date;
}

const recipeItemSchema = new Schema<IRecipeItem>({
  rawMaterialId: { type: Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const variantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
  recipe: [recipeItemSchema],
  sku: { type: String },
});

const modifierOptionSchema = new Schema<IModifierOption>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
  recipe: [recipeItemSchema],
});

const modifierGroupSchema = new Schema<IModifierGroup>({
  name: { type: String, required: true },
  isRequired: { type: Boolean, default: false },
  minSelections: { type: Number, default: 0 },
  maxSelections: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
  options: [modifierOptionSchema],
});

const nutritionalInfoSchema = new Schema<INutritionalInfo>({
  calories: { type: Number },
  protein: { type: Number },
  carbs: { type: Number },
  fat: { type: Number },
}, { _id: false });

const availabilitySchema = new Schema<IAvailability>({
  dineIn: { type: Boolean, default: true },
  takeaway: { type: Boolean, default: true },
  delivery: { type: Boolean, default: true },
  qrMenu: { type: Boolean, default: true },
}, { _id: false });

const menuItemSchema = new Schema<IMenuItem>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    shortName: { type: String },
    description: { type: String },
    sku: { type: String },
    barcode: { type: String },
    
    basePrice: { type: Number, required: true },
    taxRate: { type: Number, default: 5 },
    taxType: { type: String, enum: ['INCLUSIVE', 'EXCLUSIVE'], default: 'EXCLUSIVE' },
    hsnCode: { type: String },
    
    dietaryTags: [{ type: String }],
    allergens: [{ type: String }],
    isVeg: { type: Boolean, default: true },
    
    image: { type: String },
    galleryImages: [{ type: String }],
    
    kitchenStation: { type: String },
    prepTime: { type: Number }, // in minutes
    
    isBestseller: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isNewItem: { type: Boolean, default: false },
    
    nutritionalInfo: nutritionalInfoSchema,
    availability: { type: availabilitySchema, default: () => ({ dineIn: true, takeaway: true, delivery: true, qrMenu: true }) },
    
    active: { type: Boolean, default: true },
    recipe: [recipeItemSchema],
    variants: [variantSchema],
    modifierGroups: [modifierGroupSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
