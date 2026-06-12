export class OperationalEventEntity {
  public id: number;
  public projectId: number;
  public cycleId: number | null;
  public phaseId: number | null;
  public eventType: string;
  public message: string;
  public payloadJson: string;
  public createdAt: string;

  constructor() {
    this.id = 0;
    this.projectId = 0;
    this.cycleId = null;
    this.phaseId = null;
    this.eventType = "";
    this.message = "";
    this.payloadJson = "{}";
    this.createdAt = "";
  }
}
