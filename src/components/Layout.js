import React, { useState, useEffect } from "react";

import useLocalStorage from "../hooks/useLocalStorage";

import * as styles from "./Layout.module.css";

export default function Layout(props) {
  const { children } = props;
  const [auth, setAuth] = useLocalStorage("auth", false);
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  if (!client) {
    return null;
  }

  if (!auth) {
    return <AuthModal onSuccess={() => setAuth(true)} />;
  }

  return <div>{children}</div>;
}

function AuthModal(props) {
  const { onSuccess } = props;

  function onInputTextChange(e) {
    if (e.target.value === "000000000") {
      onSuccess();
    }
  }

  return (
    <div className={styles.authModal}>
      <input
        className={styles.authInput}
        onChange={onInputTextChange}
        autoFocus
      />
    </div>
  );
}
