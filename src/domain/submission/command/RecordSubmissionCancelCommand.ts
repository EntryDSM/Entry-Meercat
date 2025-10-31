export class RecordSubmissionCancelCommand {
  constructor(
    public readonly sessionId: string,
    public readonly submissionId: number,
    public readonly reason?: string,
  ) {}
}
