import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

export default function NavbarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const isDashboard = router.pathname === "/dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(reset());
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>

        <h1
          style={{ cursor: "pointer" }}
          onClick={() => {
            router.push("/");
          }}
        >
          Pro Connect
        </h1>

        <div className={styles.navBarOptionContainer}>

          {isDashboard ? (
            <div
              style={{
                display: "flex",
                gap: "1.2rem",
                alignItems: "center",
              }}
            >
              {/* <p>
                Hey, {authState?.user?.userId?.name || "User"}
              </p> */}

              <p onClick={() => {
                router.push("/profile")
              }}
                style={{
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              
              >
                Profile
              </p>

              <button
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                router.push("/dashboard");
              }}
              className={styles.buttonJoin}
            >
              <p>Be a part</p>
            </div>
          )}

        </div>
      </nav>
    </div>
  );
}