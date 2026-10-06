import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authReducer';
import postReducer from './postReducer';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        postReducer: postReducer

    }
})