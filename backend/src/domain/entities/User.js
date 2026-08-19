export class User {
  constructor({
    id = null,
    username,
    passwordHash,
    fullName,
    role = 'admin',
    isActive = true,
    createdAt = new Date(),
    lastLoginAt = null
  }) {
    this.id = id;
    this.username = String(username).toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.fullName = fullName;
    this.role = role;
    this.isActive = Boolean(isActive);
    this.createdAt = createdAt;
    this.lastLoginAt = lastLoginAt;
  }
}
