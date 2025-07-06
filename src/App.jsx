import { useState } from 'react'
import './App.css'
const ACCESS_KEY = import.meta.env.VITE_AVIATION_STACK_ACCESS_KEY;

function App() {

  const callAPI = async (query) => {
    const response = await fetch(query);
    const json = await response.json();
    console.log("All data: ", json.data);
    console.log("Date of flight: ", json.data[0].flight_date);
    console.log("Airline: ", json.data[0].airline.name);
    console.log("DEPARTURE - Airport: ", json.data[0].departure.airport);
    console.log("ARRIVAL - Airport: ", json.data[0].arrival.airport);
  }

  const craftQuery = () => {
    let query = `https://api.aviationstack.com/v1/flights?access_key=${ACCESS_KEY}&limit=1&flight_status=active`
    callAPI(query).catch(console.error);
  }

  return (
    <div className="main-container">

      <div className="secondary-container"> 
        <div className="header-container">
          <h1> Fast Flight Finder </h1>
          <h3> 🗣️ yes yes yes i do love my flights and shi </h3>
        </div>

        <div className="flight-container">
          <button className="query-btn"> BOOM! </button>
        </div>

      </div>

    </div>
  )
}

export default App
