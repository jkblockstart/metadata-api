export interface MetaDataInterface extends AttributeDataIn {
  nft: string
  nftId: number
  attributes?: AttributeDataIn[]
}

export interface AttributeDataIn {
  attribute: string
  value: string
}

export interface QueryIn {
  nft: string
  nftId: number
}
