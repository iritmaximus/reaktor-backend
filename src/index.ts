import express from "express";
import { checkDroneData, getDroneLocations } from "./drones.js"; // funny typescript errors
import { checkPilot, IPilot } from "./pilot.js";

const app = express();
const PORT = 5000;
const fifteenMinutes = 1000* 60 * 15;
let offendingPilots: IPilot[] = [];



// keeps the data fresh
const refreshDrones = async () => {
  await setInterval(async () => {
    await fetchReaktorApi();
  }, 5000);
}

refreshDrones();

const filterOldLogs = () => {
  // run every 5 minutes
  setInterval(() => {
    console.log()
    console.log("Filtering old logs...");

    const pilotCount = offendingPilots.length;
    offendingPilots = offendingPilots.filter(pilot => {
      const logAge = new Date().getTime() - pilot.violationHappened.getTime();
      return logAge < fifteenMinutes;
    });

    console.log("There is now", offendingPilots.length, "of pilots that have offended the no-fly zone");
    console.log("Previously there was", pilotCount);
    console.log()
  }, 500000);
}

filterOldLogs();

const fetchReaktorApi = async () => {
  const droneData = await getDroneLocations();
  if (droneData == null) {
    return null;
  }

  const newOffendingPilots = await checkDroneData(droneData);

  checkNewOffendingPilots(newOffendingPilots);
  console.log("There are currently", offendingPilots.length, "pilots that have offended the no-fly zone");
  console.log();
}




const checkNewOffendingPilots = (newOffendingPilots: IPilot[]) => {
  // if there is no new pilots, just quit
  if (newOffendingPilots.length === 0) {
    return;
  }

  // loop through the new pilots
  newOffendingPilots.map(pilot => {
    // so we know to add the pilot if it did not appear in the old pilot list
    let ifAlreadyInList = false;
    // to remember the index of the pilot we want to modify
    let i = 0;

    // loop throught the old pilots and modify the old pilot if there is
    // new pilot with the same name
    offendingPilots.map(oldPilot => {
      if (pilot.name === oldPilot.name) {
        offendingPilots[i] = pilot;
        ifAlreadyInList = true;
      }
      i++;
    })
    // if the new pilot was not in the old pilot list
    if (!ifAlreadyInList) {
      offendingPilots.push(pilot);
    }
  });
}


app.get("/", (_req, res) => {
  res.send("This is the backend");
});

app.get("/drones", async (_req, res) => {
  await fetchReaktorApi();
  res.send(offendingPilots);
});


app.listen(PORT, "0.0.0.0", () => {
  console.log("Listening on port", PORT);
});
