import { Mass } from "../classes/mass";

export function formatRoles(mass: Mass) {
  const rolesArray = mass.massRoles.split("\n");
  let index = 1;
  let formatedRoles = "";
  for (const role of rolesArray) {
    formatedRoles = formatedRoles + `${index}. ${role}\n`;
  }
  return formatedRoles;
}
