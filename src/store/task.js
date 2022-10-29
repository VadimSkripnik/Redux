import { createAction, createSlice } from "@reduxjs/toolkit";
import todosService from "../services/todos.service";
import { setError } from "./errors";
import httpService from "../services/http.service";

const initialState = { entities: [], isLoading: true };

const todosEndepoint = "todos/";

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    recived(state, action) {
      state.entities = action.payload;
      state.isLoading = false;
    },
    update(state, action) {
      const elementIndex = state.entities.findIndex(
        (el) => el.id === action.payload.id
      );
      state.entities[elementIndex] = {
        ...state.entities[elementIndex],
        ...action.payload,
      };
    },
    remove(state, action) {
      state.entities = state.entities.filter(
        (el) => el.id !== action.payload.id
      );
    },
    taskRequested(state) {
      state.isLoading = true;
    },
    taskRequestFailed(state, action) {
      state.isLoading = false;
    },
    send(state, action) {
      const params = action.payload;
      const newArray = JSON.parse(JSON.stringify(state));
      const arr = newArray.entities.map(
        (el) => el.title && { ...el, title: params.title, completed: false }
      );
      /* fetch("https://jsonplaceholder.typicode.com/todos", {
                 method: "POST",
                 body: JSON.stringify(arr),
                 headers: {
                     "Content-type": "application/json; charset=UTF-8",
                 }
             }).then((response) => response.json())
             .then((json) => console.log(json))
             */
      const res = httpService
        .post(todosEndepoint, arr)
        .then((response) => response)
        .then((json) => json.data);
    },
  },
});
const { actions, reducer: taskReducer } = taskSlice;
const { update, remove, recived, taskRequested, taskRequestFailed, send } =
  actions;

export const loadTasks = () => async (dispatch) => {
  dispatch(taskRequested());
  try {
    const data = await todosService.fetch();
    dispatch(recived(data));
  } catch (error) {
    dispatch(taskRequestFailed());
    dispatch(setError(error.message));
  }
};

export const createTask = () => (dispatch, getState) => {
  dispatch(send({ title: "RRRRRRRRRRRRRR", completed: false }));
};

export const completeTask = (id) => (dispatch, getState) => {
  dispatch(update({ id, completed: true }));
};

export function titleChanged(id) {
  return update({ id, title: `New title for ${id}` });
}
export function taskDeleted(id) {
  return remove({ id });
}

export const getTasks = () => (state) => state.tasks.entities;
export const getTasksLoadingStatus = () => (state) => state.tasks.isLoading;

export default taskReducer;
