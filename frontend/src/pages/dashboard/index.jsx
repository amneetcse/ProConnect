import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import clientServer from "@/config/axios";

import { getAboutUsers, getAllUsers } from "@/config/redux/action/authAction";

import {
  createPost,
  deletePost,
  getAllPosts,
  incrementPostLike,
} from "@/config/redux/action/postAction";

import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout/index.jsx";

import styles from "./index.module.css";

const BASE_URL = "http://localhost:9080";

export default function Dashboard() {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState(null);



  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());

      dispatch(
        getAboutUsers({
          token: localStorage.getItem("token"),
        }),
      );
    }

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere, authState.all_profiles_fetched, dispatch]);



  const handleUpload = async () => {
    console.log("POST BUTTON CLICKED");
    console.log("Post content:", postContent);
    console.log("Selected file:", fileContent);

    try {
      const result = await dispatch(
        createPost({
          file: fileContent,
          body: postContent,
        }),
      );

      console.log("CREATE POST RESULT:", result);

      setPostContent("");
      setFileContent(null);

      dispatch(getAllPosts());
    } catch (error) {
      console.error("CREATE POST ERROR:", error);
    }
  };


  const handleDeletePost = async (postId) => {
    console.log("DELETE BUTTON CLICKED");
    console.log("POST ID:", postId);

    try {
      const result = await dispatch(
        deletePost({
          post_id: postId,
        }),
      );

      console.log("DELETE RESULT:", result);

      dispatch(getAllPosts());
    } catch (error) {
      console.error("DELETE POST ERROR:", error);
    }
  };

  const handleComment = async (postId) => {
    console.log("========== COMMENT START ==========");
    console.log("POST ID:", postId);
    console.log("COMMENT TEXT:", commentText);

    if (!commentText.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      console.log("TOKEN:", token);

      const response = await clientServer.post("/comment", {
        token: token,
        post_id: postId,
        commentBody: commentText,
      });

      console.log("COMMENT SUCCESS:", response.data);

      const commentResponse = await clientServer.get("/get_comments", {
        params: {
          post_id: postId,
        },
      });

      console.log("UPDATED COMMENTS:", commentResponse.data);

      setComments((prev) => ({
        ...prev,
        [postId]: commentResponse.data.comments || [],
      }));

      setCommentText("");
    } catch (error) {
      console.error("========== COMMENT ERROR ==========");

      console.error("ERROR:", error.response?.data || error.message);
    }
  };

  const handleOpenComments = (postId) => {
    setActiveCommentPost(activeCommentPost === postId ? null : postId);
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.scrollComponent}>
          <div className={styles.wrapper}>
           
            <div className={styles.createPostContainer}>
              <img
                className={styles.createPostProfile}
                src={
                  authState?.user?.userId?.profilePicture
                    ? `${BASE_URL}/${authState.user.userId.profilePicture}`
                    : `${BASE_URL}/default.jpg`
                }
                alt="Profile"
              />

              <textarea
                onChange={(e) => {
                  setPostContent(e.target.value);
                }}
                value={postContent}
                placeholder="What's in your mind?"
                className={styles.textArea}
              />

              <label htmlFor="fileUpload">
                <div className={styles.Fab}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
              </label>

              <input
                type="file"
                hidden
                id="fileUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  console.log("FILE SELECTED:", file);

                  setFileContent(file || null);
                }}
              />

              {postContent.length > 0 && (
                <button
                  type="button"
                  onClick={handleUpload}
                  className={styles.uploadButton}
                >
                  Post
                </button>
              )}
            </div>

          

            <div className={styles.postsContainer}>
              {postState?.posts?.map((post) => {
                if (!post?.userId) {
                  return null;
                }

                return (
                  <div key={post._id} className={styles.singleCard}>
                    

                    <div className={styles.singleCard_profileContainer}>
                      {/* PROFILE IMAGE */}

                      <img
                        className={styles.userProfile}
                        src={
                          post.userId?.profilePicture
                            ? `${BASE_URL}/${post.userId.profilePicture}`
                            : `${BASE_URL}/default.jpg`
                        }
                        alt={post.userId?.name || "Profile"}
                      />


                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >


                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >

                          <p
                            style={{
                              fontWeight: "bold",
                              margin: 0,
                            }}
                          >
                            {post.userId.name}
                          </p>


                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeletePost(post._id);
                            }}
                            title="Delete post"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 7.5h15"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 7.5V5.25A1.25 1.25 0 0 1 10.25 4h3.5A1.25 1.25 0 0 1 15 5.25V7.5"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.5 7.5l.75 12h7.5l.75-12"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 11v5.5"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14 11v5.5"
                              />
                            </svg>
                          </button>
                        </div>

                        <p
                          style={{
                            color: "grey",
                            marginTop: "3px",
                            marginBottom: 0,
                            fontSize: "12px",
                          }}
                        >
                          @{post.userId.username}
                        </p>

                        <p
                          style={{
                            paddingTop: "1.3rem",
                            marginBottom: "8px",
                          }}
                        >
                          {post.body}
                        </p>

                        {post.media && (
                          <div className={styles.singleCard_image}>
                            <img src={`${BASE_URL}/${post.media}`} alt="Post" />
                          </div>
                        )}

                        <div className={styles.optionsContainer}>
                          <div
                            onClick={async () => {
                              await dispatch(
                                incrementPostLike({ post_id: post._id }),
                              );
                              dispatch(getAllPosts());
                            }}
                            className={styles.singleOption_optionsContainer}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                              />
                            </svg>
                            <p>{post.likes || 0}</p>
                          </div>
                          <div
                            onClick={() => handleOpenComments(post._id)}
                            className={styles.singleOption_optionsContainer}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                              />
                            </svg>
                          </div>
                          <div
                            onClick={() => {
                              const text = encodeURIComponent(post.body);
                              const url = encodeURIComponent("apnacollege.in");

                              const twitterURL = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                              window.open(twitterURL, "_blank");
                            }}
                            className={styles.singleOption_optionsContainer}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                              />
                            </svg>
                          </div>
                        </div>
                        {activeCommentPost === post._id && (
                          <div className={styles.commentSection}>
                            <div className={styles.commentInputContainer}>
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                className={styles.commentInput}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                              />

                              <button
                                onClick={() => handleComment(post._id)}
                                className={styles.commentButton}
                              >
                                Post
                              </button>
                            </div>

                            <div className={styles.commentsList}>
                              {comments[post._id]?.length > 0 ? (
                                comments[post._id].map((comment) => (
                                  <div
                                    key={comment._id}
                                    className={styles.commentItem}
                                  >
                                    <div className={styles.commentUser}>
                                      {comment.userId?.name || "User"}
                                    </div>

                                    <div className={styles.commentText}>
                                      {comment.body}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className={styles.noComments}>
                                  No comments yet
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
