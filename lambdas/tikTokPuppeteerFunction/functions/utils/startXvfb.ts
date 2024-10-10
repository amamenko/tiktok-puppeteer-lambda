import { execSync } from "child_process";

export const startXvfb = async () => {
  try {
    // Start Xvfb (create a virtual display)
    execSync("Xvfb :99 -screen 0 1280x1024x16 &", { stdio: "ignore" });

    // Set the DISPLAY environment variable to use the virtual display
    process.env.DISPLAY = ":99";
  } catch (error) {
    console.error("Failed to start Xvfb", error);
  }
};
