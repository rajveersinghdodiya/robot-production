import pepper from "@/assets/robot-pepper.jpg";
import kebbi from "@/assets/robot-kebbi.jpg";
import buddy from "@/assets/robot-buddy.jpg";
import cobot from "@/assets/robot-cobot.jpg";
import unitree from "@/assets/robot-unitree.jpg";
import zmorph from "@/assets/printer-zmorph.jpg";
import printerLarge from "@/assets/printer-large.jpg";
import mycobotMobile from "@/assets/products/mycobot-pro630-mobile.webp";
import mybuddy from "@/assets/products/mybuddy.webp";
import ultraArm from "@/assets/products/ultraarm-drawing.webp";
import agvMini from "@/assets/products/agv-mini.png";
import amrCircular from "@/assets/products/amr-circular.png";
import amr300 from "@/assets/products/amr-300kg.png";
import limoArm from "@/assets/products/limo-arm.png";
import limoMecanum from "@/assets/products/limo-mecanum.png";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: "Humanoid" | "Cobot" | "Quadruped" | "Education" | "3D Printer" | "Mobile Robot";
  brand: string;
  image: string;
  description: string;
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "pepper-humanoid",
    name: "Pepper-Class Humanoid",
    tagline: "Service & engagement humanoid",
    category: "Humanoid",
    brand: "Nuwa Robotics",
    image: pepper,
    description:
      "A full-size social humanoid built for receptions, exhibitions, and customer engagement. Touch display, expressive face, dual arms.",
    specs: [
      { label: "Height", value: "1.2 m" },
      { label: "Display", value: "10.1\" HD touch" },
      { label: "Battery", value: "8–12 hours" },
      { label: "Connectivity", value: "Wi-Fi, BT, LAN" },
    ],
  },
  {
    slug: "buddy-280",
    name: "Buddy 280 Dual-Arm",
    tagline: "Dual 6-axis collaborative",
    category: "Cobot",
    brand: "Elephant Robotics",
    image: buddy,
    description:
      "Desktop dual-arm humanoid cobot for research, demonstrations, and bimanual manipulation experiments.",
    specs: [
      { label: "DOF", value: "12 (6 per arm)" },
      { label: "Payload", value: "250g per arm" },
      { label: "Reach", value: "280 mm" },
      { label: "Use", value: "Research / Edu" },
    ],
  },
  {
    slug: "mycobot-280",
    name: "myCobot 280 Workstation",
    tagline: "6-axis collaborative arm",
    category: "Cobot",
    brand: "Elephant Robotics",
    image: cobot,
    description:
      "Compact, AI-enabled 6-axis cobot with vision kit, conveyor and bin-pick workstation. Ideal for AI & manufacturing labs.",
    specs: [
      { label: "DOF", value: "6" },
      { label: "Payload", value: "250 g" },
      { label: "Reach", value: "280 mm" },
      { label: "Vision", value: "Included" },
    ],
  },
  {
    slug: "kebbi-air",
    name: "Kebbi Air Social Robot",
    tagline: "AI companion for classrooms",
    category: "Education",
    brand: "Nuwa Robotics",
    image: kebbi,
    description:
      "Friendly AI desktop robot for STEM and language education. Supports block-based and Python coding.",
    specs: [
      { label: "Display", value: "Facial LCD" },
      { label: "Coding", value: "Block / Python" },
      { label: "Sensors", value: "Camera, mic array" },
      { label: "Audience", value: "K–12, college" },
    ],
  },
  {
    slug: "unitree-go1",
    name: "Unitree Go-Series Quadruped",
    tagline: "Agile robot dog platform",
    category: "Quadruped",
    brand: "Unitree",
    image: unitree,
    description:
      "Industrial-grade quadruped for inspection, research and AI development. Real-time gait control and SDK access.",
    specs: [
      { label: "Speed", value: "Up to 4.7 m/s" },
      { label: "Payload", value: "5 kg" },
      { label: "Battery", value: "~2.5 hours" },
      { label: "SDK", value: "Open" },
    ],
  },
  {
    slug: "zmorph-multi",
    name: "Zmorph Multi-Tool 3D Printer",
    tagline: "Print, mill & engrave",
    category: "3D Printer",
    brand: "Zmorph",
    image: zmorph,
    description:
      "Multi-tool fabrication system supporting FDM printing, CNC milling and laser engraving for makerspaces.",
    specs: [
      { label: "Build", value: "235 × 250 × 165 mm" },
      { label: "Tools", value: "FDM / CNC / Laser" },
      { label: "Material", value: "PLA, ABS, wood" },
      { label: "Use", value: "Makerspace" },
    ],
  },
  {
    slug: "industrial-printer",
    name: "Industrial Dual-Door 3D Printer",
    tagline: "Large-format prototyping",
    category: "3D Printer",
    brand: "IQNAAX Select",
    image: printerLarge,
    description:
      "Enclosed large-format FDM printer for engineering departments — high-temp materials, dual extruders.",
    specs: [
      { label: "Build", value: "400 × 400 × 400 mm" },
      { label: "Extruder", value: "Dual" },
      { label: "Materials", value: "PLA, PETG, ABS, Nylon" },
      { label: "Enclosure", value: "Heated" },
    ],
  },
  {
    slug: "mycobot-pro-630-mobile",
    name: "myCobot Pro 630 Mobile Manipulator",
    tagline: "Cobot arm on mobile base",
    category: "Mobile Robot",
    brand: "Elephant Robotics",
    image: mycobotMobile,
    description:
      "6-axis collaborative arm mounted on an autonomous mobile base — ideal for research in mobile manipulation, pick-and-place and lab automation.",
    specs: [
      { label: "Arm DOF", value: "6" },
      { label: "Payload", value: "2 kg" },
      { label: "Reach", value: "630 mm" },
      { label: "Base", value: "Autonomous AGV" },
    ],
  },
  {
    slug: "mybuddy-edu",
    name: "myBuddy Edu Dual-Arm",
    tagline: "Expressive dual-arm robot",
    category: "Education",
    brand: "Elephant Robotics",
    image: mybuddy,
    description:
      "Dual 6-axis arms with an expressive HD face — designed for education, AI research and human–robot interaction demos.",
    specs: [
      { label: "DOF", value: "13" },
      { label: "Display", value: "Animated face" },
      { label: "Payload", value: "250 g/arm" },
      { label: "Coding", value: "Python / ROS" },
    ],
  },
  {
    slug: "ultraarm-drawing",
    name: "UltraArm P340 Drawing Kit",
    tagline: "Precision desktop arm",
    category: "Education",
    brand: "Elephant Robotics",
    image: ultraArm,
    description:
      "Compact 4-axis precision desktop arm with drawing, writing and laser engraving kits — perfect for STEAM labs.",
    specs: [
      { label: "DOF", value: "4" },
      { label: "Payload", value: "500 g" },
      { label: "Reach", value: "340 mm" },
      { label: "Tools", value: "Pen / Laser" },
    ],
  },
  {
    slug: "agv-mini",
    name: "AGV Mini Autonomous Base",
    tagline: "Compact development AGV",
    category: "Mobile Robot",
    brand: "IQNAAX Select",
    image: agvMini,
    description:
      "Compact differential-drive AGV for indoor logistics R&D, SLAM, and ROS-based navigation development.",
    specs: [
      { label: "Payload", value: "30 kg" },
      { label: "Speed", value: "1.2 m/s" },
      { label: "Battery", value: "6 hours" },
      { label: "SDK", value: "ROS / ROS2" },
    ],
  },
  {
    slug: "amr-lidar-circular",
    name: "Lidar AMR Research Platform",
    tagline: "360° lidar mobile robot",
    category: "Mobile Robot",
    brand: "IQNAAX Select",
    image: amrCircular,
    description:
      "Cylindrical autonomous mobile robot with 360° lidar and stereo cameras — ideal for navigation, mapping and AI research.",
    specs: [
      { label: "Sensors", value: "Lidar + Stereo" },
      { label: "Payload", value: "20 kg" },
      { label: "Runtime", value: "8 hours" },
      { label: "OS", value: "Ubuntu / ROS" },
    ],
  },
  {
    slug: "amr-300kg-logistics",
    name: "Heavy-Duty AMR 300 kg",
    tagline: "Industrial logistics robot",
    category: "Mobile Robot",
    brand: "IQNAAX Select",
    image: amr300,
    description:
      "Industrial autonomous mobile robot for warehouse and intralogistics — carries up to 300 kg with smart obstacle avoidance.",
    specs: [
      { label: "Payload", value: "300 kg" },
      { label: "Speed", value: "1.5 m/s" },
      { label: "Navigation", value: "SLAM" },
      { label: "Battery", value: "10 hours" },
    ],
  },
  {
    slug: "limo-arm",
    name: "AgileX LIMO + Manipulator",
    tagline: "Mobile manipulation kit",
    category: "Mobile Robot",
    brand: "AgileX",
    image: limoArm,
    description:
      "Mecanum-wheel research robot with integrated 6-axis arm, depth camera and ROS stack — for mobile manipulation research.",
    specs: [
      { label: "Arm", value: "6-axis" },
      { label: "Wheels", value: "Mecanum" },
      { label: "Vision", value: "Depth camera" },
      { label: "SDK", value: "ROS / Python" },
    ],
  },
  {
    slug: "limo-mecanum",
    name: "AgileX LIMO Mecanum Rover",
    tagline: "All-direction research rover",
    category: "Mobile Robot",
    brand: "AgileX",
    image: limoMecanum,
    description:
      "Versatile mecanum-wheel research rover with multi-modal steering, depth vision and onboard compute — for SLAM and AI courses.",
    specs: [
      { label: "Steering", value: "4 modes" },
      { label: "Compute", value: "Jetson Nano" },
      { label: "Camera", value: "Depth + RGB" },
      { label: "SDK", value: "ROS" },
    ],
  },
];
