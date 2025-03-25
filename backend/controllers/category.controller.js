import Category from "../models/category.model.js"



export const createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        const category = new Category({ name, description, image });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully"});
    } catch (error) {
        console.log("Error in deleteCategory controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

//Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, image },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.log("Error in updateCategory controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};