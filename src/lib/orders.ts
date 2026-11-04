export type Role = "customer" | "tailor" | "worker";
export type Stage = "placed" | "measured" | "cutting" | "stitching" | "fitting" | "ready" | "delivered";

export const STAGES: { key: Stage; label: string }[] = [
  { key: "placed", label: "Order placed" },
  { key: "measured", label: "Measurements taken" },
  { key: "cutting", label: "Fabric cutting" },
  { key: "stitching", label: "Stitching" },
  { key: "fitting", label: "Trial fitting" },
  { key: "ready", label: "Ready for pickup" },
  { key: "delivered", label: "Delivered" },
];

export type TimelineEvent = { id: string; role: Role; author: string; text: string; at: string; stage?: Stage | undefined };

export type Order = {
  id: string;
  customer: string;
  garment: string;
  fabric: string;
  worker: string;
  due: string;
  price: number;
  paid: number;
  stage: Stage;
  measurements: Record<string, string>;
  notes: string;
  timeline: TimelineEvent[];
};

const ev = (role: Role, author: string, text: string, at: string, stage?: Stage): TimelineEvent => ({
  id: Math.random().toString(36).slice(2),
  role, author, text, at, stage,
});

export const ORDERS: Order[] = [
  {
    id: "SS-1042", customer: "Areeba", garment: "Bridal Lehenga", fabric: "Raw silk, maroon",
    worker: "Shayan", due: "Nov 4", price: 85000, paid: 40000, stage: "stitching",
    measurements: { Chest: "34\"", Waist: "28\"", Hips: "38\"", Length: "42\"", Sleeve: "21\"" },
    notes: "Heavy zardozi on the dupatta border. Customer wants a slightly flared hem.",
    timeline: [
      ev("customer", "Areeba", "Placed order for a bridal lehenga.", "Oct 12, 10:20", "placed"),
      ev("tailor", "Master Mahad", "Measurements recorded in shop.", "Oct 13, 16:05", "measured"),
      ev("worker", "Shayan", "Fabric cut, panels ready.", "Oct 18, 12:40", "cutting"),
      ev("worker", "Shayan", "Started stitching the blouse.", "Oct 22, 09:15", "stitching"),
      ev("customer", "Areeba", "Can the neckline be a bit deeper?", "Oct 24, 19:02"),
      ev("tailor", "Master Mahad", "Yes, adjusted by 1 inch. Shayan noted.", "Oct 25, 11:30"),
    ],
  },
  {
    id: "SS-1041", customer: "Bilal Ahmed", garment: "Three-piece suit", fabric: "Wool blend, charcoal",
    worker: "Rashid", due: "Oct 30", price: 32000, paid: 32000, stage: "fitting",
    measurements: { Chest: "40\"", Waist: "34\"", Shoulder: "18\"", Inseam: "31\"" },
    notes: "Peak lapels, two buttons, side vents.",
    timeline: [
      ev("customer", "Bilal Ahmed", "Placed order for a 3-piece suit.", "Oct 8, 14:00", "placed"),
      ev("tailor", "Master Mahad", "Measurements taken.", "Oct 8, 14:30", "measured"),
      ev("worker", "Rashid", "Cutting done.", "Oct 11, 10:00", "cutting"),
      ev("worker", "Rashid", "Stitching complete.", "Oct 21, 18:20", "stitching"),
      ev("tailor", "Master Mahad", "Trial fitting booked for Oct 27.", "Oct 23, 12:00", "fitting"),
    ],
  },
  {
    id: "SS-1039", customer: "Sana Mir", garment: "Shalwar Kameez ×3", fabric: "Lawn, printed",
    worker: "Shayan", due: "Oct 28", price: 9000, paid: 9000, stage: "ready",
    measurements: { Chest: "36\"", Waist: "30\"", Length: "40\"" },
    notes: "Same pattern as last order.",
    timeline: [
      ev("customer", "Sana Mir", "Placed order for 3 suits.", "Oct 15, 11:00", "placed"),
      ev("tailor", "Master Mahad", "Used saved measurements.", "Oct 15, 11:10", "measured"),
      ev("worker", "Shayan", "All three cut.", "Oct 17, 15:00", "cutting"),
      ev("worker", "Shayan", "Stitching finished.", "Oct 23, 17:45", "stitching"),
      ev("tailor", "Master Mahad", "Quality checked, ready for pickup.", "Oct 25, 13:00", "ready"),
    ],
  },
  {
    id: "SS-1036", customer: "Hamza Raza", garment: "Sherwani", fabric: "Jamawar, ivory",
    worker: "Rashid", due: "Nov 12", price: 55000, paid: 20000, stage: "measured",
    measurements: { Chest: "42\"", Waist: "36\"", Length: "44\"", Sleeve: "25\"" },
    notes: "Matching khussa to be sourced separately.",
    timeline: [
      ev("customer", "Hamza Raza", "Placed order for a sherwani.", "Oct 20, 18:00", "placed"),
      ev("tailor", "Master Mahad", "Measurements taken, fabric approved.", "Oct 21, 12:00", "measured"),
    ],
  },
  {
    id: "SS-1030", customer: "Fatima Noor", garment: "Abaya", fabric: "Nida, black",
    worker: "Shayan", due: "Oct 20", price: 7500, paid: 7500, stage: "delivered",
    measurements: { Length: "56\"", Chest: "38\"" },
    notes: "",
    timeline: [
      ev("customer", "Fatima Noor", "Placed order.", "Oct 5, 10:00", "placed"),
      ev("tailor", "Master Mahad", "Delivered to customer.", "Oct 20, 17:00", "delivered"),
    ],
  },
];

export const ROLE_PERSONA: Record<Role, string> = {
  customer: "Areeba",
  tailor: "Master Mahad",
  worker: "Shayan",
};

export function stageIndex(s: Stage) {
  return STAGES.findIndex((x) => x.key === s);
}

/** Which orders each role sees. */
export function visibleOrders(orders: Order[], role: Role) {
  if (role === "customer") return orders.filter((o) => o.customer === ROLE_PERSONA.customer);
  if (role === "worker") return orders.filter((o) => o.worker === ROLE_PERSONA.worker);
  return orders;
}

export function stageLabel(s: Stage) {
  return STAGES[stageIndex(s)]?.label ?? s;
}
