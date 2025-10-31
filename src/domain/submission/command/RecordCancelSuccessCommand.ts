export class RecordCancelSuccessCommand {
  constructor(
    public readonly sessionId: string,
    public readonly submissionId: number,
  ) {}
}
