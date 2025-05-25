import axios from "axios";

const API = process.env.REACT_APP_API;

export const getAllProducts = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`${API}/product`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};


export const createProduct = async (formData) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(`${API}/product`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // ✅ สำคัญมาก
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};


export const deleteProduct = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.delete(`${API}/product/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};


export const read = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`${API}/product/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateProduct = async (id, formData) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.put(`${API}/product/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};



