import SolarSystem from "./solarSystem";
import gsap from "gsap";
import "./style.css";

const system = new SolarSystem();
system.start();

const tl = gsap.timeline({ defaults: { duration: 1 } });
tl.fromTo(system.earth.group.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
tl.fromTo("nav", { y: "-100%" }, { y: "0%" });
tl.fromTo(".title", { y: "300%" }, { y: "100%" });
