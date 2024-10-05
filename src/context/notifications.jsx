import { createContext, createEffect, onMount, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  clearNotifications,
  fetchNotifications,
} from "../services/notifications.service";
import { useAuthState } from "./auth";

const StateContext = createContext();
const DispatchContext = createContext();

const initialState = {
  count: 0,
  notifications: [],
};
export default function NotificationProvider(props) {
  const [store, setStore] = createStore(initialState);
  const authState = useAuthState();

  onMount(async () => {
    try {
      const { data } = await fetchNotifications();
      setInitialState(data.data);
    } catch (error) {
      console.error(error);
    }
  });

  createEffect(() => {
    const socket = authState?.socket;
    if (socket) {
      socket.on("notification", ({ notification, count }) => {
        addNotification(notification);
        setStore("count", count);
      });

      socket.on("hi",data=>{
        // console.log(data)
      })
    }
  });

  function setInitialState(data) {
    setStore("notifications", data.notifications);
    setStore("count", data.count);
  }

  function addNotification(notification) {
    setStore(
      "notifications",
      produce((notifications) => {
        notifications.push(notification);
      })
    );
  }

  const removeAllNotifications = async () => {
    try {
      const { data } = await clearNotifications();
      setStore("notifications", []);
      setStore("count", 0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StateContext.Provider value={store}>
      <DispatchContext.Provider
        value={{
          removeAllNotifications,
        }}
      >
        {props.children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export const useNotificationState = () => useContext(StateContext);
export const useNotificationDispatch = () => useContext(DispatchContext);
