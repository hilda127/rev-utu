import React, { useRef, useState, useEffect } from "react";
import classnames from "classnames";

import * as styles from "./Image.module.css";

export default function Image(props) {
  const { className, src } = props;
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  function onLoad() {
    if (!isLoaded) {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    if (imageRef.current != null) {
      if (isLoaded) {
        setIsLoaded(false);
      }
    }
  }, [src]);

  const imageClassName = classnames(className, {
    [styles.imageHidden]: !isLoaded,
  });

  return (
    <img src={src} className={imageClassName} onLoad={onLoad} ref={imageRef} />
  );
}
