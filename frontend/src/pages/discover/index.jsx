import React, { useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./index.module.css";
import { useRouter } from "next/router";

export default function Discoverpage() {
  const authState = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  const users = authState.all_users || authState.all_Users || [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1 className={styles.heading}>Discover</h1>

          {!authState.all_profiles_fetched && (
            <p className={styles.loading}>Loading users...</p>
          )}

          {authState.all_profiles_fetched && users.length === 0 && (
            <p className={styles.noUsers}>No users found.</p>
          )}

          <div className={styles.allUserProfile}>
            {users.map((user) => {
              if (!user || !user.userId) {
                return null;
              }

              const profilePicture = user.userId.profilePicture;

              return (
                <div
                  onClick={() => {
                    router.push(`/view_profile/${user.userId.username}`);
                  }}
                  key={user._id}
                  className={styles.userCard}
                >
                  <img
                    className={styles.userCard_image}
                    src={
                      profilePicture
                        ? `${BASE_URL}/${profilePicture}`
                        : "/default-profile.png"
                    }
                    alt="profile"
                  />

                  <div className={styles.userInfo}>
                    <h2>{user.userId.name}</h2>

                    <p>@{user.userId.username}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
