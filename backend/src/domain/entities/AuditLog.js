export class AuditLog {
  constructor({
    id = null,
    action,
    userIdentifier = null,
    role = null,
    details = null,
    ipAddress = null,
    userAgent = null,
    createdAt = new Date()
  }) {
    this.id = id;
    this.action = action;
    this.userIdentifier = userIdentifier;
    this.role = role;
    this.details = typeof details === 'object' ? JSON.stringify(details) : details;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.createdAt = createdAt;
  }
}
