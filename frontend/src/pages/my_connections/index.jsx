import React, { useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  AcceptConnection,
  getMyConnectionRequest,
  getConnectionRequest,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./index.module.css";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(
        getMyConnectionRequest({
          token: token,
        })
      );

      dispatch(
        getConnectionRequest({
          token: token,
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    console.log(
      "CONNECTION REQUESTS:",
      authState.connectionRequest
    );

    console.log(
      "MY NETWORK:",
      authState.connections
    );
  }, [
    authState.connectionRequest,
    authState.connections,
  ]);

  const handleAcceptConnection = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      await dispatch(
        AcceptConnection({
          connectionId: requestId,
          token: token,
          action: "accept",
        })
      ).unwrap();

      dispatch(
        getMyConnectionRequest({
          token: token,
        })
      );

      dispatch(
        getConnectionRequest({
          token: token,
        })
      );
    } catch (error) {
      console.log(
        "ACCEPT CONNECTION ERROR:",
        error
      );
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.7rem",
          }}
        >
          <h1>My Connections</h1>

          {authState.connectionRequest
            ?.filter(
              (connection) =>
                connection.status_accepted === false
            )
            .map((user) => {
              return (
                <div
                  className={styles.userCard}
                  key={user._id}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                      justifyContent: "flex-start",
                      width: "100%",
                    }}
                  >
                    <div className={styles.profilePicture}>
                      <img
                        src={`${BASE_URL}/${user.userId?.profilePicture}`}
                        alt=""
                      />
                    </div>

                    <div
                      className={styles.userInfo}
                      onClick={() => {
                        router.push(
                          `/view_profile/${user.userId?.username}`
                        );
                      }}
                    >
                      <h3>{user.userId?.name}</h3>
                      <p>{user.userId?.username}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleAcceptConnection(
                          user._id
                        );
                      }}
                      className={styles.connectedButton}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              );
            })}

          {(!authState.connectionRequest ||
            authState.connectionRequest.filter(
              (connection) =>
                connection.status_accepted === false
            ).length === 0) && (
            <p>No connection requests</p>
          )}

          <h4>My Network</h4>

          {authState.connections
            ?.filter(
              (connection) =>
                connection.status_accepted === true
            )
            .map((connection) => {
              const currentUserId =
                authState.user?.userId?._id ||
                authState.user?._id;

              let connectedUser = null;

              if (
                connection.userId?._id ===
                currentUserId
              ) {
                connectedUser =
                  connection.connectionId;
              } else {
                connectedUser =
                  connection.userId;
              }

              return (
                <div
                  onClick={() => {
                    if (connectedUser?.username) {
                      router.push(
                        `/view_profile/${connectedUser.username}`
                      );
                    }
                  }}
                  className={styles.userCard}
                  key={connection._id}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                      justifyContent: "flex-start",
                      width: "100%",
                    }}
                  >
                    <div className={styles.profilePicture}>
                      <img
                        src={`${BASE_URL}/${connectedUser?.profilePicture}`}
                        alt=""
                      />
                    </div>

                    <div className={styles.userInfo}>
                      <h3>
                        {connectedUser?.name}
                      </h3>

                      <p>
                        {connectedUser?.username}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}