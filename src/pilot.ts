import { IDroneData } from "./drones.js";

const pilotUrl = "http://assignments.reaktor.com/birdnest/pilots/";

export interface IPilot {
  name: string;
  email: string;
  phoneNumber: number;
  violationHappened: Date;
}

export const checkPilot = async (drone: IDroneData): Promise<IPilot> => {
  const url = pilotUrl + drone.serialNumber;

  const res = await fetch(url);
  const pilotData = await res.text();

  const jsonPilotData = JSON.parse(pilotData);

  const name = jsonPilotData.firstName + " " + jsonPilotData.lastName;
  const email = jsonPilotData.email;
  const phoneNumber = jsonPilotData.phoneNumber;
  const violationHappened = new Date();

  const pilot: IPilot = {
    name,
    email,
    phoneNumber,
    violationHappened
  }

  console.log("Offending pilot", pilot.name, "found");

  return pilot;
}
