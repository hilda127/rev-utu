const fsPromises = require("fs/promises");
const template = require("lodash/template");

(async function () {
  console.log(
    `Injecting Gatsby Config with repo name ${process.env.GITHUB_REPO_NAME} under ${process.env.GITHUB_REPO_OWNER}...`
  );
  const dataTemplate = await fsPromises.readFile("./gatsby-config.js", "utf-8");
  const injectData = template(dataTemplate, { interpolate: /{{([\s\S]+?)}}/g });
  await fsPromises.writeFile(
    `./gatsby-config.js`,
    injectData({
      id: process.env.GITHUB_REPO_NAME,
      owner: process.env.GITHUB_REPO_OWNER,
    })
  );
})();
