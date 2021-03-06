import { IWallet } from '../interfaces/IWallet'
import * as ethers from 'ethers'
import { arrayify, joinSignature, SigningKey } from 'ethers/utils'
import { Address, Bytes } from '../../types/Codables'
import { IDepositContract } from '../../contract'
import { DepositContract } from '../../contract/eth/DepositContract'

export class EthWallet implements IWallet {
  private ethersWallet: ethers.Wallet
  private signingKey: SigningKey
  constructor(ethersWallet: ethers.Wallet) {
    this.ethersWallet = ethersWallet
    this.signingKey = new SigningKey(this.ethersWallet.privateKey)
  }
  public getAddress(): Address {
    return Address.from(this.signingKey.address)
  }
  /**
   * recoverAddress
   */
  public recoverAddress(message: Bytes, signatureBytes: Bytes): Address {
    const signature = ethers.utils.splitSignature(signatureBytes.toHexString())
    const recoverAddress = ethers.utils.recoverAddress(
      message.toHexString(),
      signature
    )
    return Address.from(recoverAddress)
  }

  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  public signMessage(message: Bytes): Bytes {
    return Bytes.fromHexString(
      joinSignature(this.signingKey.signDigest(arrayify(message.toHexString())))
    )
  }
  public getDepositContract(address: Address): IDepositContract {
    return new DepositContract(this.getConnection(address, DepositContract.abi))
  }
  /**
   * Get contract instance which connecting by this wallet.
   * @param wallet
   * @param contractAddress
   * @param abi
   */
  private getConnection(contractAddress: Address, abi: string[]) {
    const ethersWallet = this.ethersWallet
    const contract = new ethers.Contract(
      contractAddress.data,
      abi,
      ethersWallet.provider
    )
    return contract.connect(ethersWallet)
  }
}
