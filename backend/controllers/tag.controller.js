import Tag from "../models/tag.model.js"

export const createTag = async (req, res) => {
    try {
        const { name } = req.body;
        const tag = new Tag({ name });
        await tag.save();
        res.status(201).json(tag);

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getAllTags = async ( req, res) => {
    try {
        const tags = await Tag.find();
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

// Delete a tag
export const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findByIdAndDelete(id);
        if (!tag) {
            return res.status(404).json({ error: "Tag not found" });
        }
        res.status(200).json({ message: "Tag deleted successfully", tag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a tag
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Return the updated document
    );

    if (!updatedTag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.status(200).json(updatedTag);
  } catch (error) {
    console.log("Error in updateTag controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};