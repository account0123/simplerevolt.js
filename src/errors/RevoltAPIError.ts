import { Error as APIError } from "revolt-api";

export class RevoltAPIError extends Error {
  public constructor(
    public rawError: APIError,
    public status: number,
    public method: string,
    public url: string,
  ) {
    super(RevoltAPIError.getMessage(rawError));
  }

  /**
   * The name of the error
   */
  public override get name(): string {
    return `${RevoltAPIError.name}[${this.status}]`;
  }

  private static getMessage(error: APIError) {
    if ("type" in error) {
      switch (error.type) {
        case "MissingPermission":
        case "MissingUserPermission":
          return `${error.type} [${error.permission}]`;
        case "FileTooLarge":
        case "GroupTooLarge":
        case "TooManyAttachments":
        case "TooManyChannels":
        case "TooManyEmbeds":
        case "TooManyEmoji":
        case "TooManyPendingFriendRequests":
        case "TooManyReplies":
        case "TooManyRoles":
        case "TooManyServers":
          return `${error.type} (${error.max})`;
        default:
          const { type, location, ...data } = error;
          return `${error.type}\n\n${JSON.stringify(data)}`;
      }
    }

    return "No Description";
  }
}
