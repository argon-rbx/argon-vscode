export type SessionType = "Serve" | "Build" | "Sourcemap"

export class Session {
  public type: SessionType = "Serve"
  public name: string
  public project: string
  public id: number
  public address?: string
  public originalPort?: number

  public constructor(name: string, project: string, id: number) {
    this.name = name
    this.project = project
    this.id = id
  }

  public withType(type: SessionType) {
    this.type = type

    return this
  }

  public withAddress(address: string, originalPort?: number) {
    this.address = address
    this.originalPort = originalPort

    return this
  }

  public isSimilar(other: Session) {
    return this.type === other.type && this.project === other.project
  }
}

export class RestorableSession {
  public type: SessionType
  public project: string
  public address?: string
  public originalPort?: number

  private isComplete: boolean = true

  public constructor(session: Session | any) {
    if (session instanceof Session) {
      this.type = session.type
      this.project = session.project
      this.address = session.address
      this.originalPort = session.originalPort
    } else {
      if (!session || !session.type || !session.project) {
        this.isComplete = false
        this.type = "Serve"
        this.project = ""

        return
      }

      this.type = session.type
      this.project = session.project
      this.address = session.address
      this.originalPort = session.originalPort
    }
  }

  public isRestorable() {
    return this.isComplete
  }

  public needsStudio() {
    return this.type === "Serve" || this.type === "Build"
  }
}
