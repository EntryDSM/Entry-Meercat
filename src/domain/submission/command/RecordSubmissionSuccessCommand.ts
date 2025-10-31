export class RecordSubmissionSuccessCommand {
  constructor(
    public readonly sessionId: string,
    public readonly submissionId: number,
  ) {}
}
