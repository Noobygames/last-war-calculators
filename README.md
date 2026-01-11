# Last War: Survival - DR Analyst 🛡️

An advanced strategy tool designed to calculate and optimize **Damage Reduction (DR)** for your hero squads. This tool uses specific scaling data to help players reach the 75% DR cap effectively.

Big Thanks to Hok, Raincamp and all those people in discord who try to figure out stuff everyday.

## 🚀 Live Demo
[Insert your GitHub Pages Link here](https://noobygames.github.io/last-war-stuff/)

---

## ✨ Features

* **Multi-Squad Management:** Plan and save up to 3 independent squads.
* **Row-Specific Analytics:** Distinct calculations for **Front Row** and **Back Row** DR, accounting for row-specific hero buffs.
* **Dynamic Hero Database:** Hero data is loaded from an external `heroes.json` for easy updates and maintenance.
* **Smart Target Logic:** * **Self-Buffs:** Corrected averages for individual hero DR.
    * **Row-Buffs:** Direct impact on the specific row (e.g., Murphy's Front Row buff).
    * **Team-Buffs:** Global DR increase for all 5 heroes.
* **Persistent Storage:** Your configurations and levels are automatically saved to your browser's local storage.
* **Responsive Design:** Fully functional on both Desktop and Mobile browsers.

## 📊 How it Works

1.  **Set Base DR:** Enter your global DR from Tech and Drone.
2.  **Filter & Select:** Use the category filters (Tank, Aircraft, Missile) to find your heroes.
3.  **Assign Position:** Click **FRONT** or **BACK** to add a hero to your squad.
4.  **Set Levels:** Input the hero's level to calculate the dynamic DR growth.
5.  **Monitor the Cap:** The UI highlights values in **Red** if you exceed the 75% cap (indicating "Buffer DR" against Armor Pierce).

## 🛠️ Technical Structure

* `index.html`: The core UI built with **Tailwind CSS**.
* `app.js`: The calculation engine and state management.
* `heroes.json`: The data source containing base values and growth increments (`inc`) per level.

## 🤝 Contribution

If you have updated scaling data or new hero stats from recent patches:
1.  Fork the repository.
2.  Update the `heroes.json` file.
3.  Submit a Pull Request.

---
*Disclaimer: This is a fan-made tool and is not affiliated with the developers of Last War: Survival.*
