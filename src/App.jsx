import { useEffect, useState } from 'react';
import './App.css';
import AirplaneSim from './components/AirplaneSim';
const ACCESS_KEY = import.meta.env.VITE_AVIATION_STACK_ACCESS_KEY;
const AIRPORT_ACCESS_KEY = import.meta.env.VITE_AIRPORT_LOCATION_ACCESS_KEY;
const DISTANCE_FINDING_KEY = import.meta.env.VITE_DISTANCE_ACCESS_KEY;

function App() {

  const [attributes, setAttributes] = useState({});
  const [flightKeeper, setFlightKeeper] = useState([]);
  const [bannedAttributes, setBannedAttributes] = useState([]);

  const [arrAirport, setArrAirport] = useState('');
  const [depAirport, setDepAirport] = useState('');
  const [arrDate, setArrDate] = useState('');
  const [depDate, setdepDate] = useState('');

  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState(0);

  const callAPI = async (query) => {
    const response = await fetch(query);
    const originaljson = await response.json();
    const json = filteringData(originaljson);
    const rand = Math.floor(Math.random() * (Object.entries(json).length));

    // checkers
    // console.log("All data: ", json);
    console.log(rand);
    console.log("Flight Status: ", json[rand].flight_status);
    console.log("Airline: ", json[rand].airline.name);
    console.log("DEPARTURE - Airport: ", json[rand].departure.airport);
    console.log("ARRIVAL - Airport: ", json[rand].arrival.airport);

    const current_flight = { // create object with fetched data from json
      flight_status: 'FLIGHT STATUS: ' + json[rand].flight_status.toUpperCase(),
      airline_name: 'AIRLINE: ' + json[rand].airline.name,
      departing_airport: 'DEPARTING: ' + json[rand].departure.airport,
      arriving_airport: 'ARRIVING: ' + json[rand].arrival.airport
    };

    airportDistanceHelper(json[rand].departure.iata, json[rand].arrival.iata);
    timeCalculator(json[rand].departure.scheduled, json[rand].arrival.scheduled);

    setDepAirport(json[rand].departure.airport);
    setArrAirport(json[rand].arrival.airport);
    setAttributes({...current_flight}); 
    setFlightKeeper(prev => [...prev, current_flight]);
  }

  const timeCalculator = async (depDate, arrDate) => {
    const depDateFormatted = new Date(depDate);
    const arrDateFormatted = new Date(arrDate);

    const diff = arrDateFormatted.valueOf() - depDateFormatted.valueOf();
    const hours = diff / 1000 / 60 / 60;

    setdepDate(depDateFormatted.toUTCString());
    setArrDate(arrDateFormatted.toUTCString());
    setHours(hours.toFixed(2));
  }

  const filteringData = (json) => {
    let data = json.data;

    // if there are no banned attributes, just return the original list
    if (!bannedAttributes || bannedAttributes.length === 0) return data;

    // go through each banned attribute and filter matching flights
    bannedAttributes.forEach(attr => {
      const [label, value] = attr.split(': ').map(s => s.trim());

      if (label === 'FLIGHT STATUS') {
        data = data.filter(flight => flight.flight_status.toUpperCase() !== value.toUpperCase());
      } else if (label === 'AIRLINE') {
        data = data.filter(flight => flight.airline.name.toUpperCase() !== value.toUpperCase());
      } else if (label === 'DEPARTING') {
        data = data.filter(flight => flight.departure.airport.toUpperCase() !== value.toUpperCase());
      } else if (label === 'ARRIVING') {
        data = data.filter(flight => flight.arrival.airport.toUpperCase() !== value.toUpperCase());
      }
    });

    return data;
};

  const craftQuery = () => {
    let query = `https://api.aviationstack.com/v1/flights?access_key=${ACCESS_KEY}`;
    callAPI(query).catch(console.error);
  }

  const airportDistanceHelper = async (iata1, iata2) => {
    const coords1 = await airportFinder(iata1);
    const coords2 = await airportFinder(iata2);

    if (coords1.includes(null) || coords2.includes(null)) {
      console.error("One or both airports not found.");
      return;
    }

    // call next function, passing the coordinates
    distanceFinder(coords1, coords2);
  };

  const airportFinder = async (iata) => {
    const query = `https://api.api-ninjas.com/v1/airports?iata=${iata}`;
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': `${AIRPORT_ACCESS_KEY}`
      }
    });

    const json = await response.json();

    if (json.length === 0) {
      console.error("No airport found for IATA:", iata);
      return [null, null];
    }

    return `${json[0].latitude},${json[0].longitude}`
  };


  const distanceFinder = async (start, end) => {
    const query = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${start}&destinations=${end}&key=${DISTANCE_FINDING_KEY}`;
    const response = await fetch(query);
    const json = await response.json();

    console.log(json);
    const distance = json.rows[0].elements[0].distance.text + '(s)';
    distance == 0 ? setDistance(0): setDistance(distance);
  }

  return (
    <div className="main-container">

      <div className="gallery-container">
        <h2 className="headers"> previously generated flights: </h2>
        <div className="inner">
          {flightKeeper.map((flight, i) => (
            <div key={i} className="flight-card">
              {Object.entries(flight).map(([key, value]) => (
                <p key={key} className="flight-attr">
                  <span className="bolds">
                    {value.substring(0, value.indexOf(':') + 2)}
                  </span>
                  <span className="italics"> 
                    {value.substring(value.indexOf(':') + 2)} 
                    </span>
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="secondary-container"> 
        <div className="header-container">
          <h1> Fast Flight Finder ᯓ ✈︎</h1>
          <h3> find flights quickly and some associated info with each newly generated flight! </h3>
          <h4 className="airplane-sim-desc"> CREDITS: AviationStack + Distance Matrix + APINinjas</h4>
          <div className="attr-container">
            {Object.entries(attributes).map(([variable, attr]) => (
              <button
                key={variable}
                className="attribute-btn one-line"
                onClick={() => {
                  if (!bannedAttributes.includes(attr)) {
                    setBannedAttributes(prev => [...prev, attr]);
                  }
                }}
              >
                {attr}
              </button>
            ))}
          </div>
        </div>

        <div className="display-container">
          {hours == 0 && distance == 0 ? (
            <p> </p>): (
              <div> 
                <AirplaneSim time={hours + 's'}/>
                <h4 className='airplane-sim-desc'> ^^ 1 hour = 1 sec (to how fast the plane flies in one cycle!) </h4>
                <h2> Flight from {depAirport} to {arrAirport} </h2>
                <h3> {depDate} <br></br> <span className="normal">to</span> <br></br> {arrDate} </h3>
                <p> DISTANCE: {distance == 0 ? 'An error has occurred in the calculation for the distance - try again!': distance} </p>
                <p> TIME: {hours} hr(s)  </p>
                <p> 
                  AVERAGE VELOCITY OF FLIGHT: 
                  {isNaN((parseFloat(distance.substring(0, distance.indexOf(' '))) / hours).toFixed(2)) ? 
                  ' An error has occurred in the calculation for the distance - try again!': ' ' + 
                  (parseFloat(distance.substring(0, distance.indexOf(' '))) / hours).toFixed(2) + ' km/hr'} 
                </p>
              </div>
            )}
        </div>

        <div className="flight-container">
          <button className="query-btn" onClick={craftQuery}> NEW FLIGHT! ✈︎</button>
        </div>

      </div>

      <div className="banned-container">
        <h2 className="headers"> banned attributes: </h2>
        <div className="inner">
          {bannedAttributes ? (
            bannedAttributes.map(attr => (
              <button
                key={attr}
                className="attribute-btn"
                onClick={() =>
                  setBannedAttributes(prev => prev.filter(a => a !== attr))
                }
              >
                {attr}
              </button>
            ))
          ) : (
            <p> </p>
          )}
          </div>
      </div>

    </div>
  )
}

export default App;
