import { IImageFile } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";

const createCategory = async (
  categoryData: Partial<ICategory>,
  icon: IImageFile,
  authUser: IJwtPayload
) => {

  const category = new Category({
    ...categoryData,
    createdBy: authUser.userId,
    icon: icon?.path
  });

  const result = await category.save();

  return result;
};

export const CategoryService = {
  createCategory
}
