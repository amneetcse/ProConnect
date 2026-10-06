import clientServer from "@/config/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { create } from "axios";




export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",

  async (_, thunkAPI) => {

    try {

      const response =
        await clientServer.get("/posts");

      return thunkAPI.fulfillWithValue(
        response.data
      );

    } catch (err) {

      return thunkAPI.rejectWithValue(
        err.response?.data ||
        err.message
      );
    }
  }
);




export const createPost = createAsyncThunk(
  "post/createPost",

  async (userData, thunkAPI) => {

    const { file, body } = userData;

    try {

      const formData = new FormData();

      formData.append(
        "token",
        localStorage.getItem("token")
      );

      formData.append(
        "body",
        body
      );

      if (file) {
        formData.append(
          "media",
          file
        );
      }


      const response =
        await clientServer.post(
          "/post",
          formData
        );


      if (response.status === 200) {

        return thunkAPI.fulfillWithValue(
          "Post Uploaded"
        );

      }


      return thunkAPI.rejectWithValue(
        "Post not uploaded"
      );


    } catch (err) {

      console.error(
        "CREATE POST ERROR:",
        err
      );

      return thunkAPI.rejectWithValue(
        err.response?.data ||
        err.message
      );
    }
  }
);




export const deletePost = createAsyncThunk(
  "post/deletePost",

  async ({ post_id }, thunkAPI) => {

    try {

      console.log(
        "DELETE THUNK CALLED"
      );

      console.log(
        "POST ID TO DELETE:",
        post_id
      );


      const token =
        localStorage.getItem("token");


      if (!token) {

        return thunkAPI.rejectWithValue({
          message: "Token not found",
        });

      }


      const response =
        await clientServer.delete(
          "/delete_post",
          {
            data: {
              token: token,
              post_id: post_id,
            },
          }
        );


      console.log(
        "DELETE RESPONSE:",
        response.data
      );


      return thunkAPI.fulfillWithValue(
        response.data
      );


    } catch (err) {

      console.error(
        "DELETE POST ERROR:",
        err
      );

      console.error(
        "DELETE RESPONSE:",
        err.response?.data
      );


      return thunkAPI.rejectWithValue(
        err.response?.data ||
        {
          message:
            "Something went wrong",
        }
      );
    }
  }
);

export const incrementPostLike = createAsyncThunk(
  "post/incrementLike",

  async ({ post_id }, thunkAPI) => {
    try {
      console.log("LIKE THUNK CALLED");
      console.log("POST ID:", post_id);

      const response = await clientServer.post(
        "/increment_like",
        {
          post_id: post_id,
          token: localStorage.getItem("token"),
        }
      );

      console.log("LIKE RESPONSE:", response.data);

      return thunkAPI.fulfillWithValue(response.data);

    } catch (err) {
      console.log("LIKE ERROR:", err);
      console.log("LIKE ERROR RESPONSE:", err.response?.data);

      return thunkAPI.rejectWithValue(
        err.response?.data?.message ||
        err.message
      );
    }
  }
);