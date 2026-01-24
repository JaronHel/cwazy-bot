import { Mass } from "../classes/mass";
import { formatRoles } from "../utils/utils";

export function createMassMessage(mass: Mass) {
  return `Mass time: ${mass.massTime} UTC
Mass date: ${mass.massDate}
Mass location: ${mass.massLocation}
Mass content: ${mass.massContent}

${formatRoles(mass)}
---

Signed: null
`;
}
