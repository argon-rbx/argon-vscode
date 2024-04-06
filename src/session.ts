export class Session {
  private started = Date.now()

  public name: string
  public project: string
  public id: number
  public address: string | undefined

  public constructor(name: string, project: string, id: number) {
    this.name = name
    this.project = project
    this.id = id
  }

  public withAddress(address: string) {
    this.address = address
    return this
  }

  public get duration() {
    return Date.now() - this.started
  }
}
