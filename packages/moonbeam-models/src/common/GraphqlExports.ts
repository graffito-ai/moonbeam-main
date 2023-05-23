export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: string;
  AWSDateTime: string;
  AWSEmail: string;
  AWSIPAddress: string;
  AWSJSON: string;
  AWSPhone: string;
  AWSTime: string;
  AWSTimestamp: number;
  AWSURL: string;
};

export type File = {
  __typename?: 'File';
  url: Scalars['String'];
};

export enum FileAccessLevel {
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Public = 'PUBLIC'
}

export enum FileType {
  Main = 'MAIN'
}

export type GetStorageInput = {
  expires?: InputMaybe<Scalars['Boolean']>;
  level: FileAccessLevel;
  name: Scalars['String'];
  type: FileType;
};

export type Mutation = {
  __typename?: 'Mutation';
  putStorage?: Maybe<StorageResponse>;
};


export type MutationPutStorageArgs = {
  putStorageInput: PutStorageInput;
};

export type PutStorageInput = {
  content: Scalars['String'];
  expires?: InputMaybe<Scalars['Boolean']>;
  level: FileAccessLevel;
  name: Scalars['String'];
  type: FileType;
};

export type Query = {
  __typename?: 'Query';
  getStorage?: Maybe<StorageResponse>;
};


export type QueryGetStorageArgs = {
  getStorageInput: GetStorageInput;
};

export enum StorageErrorType {
  DuplicateObjectFound = 'DUPLICATE_OBJECT_FOUND',
  NoneOrAbsent = 'NONE_OR_ABSENT',
  RestrictedAccess = 'RESTRICTED_ACCESS',
  UnexpectedError = 'UNEXPECTED_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type StorageResponse = {
  __typename?: 'StorageResponse';
  data?: Maybe<File>;
  errorMessage?: Maybe<Scalars['String']>;
  errorType?: Maybe<StorageErrorType>;
};

export type GetStorageQueryVariables = Exact<{
  getStorageInput: GetStorageInput;
}>;


export type GetStorageQuery = { __typename?: 'Query', getStorage?: { __typename?: 'StorageResponse', errorMessage?: string | null, errorType?: StorageErrorType | null, data?: { __typename?: 'File', url: string } | null } | null };
