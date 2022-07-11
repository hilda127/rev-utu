import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { useInView } from "react-intersection-observer";
import { graphql, Link } from "gatsby";
import slugify from "slugify";
import classnames from "classnames";

import useWindowSize from "../hooks/useWindowSize";
import { decryptBuffer, createBlobUrl } from "../utils/crypto";
import { fetchWithRetries } from "../utils/fetch";
import { naturalCompare, decrypt } from "../utils/string";
import Layout from "../components/Layout";
import Logo from "../components/Logo";
import Image from "../components/Image";

import * as styles from "./index.module.css";

const MIN_WIDTH_FOR_GRID = 600;

export default function PageIndex(props) {
  const { thumbnails } = props.data;

  // Flag to know whether entries are displayed as grid or list
  const isListDisplay = useMemo(() => {
    return thumbnails.edges.some(({ node }) => {
      const [_, width, height] = node.name.split("-");
      return width < MIN_WIDTH_FOR_GRID;
    });
  }, [thumbnails]);

  // Sort thumbnails by title name
  const sortedEntries = useMemo(() => {
    const map = {};

    for (const { node } of thumbnails.edges) {
      let [titleName] = node.relativePath.split("/");
      if (titleName.startsWith("Rev ")) {
        titleName = decrypt(titleName);
      }
      if (map[titleName] == null) {
        map[titleName] = [];
      }
      map[titleName].push(node);
    }

    const mapEntries = Object.entries(map);
    mapEntries.sort(([titleName1], [titleName2]) => {
      return naturalCompare(titleName1, titleName2);
    });

    return mapEntries;
  }, [thumbnails]);

  if (isListDisplay) {
    return <ListLayout sortedEntries={sortedEntries} />;
  }

  return <GridLayout sortedEntries={sortedEntries} />;
}

function GridLayout(props) {
  const { sortedEntries } = props;
  const { height: windowHeight } = useWindowSize();

  const onHeaderButtonClick = useCallback(() => {
    if (window.top != null) {
      window.top.postMessage("close", "*");
    }
  }, []);

  return (
    <Layout>
      <div className={styles.header}>
        <button className={styles.headerButton} onClick={onHeaderButtonClick}>
          <Logo className={styles.headerIcon} />
        </button>
      </div>
      <div className={styles.containerGrid}>
        {sortedEntries.map(([titleName, thumbnails], index) => {
          const { relativePath, publicURL, name } = thumbnails[0];
          const [_, width, height] = name.split("-");

          return (
            <Link
              className={styles.episodeGrid}
              to={`/${slugify(relativePath.split("/")[0].toLowerCase())}`}
              key={index}
            >
              <Thumbnail
                width={parseInt(width, 10)}
                height={parseInt(height, 10)}
                publicURL={publicURL}
                marginTop={windowHeight * 5}
                marginBottom={windowHeight * 5}
                displayGrid={true}
              />
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}

function ListLayout(props) {
  const { sortedEntries } = props;
  const { height: windowHeight } = useWindowSize();

  const onHeaderButtonClick = useCallback(() => {
    if (window.top != null) {
      window.top.postMessage("close", "*");
    }
  }, []);

  return (
    <Layout>
      <div className={styles.header}>
        <button className={styles.headerButton} onClick={onHeaderButtonClick}>
          <Logo className={styles.headerIcon} />
        </button>
      </div>
      <div className={styles.containerList}>
        {sortedEntries.map(([titleName, thumbnails], index) => {
          const { relativePath } = thumbnails[0];
          const episodeName = `Chapter ${titleName}`;

          return (
            <Link
              className={styles.episodeList}
              to={`/${slugify(relativePath.split("/")[0].toLowerCase())}`}
              key={index}
            >
              {thumbnails.map((thumbnail) => {
                const [_, width, height] = thumbnail.name.split("-");
                return (
                  <Thumbnail
                    key={thumbnail.publicURL}
                    width={parseInt(width, 10)}
                    height={parseInt(height, 10)}
                    publicURL={thumbnail.publicURL}
                    marginTop={windowHeight * 5}
                    marginBottom={windowHeight * 5}
                    displayGrid={false}
                  />
                );
              })}
              <p className={styles.episodeListTitle}>{episodeName}</p>
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}

function Thumbnail(props) {
  const { width, height, publicURL, marginTop, marginBottom, displayGrid } =
    props;
  const ratio = height / width;
  const [imageBuffer, setImageBuffer] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const onceRef = useRef(false);
  const { ref, inView } = useInView({
    rootMargin: `${marginTop}px 0px ${marginBottom}px`,
  });

  useEffect(() => {
    async function fetchImage() {
      const res = await fetchWithRetries(publicURL, 1000, 5);
      const buffer = await res.arrayBuffer();
      setImageBuffer(decryptBuffer(buffer));
    }
    if (inView && !onceRef.current) {
      fetchImage();
      onceRef.current = true;
    }
  }, [inView, publicURL]);

  useEffect(() => {
    if (inView) {
      setBlobUrl(createBlobUrl(imageBuffer));
    }

    return () => {
      if (blobUrl != null) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imageBuffer, inView]);

  const thumbnailClassName = classnames(styles.thumbnail, {
    [styles.thumbnailGrid]: displayGrid,
    [styles.thumbnailList]: !displayGrid,
  });

  return (
    <div className={thumbnailClassName} ref={ref}>
      <div
        style={{
          paddingTop: `${ratio * 100}%`,
        }}
      />
      {inView && blobUrl != null ? (
        <Image className={styles.thumbnailImage} src={blobUrl} />
      ) : null}
    </div>
  );
}

export const pageQuery = graphql`
  query {
    thumbnails: allFile(
      sort: { fields: dir }
      filter: { name: { regex: "/^thumbnail/" } }
    ) {
      edges {
        node {
          publicURL
          relativePath
          name
        }
      }
    }
  }
`;
