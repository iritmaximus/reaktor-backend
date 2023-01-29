import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { checkPilot, IPilot } from "./pilot.js"; // typescript things

const droneUrl = "http://assignments.reaktor.com/birdnest/drones";




// returns a list of drone objects with the information:
// serialNumber, x-position and y-position
export const getDroneLocations = async () => {

  // fetches the given url for the xml data
  let res: Response;
  try {
    console.info("fetching data from", droneUrl);
    res = await fetch(droneUrl);
  } catch (e) {
    console.error("Error fetching the information,", e);
    return null;
  }

  // parses it to a XML-Document
  let doc: Document;
  try {
    const resString = await res.text();
    doc =  parseXmlDroneData(resString);
  } catch (e) {
    console.error("Error parsing the response,", e);
    return null;
  }

  // parses that XML to a list of drone objects with the wanted data
  let listOfDrones: IDroneData[];
  try {
    listOfDrones = getDataFromXmlDocument(doc);
    return listOfDrones;
  } catch (e) {
    console.error("Error making list of the drones,", e);
    return null;
  }




};

// parses the response from the fetch and parses it to a XML-Document
const parseXmlDroneData = (data: string): Document => {
  const parsedData = new DOMParser().parseFromString(data, 'text/xml');
  return parsedData;
}

// parses the wanted subelement (tagName) from a given element (Elem), ex. serialNumber
const getFieldsFromElement = (Elem: Element, tagName: string): string | null => {
  const wantedElement = Elem.getElementsByTagName(tagName);
  const elementData = wantedElement[0].firstChild;

  // null-check
  if (elementData) {
    return elementData.nodeValue;
  }
  return null;
}

// wanted data from the drones
export interface IDroneData {
  serialNumber: string;
  positionX: number;
  positionY: number;
}

// parses the required information from the xml-document and
// returns a list of drone-objects with the wanted information:
// serialNumber, x-position and y-position
const getDataFromXmlDocument = (doc: Document): IDroneData[] => {
  // list of drone objects that have only the wanted data
  const droneData: IDroneData[] = [];

  // get list of all drones in the xml
  const drones = doc.getElementsByTagName("drone");
  const droneList = Array.from(drones);

  // get all of the wanted information from each drone
  droneList.forEach(drone => {
    const serialNumber = getFieldsFromElement(drone, "serialNumber");
    const positionX = getFieldsFromElement(drone, "positionX");
    const positionY = getFieldsFromElement(drone, "positionY");

    // if all data was correctly obtained, push it to the list of drones
    if (serialNumber && positionX && positionY) {
        // parse the string value to a float and create the new object
        // also make the value represent meters
        const x = parseFloat(positionX) / 1000;
        const y = parseFloat(positionY) / 1000;
        const newDrone: IDroneData = {
          serialNumber,
          positionX: x,
          positionY: y
        }
        droneData.push(newDrone);
    } else {
      throw "Error fetching the specific values";
    }
  });

  return droneData;
}




export const checkDroneData = async (droneData: IDroneData[]) => {

  const offendingPilots: IPilot[] = [];

  console.info("Checking drone positions...");
  await Promise.all(droneData.map(async drone => {
    const x = drone.positionX;
    const y = drone.positionY;

    if (checkIfInNoflyzone(x, y)) {
      const pilot = await checkPilot(drone);
      offendingPilots.push(pilot);
    }
  }))

  console.log("Found", offendingPilots.length, "of offending pilots...");

  return offendingPilots;
}



const checkIfInNoflyzone = (x: number, y: number): Boolean => {
  const starting_point = 250;
  // calculate the distance from 250, 250 to x, y
  // sqrt(a²-b²) = distance, where a, b = new_cord - old_cord
  const distance = Math.sqrt((starting_point-x)**2+(starting_point-y)**2);
  // console.info("distance of drone to noflyzone center:", distance, "m");

  if (distance < 100) {
    return true;
  }
  return false;
};
