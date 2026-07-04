import axios from "axios";
import History from "../models/History.model.js";
import Collections from "../models/Collections.model.js";


// Send API request
export const sendRequest = async (req, res) => {
  try {
    const { method, url, headers, body, _id } = req.body;

    const response = await axios({
      method,
      url,
      headers,
      data: body,
      validateStatus: () => true,
    });

    const historyEntry = new History({
      url,
      method,
      status: response.status,
      timestamp: new Date(),
      user_id: _id,
    });

    await historyEntry.save();

    res.json({
      status: response.status,
      headers: response.headers,
      body: response.data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Request failed",
    });
  }
};


// Get history
export const getHistory = async (req, res) => {
  try {
    const { _id } = req.query;

    const history = await History.find({
      user_id: _id,
    })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json(history);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not fetch history",
    });
  }
};


// Delete history
export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "History id is required",
      });
    }

    const result = await History.deleteOne({
      _id: id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: "History entry not found",
      });
    }

    res.json({
      message: "History deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not delete history",
    });
  }
};


// Create collection
export const createCollection = async (req, res) => {
  try {
    const collection = new Collections(req.body);

    await collection.save();

    res.json(collection);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not create collection",
    });
  }
};


// Get collections
export const getCollections = async (req, res) => {
  try {
    const { user_id } = req.query;

    const collections = await Collections.find({
      user_id,
    }).populate("requests");

    res.json(collections);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not fetch collections",
    });
  }
};


// Update collection
export const updateCollection = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Collection name is required",
      });
    }

    const collection = await Collections.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
      },
      {
        new: true,
      }
    );

    if (!collection) {
      return res.status(404).json({
        error: "Collection not found",
      });
    }

    res.json(collection);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update collection",
    });
  }
};


// Add request to collection
export const addRequestToCollection = async (req, res) => {
  try {
    const collection = await Collections.findById(
      req.params.id
    );

    if (!collection) {
      return res.status(404).json({
        error: "Collection not found",
      });
    }

    const newRequest = {
      ...req.body,
      createdAt: new Date(),
    };

    collection.requests.push(newRequest);

    await collection.save();

    res.json(collection);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to add request to collection",
    });
  }
};


// Delete request from collection
export const deleteRequestFromCollection = async (req, res) => {
  try {
    const { collectionId, requestId } = req.params;

    const collection = await Collections.findById(
      collectionId
    );

    if (!collection) {
      return res.status(404).json({
        error: "Collection not found",
      });
    }

    const request = collection.requests.id(requestId);

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    request.deleteOne();

    await collection.save();

    res.json({
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete request",
    });
  }
};


// Delete collection
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collections.findByIdAndDelete(
      req.params.id
    );

    if (!collection) {
      return res.status(404).json({
        error: "Collection not found",
      });
    }

    res.json({
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete collection",
    });
  }
};