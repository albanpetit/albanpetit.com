# albanpetit.com

[![github-pages](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/gh-pages.yml)
[![pages-build-deployment](https://github.com/AlbanPetit/albanpetitQ.com/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/pages/pages-build-deployment)

Here is the repository for my personal website where I share my projects on
various topics, including electronics, web development, and a lot of
things related to the Maker world, some tutorials, experiences, and
information are also available.

![albanpetit.com](https://github.com/albanpetit/albanpetit.com/blob/master/static/github-readme.png)

## Contribution

If you're interested in contributing to my website, i'd love to have your input. Here's how you can get started:

1. **Fork the Repository:** Click on the "Fork" button at the top right of this repository to create your own copy.
2. **Clone Your Fork:** Clone your forked repository to your local machine using the following command:
   ```bash
   git clone https://github.com/albanpetit/albanpetit.com
   ```
3. **Create a New Branch:** Switch to a new branch for your contributions.
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Changes:** Make the necessary changes or additions to improve the website.
5. **Commit Your Changes:** Commit your changes with descriptive commit messages.
   ```bash
   git commit -m "feat: description of the new feature"
   ```
6. **Push to Your Fork:** Push your changes to your forked repository.
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request:** Once you've pushed your changes to your fork, open a pull request in our repository. Provide a detailed description of your changes and any relevant information.

### Commit naming convention

To make the commit history as readable as possible, I try to adhere as closely as I can to the following naming convention :

```
<type> <sujet>

<description>
```

- **Type** defines the type of commit
  - **build**: build solution (gulp, webpack, npm)
  - **ci**: Continuous integration (Travis, Circle, BrowserStack, SauceLabs)
  - **git**: gitignore modification. submodule update, merging
  - **docs**: Documentation
  - **feat**: Add feature
  - **fix**: bug fix
  - **perf**: Performance improvement
  - **refactor**: Code changement which does not change the usage
  - **style**: Style modification
  - **test**: Tests modification
- **Sujet** contains a brief description of the changes
  Using the present imperative ("change", not "changed" or "changes")
  Without capital letter at the beginning
  No "." at the end of the description
- **Description** allows to detail in more detail the motivations behind
  the change. The rules are the same as for the Subject part.

I invite you to follow this convention to contribute more easily to this repository.

### Feedback and Issues

If you encounter any issues, have suggestions, or want to discuss new features,
please open an issue on the GitHub repository. Your feedback is highly valued!

Thank you for considering contributing to my website.

## Running the project

### Hugo CMS

Before you start, make sure you have installed Hugo extended version. For more information, see Hugo's documentation.
This website theme uses SCSS and TypeScript, that's why Hugo extended version is required. If you are using a non-extended Hugo installation, you will get the following error :

```bash
Error: Error building site: TOCSS: failed to transform "scss/style.scss" (text/x-scss): this feature is not available in your current Hugo version
```

Once you have installed Hugo, you can check the version by running the following command:

```bash
hugo version
```

Which should output something like this (the version number may be different), notice the extended keyword:

```bash
hugo v0.102.3-b76146b129d7caa52417f8e914fc5b9271bf56fc+extended windows/amd64 BuildDate=2022-09-01T10:16:19Z VendorInfo=gohugoio
```

The minimum required Hugo version can be seen in the theme's [theme.toml](https://github.com/albanpetit/albanpetit.com-theme/blob/master/theme.toml) file.

Now, all is ready, you can build the website by simply running :

```bash
hugo
```

The 'hugo' command builds the site, publishing the files to the public directory.
To publish the site to a different directory, use the `--destination` flag or set `publishDir` in the site configuration.

To view the site while developing layouts or creating content, `cd` into the project directory and run:
```bash
hugo server
```
The hugo server command builds the site into memory, and serves the pages using a minimal HTTP server. When you run hugo server it will display the URL of the local site:
```bash
Web Server is available at http://localhost:1313/
```
While the server is running, it watches the project directory for changes to assets, configuration, content, data, layouts, translations, and static files. When it detects a change, the server rebuilds the site and refreshes your browser using LiveReload.

Most Hugo builds are so fast that you may not notice the change unless you are looking directly at your browser.

### Docker

A `Dockerfile` is available on this repository, not stable but still usable, here are the commands to use it :

```bash
docker build -t albanpetit.com --build-arg HUGO_BASEURL=http://localhost:8080 .
docker run -p 8080:80 albanpetit.com
```
