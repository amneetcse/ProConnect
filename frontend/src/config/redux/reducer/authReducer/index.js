import { createSlice } from "@reduxjs/toolkit";

import {
  getAboutUsers,
  getAllUsers,
  getConnectionRequest,
  getMyConnectionRequest,
  loginUser,
  registerUser,
} from "../../action/authAction";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_users: [],

  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    reset: () => initialState,

    handleLoginUser: (state) => {
      state.message = "hello";
    },

    emptyMessage: (state) => {
      state.message = "";
    },

    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },

    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder

      
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Knocking the door...";
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;

        state.message = "Login is Successful";

        state.user = action.payload;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;

        state.message =
          action.payload?.message || "Login failed";
      })

      
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;

        state.message = "Registering you...";
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false;

        state.message =
          "Registration is Successful, Please Login";

        state.user = action.payload;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;

        state.message =
          action.payload?.message || "Registration failed";
      })

      
      .addCase(getAboutUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(getAboutUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.profileFetched = true;

        state.user = action.payload;
      })

      .addCase(getAboutUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.profileFetched = false;

        state.message =
          action.payload?.message ||
          "Unable to fetch user profile";
      })

      
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;

        state.all_users = action.payload || [];
      })

      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.all_profiles_fetched = false;

        state.message =
          action.payload?.message ||
          "Unable to fetch all users";
      })

     
      .addCase(
        getConnectionRequest.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        getConnectionRequest.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.connections =
            action.payload || [];
        }
      )

      .addCase(
        getConnectionRequest.rejected,
        (state, action) => {
          state.isLoading = false;

          state.message =
            action.payload?.message ||
            action.payload ||
            "Unable to fetch connections";
        }
      )

      
      .addCase(
        getMyConnectionRequest.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        getMyConnectionRequest.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.connectionRequest =
            action.payload || [];
        }
      )

      .addCase(
        getMyConnectionRequest.rejected,
        (state, action) => {
          state.isLoading = false;

          state.message =
            action.payload?.message ||
            action.payload ||
            "Unable to fetch connection requests";
        }
      );
  },
});

export const {
  reset,
  handleLoginUser,
  emptyMessage,
  setTokenIsThere,
  setTokenIsNotThere,
} = authSlice.actions;

export default authSlice.reducer;