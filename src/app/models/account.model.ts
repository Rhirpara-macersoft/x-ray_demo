export interface Account {
  id: string;
  token: {
    value: string;
  };
  // Add other account properties as needed
}

export interface Campaign {
  id?: string;
  name?: string;
  show_campaign?: boolean;
  // Add other campaign properties as needed
}
