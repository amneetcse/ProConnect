import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import { getAboutUsers } from "@/config/redux/action/authAction";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import clientServer from "@/config/axios";

export default function ProfilePage() {
  const authState = useSelector((state) => state.auth);
  console.log("AUTH USER:", authState.user);

  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState({});

  const [userPosts, setUserPosts] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAboutUsers({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, []);

  useEffect(() => {
    if (authState.user != undefined) {
      setUserProfile(authState.user);
      const posts = postReducer.posts.filter((post) => {
        return post.userId?.username === authState.user.userId.username;
      });
      setUserPosts(posts);
    }
  }, [authState.user, postReducer.posts]);

  const updateProfilePicture = async (file) => {
    if (!file) return;

    const formData = new FormData();

    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    try {
      const response = await clientServer.post(
        "/update_profile_picture",
        formData,
      );

      console.log("PROFILE PICTURE RESPONSE:", response.data);

      dispatch(
        getAboutUsers({
          token: localStorage.getItem("token"),
        }),
      );
    } catch (error) {
      console.log(
        "PROFILE PICTURE ERROR:",
        error.response?.status,
        error.response?.data || error.message,
      );
    }
  };

  const updateProfileData = async () => {
    const request = await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });

    const response = await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });

    dispatch(getAboutUsers({ token: localStorage.getItem("token") }));
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <label
              htmlFor="profilePictureUpload"
              className={styles.backDrop__overlay}
            >
              <p>Edit</p>
            </label>
            <input
              onChange={(e) => {
                updateProfilePicture(e.target.files[0]);
              }}
              hidden
              type="file"
              id="profilePictureUpload"
            />
            <img
              src={
                userProfile.userId?.profilePicture || userProfile.profilePicture
                  ? `${BASE_URL}/${
                      userProfile.userId?.profilePicture ||
                      userProfile.profilePicture
                    }`
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
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    className={styles.nameEdit}
                    type="text"
                    value={userProfile?.userId?.name || ""}
                    onChange={(e) => {
                      setUserProfile({
                        ...userProfile,
                        userId: {
                          ...userProfile.userId,
                          name: e.target.value,
                        },
                      });
                    }}
                  />

                  <p style={{ color: "grey" }}>
                    @
                    {userProfile.userId?.username || userProfile.username || ""}
                  </p>
                </div>
              </div>

              <div>
                <textarea
                  value={userProfile?.bio || ""}
                  onChange={(e) => {
                    setUserProfile({
                      ...userProfile,
                      bio: e.target.value,
                    });
                  }}
                  rows={Math.max(
                    3,
                    Math.ceil((userProfile?.bio || "").length / 80),
                  )}
                  style={{ width: "350px" }}
                ></textarea>
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
              {(userProfile.pastWork || userProfile.userId?.pastWork || []).map(
                (work, index) => {
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
                },
              )}

              {/* <button className={styles.addWorkButton} onClick={() => {}}>
                Add Work
              </button> */}
            </div>
          </div>

          <br></br>
          

          {userProfile?._id === authState?.user?._id && (
            <div
              onClick={() => {
                updateProfileData();
              }}
              className={styles.updateProfileBtn}
            >
              Update Profile
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
