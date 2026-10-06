import { createAsyncThunk } from "@reduxjs/toolkit";
import clientServer from "@/config/axios";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "Token not provided",
        });
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          message: "Login failed",
        },
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          message: "Registration failed",
        },
      );
    }
  },
);

export const getAboutUsers = createAsyncThunk(
  "auth/getAboutUsers",
  async (user, thunkAPI) => {
    try {
     const response = await clientServer.get(
  `/get_user_and_profile?token=${localStorage.getItem("token")}`
);
console.log(
  "GET ABOUT USER RESPONSE JSON:",
  JSON.stringify(response.data, null, 2)
);

return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/user/get_all_users"
      );

      console.log(
        "GET ALL USERS RESPONSE:",
        response.data
      );

      return response.data;
    } catch (err) {
      console.log(
        "GET ALL USERS ERROR:",
        err.response?.data || err.message
      );

      return thunkAPI.rejectWithValue(
        err.response?.data || {
          message: "Unable to fetch all users",
        }
      );
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: user.token,
          user_id: user.user_id,
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ||
          "Connection request failed"
      );
    }
  }
);

export const getConnectionRequest = createAsyncThunk(
  "user/getConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/user/getConnectionRequests",
        {
          params: {
            token: user.token,
          },
        }
      );

      return thunkAPI.fulfillWithValue(
        response.data.connections
      );
    } catch (err) {
      console.log(
        "GET CONNECTIONS ERROR:",
        err.response?.data || err.message
      );

      return thunkAPI.rejectWithValue(
        err.response?.data?.message ||
          "Unable to fetch connections"
      );
    }
  }
);
export const getMyConnectionRequest = createAsyncThunk(
  "user/getMyConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data.connection);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  },
);

export const AcceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        },
      );

      thunkAPI.dispatch(getConnectionRequest({token: user.token}))
      thunkAPI.dispatch(getMyConnectionRequest({token : user.token}))

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  },
);
