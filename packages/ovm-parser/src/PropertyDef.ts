export interface Program {
  imports: Import[]
  declarations: PropertyDef[]
}

export interface Import {
  path: string
  module: string
}

export interface Annotation {
  type: 'Annotation'
  body: {
    name: string
    args: string[]
  }
}

/**
 * Parsed Property definition
 */
export interface PropertyDef {
  annotations: Annotation[]
  name: string
  inputDefs: string[]
  body: PropertyNode
}

export interface PropertyNode {
  type: 'PropertyNode'
  predicate: string
  inputs: Input[]
}

type Input = string | PropertyNode | undefined
