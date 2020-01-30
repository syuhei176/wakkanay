import PropertyFilter from './PropertyFilter'
import { Address, Bytes } from '@cryptoeconomicslab/primitives'

/**
 * Builder class to build PropertyFilter
 */
export default class PropertyFilterBuilder {
  constructor(
    private _address?: Address,
    private _inputs?: Array<Bytes | undefined>,
    private _child?: PropertyFilter,
    private _children?: Array<PropertyFilter | undefined>
  ) {}

  public address(address: Address): PropertyFilterBuilder {
    return new PropertyFilterBuilder(address, this._inputs, this._child)
  }

  public inputs(inputs: Array<Bytes | undefined>): PropertyFilterBuilder {
    return new PropertyFilterBuilder(this._address, inputs, this._child)
  }

  public child(propertyFilter: PropertyFilter): PropertyFilterBuilder {
    return new PropertyFilterBuilder(
      this._address,
      this._inputs,
      propertyFilter
    )
  }

  public children(
    filters: Array<PropertyFilter | undefined>
  ): PropertyFilterBuilder {
    return new PropertyFilterBuilder(
      this._address,
      this._inputs,
      this._child,
      filters
    )
  }

  public build(): PropertyFilter {
    if (!this._address)
      throw new Error('Cannot build without address specified')

    return new PropertyFilter(
      this._address,
      this._inputs || [],
      this._child,
      this._children
    )
  }
}
