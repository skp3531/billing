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

export interface IMenuItem extends Document {
  organizationId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  basePrice: number;
  taxRate: number;
  taxType: 'INCLUSIVE' | 'EXCLUSIVE';
  isVeg: boolean;
  image?: string;
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
    description: { type: String },
    basePrice: { type: Number, required: true },
    taxRate: { type: Number, default: 5 },
    taxType: { type: String, enum: ['INCLUSIVE', 'EXCLUSIVE'], default: 'EXCLUSIVE' },
    isVeg: { type: Boolean, default: true },
    image: { type: String },
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
