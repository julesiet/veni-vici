
const AirplaneSim = ( { time = "0s" } ) => (

  <svg width={600} height={50} xmlns="http://www.w3.org/2000/svg">
    <line x1={100} y1={25} x2={500} y2={25} stroke="white" strokeWidth={5} />
    <circle cx={100} cy={25} r={15} fill="white" />
    <circle cx={500} cy={25} r={15} fill="white" />
    <image attributeName="plane" x={50} y={-20} width={90} height={90} href="./plane.png">
      <animateMotion dur={time} repeatCount="indefinite" path="M0,0 L400,0" />
    </image>
  </svg>
);

export default AirplaneSim;