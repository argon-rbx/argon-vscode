export type SessionType = 'Serve' | 'Build' | 'Sourcemap'

export class Session {
  public type: SessionType = 'Serve'
  public name: string
  public project: string
  public id: number
  public address: string | undefined

  public constructor(name: string, project: string, id: number) {
    this.name = name
    this.project = project
    this.id = id
  }

  public withType(type: SessionType) {
    this.type = type
    return this
  }

  public withAddress(address: string) {
    this.address = address
    return this
  }
}
