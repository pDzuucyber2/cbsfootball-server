


import { Client, Account, Databases, ID } from "appwrite";

const client = new Client();

client
.setEndpoint("https://fra.cloud.appwrite.io/v1")
.setProject("cbsfootball");

export const account = new Account(client);
export const databases = new Databases(client);

export { ID };

