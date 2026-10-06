import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import styles from "./index.module.css";
import clientServer from "@/config/axios";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionRequest,
  getMyConnectionRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserConnection, setIsCurrentUserConnection] = useState(false);
  const [isConnectionNull, setIsConnection] = useState(true);
  const [requestSent, setRequestSent] = useState(false);

  
  const getUserPost = async () => {
    try {
      await dispatch(getAllPosts());
      await dispatch(
        getConnectionsRequest({ token: localStorage.getItem("token") }),
      );
      await dispatch(
        getMyConnectionRequest({ token: localStorage.getItem("token") }),
      );
    } catch (error) {
      console.log("GET POSTS ERROR:", error);
    }
  };

 
  useEffect(() => {
    if (!postReducer.posts || !router.query.username) {
      return;
    }

    const posts = postReducer.posts.filter((post) => {
      return post.userId?.username === router.query.username;
    });

    setUserPosts(posts);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    if (!authState.connections || !userProfile?.userId?._id) {
      return;
    }

    const currentUserId = authState.user?.userId?._id || authState.user?._id;

    const profileUserId = userProfile.userId._id;

    const connection = authState.connections.find(
      (item) =>
        (item.userId?._id === currentUserId &&
          item.connectionId?._id === profileUserId) ||
        (item.connectionId?._id === currentUserId &&
          item.userId?._id === profileUserId),
    );

    if (connection) {
      setIsCurrentUserConnection(true);

      if (connection.status_accepted === true) {
        setIsConnection(false);
      } else {
        setIsConnection(true);
      }
    } else {
      setIsCurrentUserConnection(false);
      setIsConnection(true);
    }

    if (
      authState.connectionRequest.some(
        (user) => user.user._id === userProfile.userId._id,
      )
    ) {
      setIsConnectionUserInConnection(true);
      if (
        authState.connectionRequest.find(
          (user) => user.user._id === userProfile.userId._id,
        ).status_accepted === true
      )
        setIsConnectionNull(false);
    }
  }, [authState.connections, authState.user, userProfile]);

  
  useEffect(() => {
    getUserPost();
  }, []);

  
  
  if (!userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.container}>
            <h2>User not found</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={
                userProfile.userId?.profilePicture
                  ? `${BASE_URL}/${userProfile.userId.profilePicture}`
                  : "/default-profile.png"
              }
              alt="profile"
            />
          </div>

         
          <div className={styles.profileContainer_details}>
            <div
              style={{
                display: "flex",
                gap: "0.7rem",
              }}
            >
              <div style={{ flex: "0.8" }}>
                {/* NAME + USERNAME */}
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <h2>{userProfile.userId?.name}</h2>

                  <p style={{ color: "grey" }}>
                    @{userProfile.userId?.username}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  {isCurrentUserConnection || requestSent ? (
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      className={styles.connectBtn}
                      onClick={async () => {
                        try {
                          await dispatch(
                            sendConnectionRequest({
                              token: localStorage.getItem("token"),
                              user_id: userProfile.userId._id,
                            }),
                          ).unwrap();

                          setRequestSent(true);
                        } catch (error) {
                          console.log("Connection request:", error);

                          if (error === "Request already sent") {
                            setRequestSent(true);
                          }
                        }
                      }}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={async () => {
                      try {
                        const response = await clientServer.get(
                          `/user/download_resume?id=${userProfile.userId._id}`,
                        );

                        const resumePath = response.data.message.replace(
                          /^uploads\//,
                          "",
                        );

                        window.open(`${BASE_URL}/${resumePath}`, "_blank");
                      } catch (error) {
                        console.log(
                          "Resume download error:",
                          error.response?.data || error.message,
                        );
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      style={{ width: "1.2em" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>

                    {/* <span>Resume</span> */}
                  </div>
                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>
              </div>
            </div>

           
            <div className={styles.recentActivity}>
              <h3>Recent Activity</h3>

              {userPosts.length === 0 ? (
                <p>No posts yet.</p>
              ) : (
                userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContent}>
                          {post.media && (
                            <img src={`${BASE_URL}/${post.media}`} alt="post" />
                          )}
                        </div>

                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          
            <div className={styles.workHistory}>
              <h4>Work History</h4>

              <div className={styles.workHistoryContainer}>
                {(userProfile.pastWork || []).map((work, index) => {
                  return (
                    <div key={index} className={styles.workHistoryCard}>
                      <p
                        style={{
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.8rem",
                        }}
                      >
                        {work.company} - {work.position}
                      </p>

                      <p>{work.years}</p>
                    </div>
                  );
                })}

                {(!userProfile.pastWork ||
                  userProfile.pastWork.length === 0) && (
                  <p>No work history available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const username = context.params?.username;

    const response = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: {
          username: username,
        },
      },
    );

    return {
      props: {
        userProfile: response.data || null,
      },
    };
  } catch (error) {
    console.log("VIEW PROFILE ERROR:", error.response?.data || error.message);

    return {
      props: {
        userProfile: null,
      },
    };
  }
}
