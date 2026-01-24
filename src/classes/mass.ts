export class Mass {
  massTime: string;
  massDate: string;
  massLocation: string;
  massContent: string;
  massRoles: string;

  constructor(
    massTime: string,
    massDate: string,
    massLocation: string,
    massContent: string,
    massRoles: string
  ) {
    this.massTime = massTime;
    this.massDate = massDate;
    this.massLocation = massLocation;
    this.massContent = massContent;
    this.massRoles = massRoles;
  }
}
