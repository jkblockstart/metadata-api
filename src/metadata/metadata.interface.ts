export interface MetaDataIn extends AttributeDataIn {
  id: string;
  nft: string;
  nftId: number;
  attributes?: AttributeDataIn[];
}

export interface AttributeDataIn {
  attribute: string;
  value: string;
}

export interface QueryIn {
  nft: string;
  nftId: number;
}
