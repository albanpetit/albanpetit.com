# 🌐 albanpetit.com

Welcome to the repository of my personal website! Here, I share my projects on various topics, including electronics, web development, and the Maker world. You will also find tutorials, experiences, and useful information.

🔗 **Website:** [albanpetit.com](https://albanpetit.com)

---

## 🚀 Running the Project

### 🛠 Hugo CMS

Before you start, make sure you have installed the **Hugo extended version**. This website uses SCSS and TypeScript, which require the extended version of Hugo.

📌 If you use a non-extended Hugo version, you might encounter this error:
```
Error: Error building site: TOCSS: failed to transform "scss/style.scss" (text/x-scss): this feature is not available in your current Hugo version
```

To verify your Hugo installation, run:
```
hugo version
```
You should see something like this (your version number may vary):
```
hugo v0.102.3-b76146b129d7caa52417f8e914fc5b9271bf56fc+extended windows/amd64 BuildDate=2022-09-01T10:16:19Z VendorInfo=gohugoio
```

The **minimum required Hugo version** can be found in the theme's `theme.toml` file.

### ⚡ Build and Serve

Once Hugo is installed, you can build the website with:
```
hugo
```
This command generates the site in the `public` directory. To specify a different output directory, use:
```
hugo --destination <your-directory>
```

To run a development server and preview changes live, use:
```
hugo server
```
Hugo will start a local server and display the site at:
```
Web Server is available at http://localhost:1313/
```
Any modification to the project files will trigger an automatic rebuild and refresh the browser.

---

## 🐳 Running with Docker

Hugo provides an official Docker container to run the project. To start a development server using Docker:
```
docker run -p 1313:1313 \ 
-v ${PWD}:/src \ 
hugomods/hugo \ 
hugo server --bind 0.0.0.0
```

Alternatively, use Docker Compose:
```
docker-compose up
```

### 🏗 Dev Container (VS Code)
A **VS Code DevContainer** configuration is available, allowing you to develop within a preconfigured Docker environment. Simply open this project in **VS Code**, and it will set up everything automatically.

---

## 🤝 Contribution

Interested in contributing? Awesome! Here’s how to get started:

1. **Fork the repository**: Click the **Fork** button on GitHub.
2. **Clone your fork**:
   ```
   git clone https://github.com/your-username/albanpetit.com
   ```
3. **Create a new branch**:
   ```
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit:
   ```
   git commit -m "feat: description of the new feature"
   ```
5. **Push your branch**:
   ```
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** and describe your changes.

### 📜 Commit Naming Convention

To keep the commit history clean, please follow this format:
```
<type>: <subject>

<description>
```
- **Type** (choose one):
  - `build`: Build system changes (npm, webpack, etc.)
  - `ci`: Continuous Integration (GitHub Actions, Travis, etc.)
  - `docs`: Documentation updates
  - `feat`: New features
  - `fix`: Bug fixes
  - `perf`: Performance improvements
  - `refactor`: Code restructuring without feature changes
  - `style`: Code style updates (formatting, whitespace, etc.)
  - `test`: Adding/modifying tests
- **Subject**: Short, imperative-style summary (e.g., `Add new feature`, not `Added new feature`).
- **Description**: Optional, provides more details.

Following this convention makes collaboration easier! 🎯

---

## 🛠 Feedback and Issues

Have suggestions, found a bug, or want to request a feature? **Open an issue** on GitHub! Your feedback is always appreciated. 💡

Thank you for contributing to my website! 🚀

