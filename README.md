# Window Screenshot Capture

![App Logo](icon.ico)

A simple yet powerful desktop application for capturing screenshots of specific windows or entire displays with a single click. Built with Electron, this tool is designed for efficiency and ease of use, especially for users who need to capture specific application windows in multi-monitor setups.

---

## 🌟 Key Features

*   **Selective Capture:** Take a screenshot of a specific application window, not just a rectangular area.
*   **Multi-Monitor Support:** Intelligently captures windows, even if they are on a secondary display.
*   **Full Display Capture:** Easily capture any of your connected monitors in their entirety.
*   **Custom Save Location:** Choose any folder on your computer to save your screenshots. Defaults to your Downloads folder for convenience.
*   **Live Window List:** Refresh the list of open windows and displays at any time.
*   **Recent Captures:** See a list of your most recent screenshots for quick reference.

---

## 💻 System Requirements

*   **Operating System:** Windows 10 or Windows 11.
*   **Note for Developers:** The source code is cross-platform and can be built for macOS and Linux, but the current build configuration in `package.json` is set up for Windows only.

---

## 🚀 Getting Started

There are two ways to get the application: either by installing the ready-to-use version or by building it from the source code.

### For Users (Installation)

1.  Navigate to the **[Releases](https://github.com/immineal/capture-window/releases)** page of this repository.
2.  Download the latest installer file (e.g., `Window Screenshot App Setup 1.0.0.exe`).
3.  Run the installer and follow the on-screen instructions.

### For Developers (Running from Source)

If you want to run the application in a development environment or make your own changes, follow these steps.

**Prerequisites:**
*   [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

**Instructions:**

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/immineal/capture-window.git
    cd capture-window
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the application:**
    ```sh
    npm start
    ```

---

## 🛠️ How to Use

1.  Launch the **Window Screenshot App**.
2.  Click **Refresh Windows List** to see all currently open, visible applications and connected displays.
3.  **(Optional)** Click **Choose Folder** to select a custom directory where your screenshots will be saved.
4.  Select the desired window or display from the dropdown menu.
5.  Click the **📷 Capture Screenshot** button.
6.  A confirmation message will appear, and the screenshot will be saved as a `.png` file in your selected folder.

---

## 📦 Building the Installer

If you have cloned the source code, you can build your own Windows installer.

Run the following command in the project's root directory:
```sh
npm run dist
```
The installer will be created in the `/dist` folder.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.